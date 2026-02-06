"""
Google Drive Connector

Fetches documents from Google Drive:
- Google Docs (meeting notes, decisions)
- Google Sheets (risk registers, action trackers)
- Markdown files

IMPORTANT: Requires Google OAuth setup:
1. Create a Google Cloud project
2. Enable Google Drive API
3. Create OAuth credentials (Desktop app)
4. Download credentials.json to config/

Mapping:
    - Realm = Shared Drive or top-level folder
    - Node = Subfolder within realm
"""

from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path

from .base import BaseConnector, ConnectorType, Note


class GoogleDriveConnector(BaseConnector):
    """
    Connector for fetching documents from Google Drive.

    Configuration:
        credentials_path: Path to OAuth credentials.json
        token_path: Path to store OAuth token
        folder_id: Root folder ID to search (optional)
        include_docs: Fetch Google Docs (default: True)
        include_sheets: Fetch Google Sheets (default: True)
        include_md: Fetch .md files (default: True)

    SETUP REQUIRED:
        1. pip install google-auth-oauthlib google-auth-httplib2 google-api-python-client
        2. Download credentials.json from Google Cloud Console
        3. Run connector.authorize() to complete OAuth flow
    """

    SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

    @property
    def connector_type(self) -> ConnectorType:
        return ConnectorType.GOOGLE_DRIVE

    def _validate_config(self) -> None:
        """Validate configuration"""
        self.credentials_path = Path(self.config.get('credentials_path', 'config/google_credentials.json'))
        self.token_path = Path(self.config.get('token_path', 'config/google_token.json'))
        self.folder_id = self.config.get('folder_id')
        self.include_docs = self.config.get('include_docs', True)
        self.include_sheets = self.config.get('include_sheets', True)
        self.include_md = self.config.get('include_md', True)

        self._service = None

    def test_connection(self) -> bool:
        """Test if Google Drive is accessible"""
        if not self._check_dependencies():
            return False

        try:
            service = self._get_service()
            # Try to list files (limit 1)
            service.files().list(pageSize=1).execute()
            return True
        except Exception:
            return False

    def _check_dependencies(self) -> bool:
        """Check if required packages are installed"""
        try:
            import google.auth
            from google.oauth2.credentials import Credentials
            from googleapiclient.discovery import build
            return True
        except ImportError:
            return False

    def _get_service(self):
        """Get authenticated Google Drive service"""
        if self._service:
            return self._service

        try:
            from google.oauth2.credentials import Credentials
            from google_auth_oauthlib.flow import InstalledAppFlow
            from googleapiclient.discovery import build
            from google.auth.transport.requests import Request
        except ImportError:
            raise RuntimeError(
                "Google Drive connector requires google packages. "
                "Install with: pip install google-auth-oauthlib google-auth-httplib2 google-api-python-client"
            )

        creds = None

        # Load existing token
        if self.token_path.exists():
            creds = Credentials.from_authorized_user_file(str(self.token_path), self.SCOPES)

        # Refresh or get new credentials
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not self.credentials_path.exists():
                    raise FileNotFoundError(
                        f"Credentials file not found: {self.credentials_path}. "
                        "Download from Google Cloud Console."
                    )
                flow = InstalledAppFlow.from_client_secrets_file(
                    str(self.credentials_path), self.SCOPES
                )
                creds = flow.run_local_server(port=0)

            # Save token for next time
            self.token_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.token_path, 'w') as token:
                token.write(creds.to_json())

        self._service = build('drive', 'v3', credentials=creds)
        return self._service

    def authorize(self) -> bool:
        """
        Run OAuth authorization flow.

        Call this once to set up credentials.
        """
        try:
            self._get_service()
            print("✓ Google Drive authorized successfully")
            return True
        except Exception as e:
            print(f"✗ Authorization failed: {e}")
            return False

    def get_realms(self) -> List[str]:
        """List shared drives or top-level folders"""
        if not self._check_dependencies():
            return []

        try:
            service = self._get_service()

            # Try to list shared drives first
            drives = service.drives().list().execute()
            realms = [d['name'] for d in drives.get('drives', [])]

            # If no shared drives, list top-level folders
            if not realms and self.folder_id:
                query = f"'{self.folder_id}' in parents and mimeType='application/vnd.google-apps.folder'"
                results = service.files().list(q=query).execute()
                realms = [f['name'] for f in results.get('files', [])]

            return realms
        except Exception:
            return []

    def get_nodes(self, realm_id: str) -> List[str]:
        """List folders within a realm"""
        if not self._check_dependencies():
            return []

        try:
            service = self._get_service()

            # Find the realm folder
            realm_folder = self._find_folder(realm_id)
            if not realm_folder:
                return []

            # List subfolders
            query = f"'{realm_folder['id']}' in parents and mimeType='application/vnd.google-apps.folder'"
            results = service.files().list(q=query).execute()
            return [f['name'] for f in results.get('files', [])]
        except Exception:
            return []

    def fetch_notes(
        self,
        realm_id: Optional[str] = None,
        node_id: Optional[str] = None,
        since: Optional[datetime] = None,
        note_types: Optional[List[str]] = None,
        limit: Optional[int] = None
    ) -> List[Note]:
        """
        Fetch documents from Google Drive.

        Args:
            realm_id: Folder name to search in
            node_id: Subfolder name
            since: Only fetch files modified after this time
            note_types: Filter by type ('doc', 'sheet', 'md')
            limit: Maximum files to return
        """
        if not self._check_dependencies():
            raise RuntimeError("Google Drive packages not installed")

        notes = []

        try:
            service = self._get_service()

            # Build search query
            query_parts = []

            # File type filters
            mime_types = []
            if self.include_docs and (not note_types or 'doc' in note_types):
                mime_types.append("application/vnd.google-apps.document")
            if self.include_sheets and (not note_types or 'sheet' in note_types):
                mime_types.append("application/vnd.google-apps.spreadsheet")
            if self.include_md and (not note_types or 'md' in note_types):
                query_parts.append("name contains '.md'")

            if mime_types:
                mime_query = " or ".join([f"mimeType='{m}'" for m in mime_types])
                query_parts.append(f"({mime_query})")

            # Folder filter
            folder_id = None
            if realm_id:
                realm_folder = self._find_folder(realm_id)
                if realm_folder and node_id:
                    node_folder = self._find_folder(node_id, parent_id=realm_folder['id'])
                    if node_folder:
                        folder_id = node_folder['id']
                elif realm_folder:
                    folder_id = realm_folder['id']

            if folder_id:
                query_parts.append(f"'{folder_id}' in parents")

            # Time filter
            if since:
                since_str = since.strftime('%Y-%m-%dT%H:%M:%S')
                query_parts.append(f"modifiedTime > '{since_str}'")

            # Build final query
            query = " and ".join(query_parts) if query_parts else None

            # Execute search
            results = service.files().list(
                q=query,
                pageSize=limit or 100,
                fields="files(id,name,mimeType,modifiedTime,createdTime,webViewLink,owners)"
            ).execute()

            for file in results.get('files', []):
                note = self._file_to_note(file, service, realm_id, node_id)
                if note:
                    notes.append(note)

        except Exception as e:
            print(f"Warning: Could not fetch from Google Drive: {e}")

        return notes

    def _find_folder(self, name: str, parent_id: Optional[str] = None) -> Optional[Dict]:
        """Find a folder by name"""
        service = self._get_service()

        query = f"name='{name}' and mimeType='application/vnd.google-apps.folder'"
        if parent_id:
            query += f" and '{parent_id}' in parents"

        results = service.files().list(q=query, pageSize=1).execute()
        files = results.get('files', [])
        return files[0] if files else None

    def _file_to_note(
        self,
        file: Dict,
        service,
        realm_id: Optional[str],
        node_id: Optional[str]
    ) -> Optional[Note]:
        """Convert Google Drive file to Note"""
        mime_type = file.get('mimeType', '')

        # Get content
        content = self._get_file_content(file['id'], mime_type, service)
        if content is None:
            return None

        # Determine note type
        if 'spreadsheet' in mime_type:
            note_type = 'spreadsheet'
        elif 'document' in mime_type:
            note_type = 'document'
        else:
            note_type = 'file'

        # Parse dates
        created = self._parse_datetime(file.get('createdTime'))
        updated = self._parse_datetime(file.get('modifiedTime'))

        # Get author
        owners = file.get('owners', [])
        author = owners[0].get('displayName') if owners else None

        return Note(
            id=f"gdrive:{file['id']}",
            title=file['name'],
            content=content,
            source=ConnectorType.GOOGLE_DRIVE,
            source_url=file.get('webViewLink'),
            created_at=created,
            updated_at=updated,
            author=author,
            realm_id=realm_id,
            node_id=node_id,
            tags=['google-drive', note_type],
            note_type=note_type,
            raw_metadata=file
        )

    def _get_file_content(self, file_id: str, mime_type: str, service) -> Optional[str]:
        """Get text content from a file"""
        try:
            if 'document' in mime_type:
                # Export Google Doc as plain text
                content = service.files().export(
                    fileId=file_id,
                    mimeType='text/plain'
                ).execute()
                return content.decode('utf-8') if isinstance(content, bytes) else content

            elif 'spreadsheet' in mime_type:
                # Export first sheet as CSV (simplified)
                content = service.files().export(
                    fileId=file_id,
                    mimeType='text/csv'
                ).execute()
                return content.decode('utf-8') if isinstance(content, bytes) else content

            else:
                # Try to download as-is (for .md files)
                content = service.files().get_media(fileId=file_id).execute()
                return content.decode('utf-8') if isinstance(content, bytes) else content

        except Exception as e:
            print(f"Warning: Could not get content for {file_id}: {e}")
            return None

    def _parse_datetime(self, dt_str: Optional[str]) -> Optional[datetime]:
        """Parse ISO datetime string"""
        if not dt_str:
            return None
        try:
            return datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            return None
