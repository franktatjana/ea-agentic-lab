"""
Filesystem Connector

Reads markdown notes from the local vault/infohub directory structure.

Expected structure:
    vault/infohub/{realm_id}/{node_id}/
        ├── meetings/
        │   ├── external/
        │   └── internal/
        ├── decisions/
        ├── risks/
        └── actions/
"""

import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

from .base import BaseConnector, ConnectorType, Note
from ..tools.markdown_tools import parse_markdown_with_frontmatter


class FilesystemConnector(BaseConnector):
    """
    Connector for reading notes from local filesystem.

    Configuration:
        root_path: Path to infohub directory (default: vault/infohub)
    """

    @property
    def connector_type(self) -> ConnectorType:
        return ConnectorType.FILESYSTEM

    def _validate_config(self) -> None:
        """Validate configuration"""
        # Set default root path if not provided
        if 'root_path' not in self.config:
            # Default to project's vault/infohub
            from ..config.paths import INFOHUB_ROOT
            self.config['root_path'] = INFOHUB_ROOT

        self.root_path = Path(self.config['root_path'])

    def test_connection(self) -> bool:
        """Test if root path exists and is accessible"""
        return self.root_path.exists() and self.root_path.is_dir()

    def get_realms(self) -> List[str]:
        """List available realms (directories in root)"""
        if not self.test_connection():
            return []

        realms = []
        for item in self.root_path.iterdir():
            if item.is_dir() and not item.name.startswith('.'):
                realms.append(item.name)
        return sorted(realms)

    def get_nodes(self, realm_id: str) -> List[str]:
        """List nodes within a realm"""
        realm_path = self.root_path / realm_id
        if not realm_path.exists():
            return []

        nodes = []
        for item in realm_path.iterdir():
            if item.is_dir() and not item.name.startswith('.'):
                # Skip standard subdirs that aren't nodes
                if item.name not in ['meetings', 'decisions', 'risks', 'actions', 'stakeholders']:
                    nodes.append(item.name)
        return sorted(nodes)

    def fetch_notes(
        self,
        realm_id: Optional[str] = None,
        node_id: Optional[str] = None,
        since: Optional[datetime] = None,
        note_types: Optional[List[str]] = None,
        limit: Optional[int] = None
    ) -> List[Note]:
        """
        Fetch notes from filesystem.

        Args:
            realm_id: Filter by realm directory
            node_id: Filter by node directory within realm
            since: Only include files modified after this time
            note_types: Filter by subdirectory (meetings, decisions, etc.)
            limit: Maximum notes to return
        """
        notes = []

        # Determine search path
        if realm_id and node_id:
            search_path = self.root_path / realm_id / node_id
        elif realm_id:
            search_path = self.root_path / realm_id
        else:
            search_path = self.root_path

        if not search_path.exists():
            return []

        # Find all markdown files
        md_files = list(search_path.glob('**/*.md'))

        for md_file in sorted(md_files, key=lambda f: f.stat().st_mtime, reverse=True):
            # Apply since filter
            if since:
                file_mtime = datetime.fromtimestamp(md_file.stat().st_mtime)
                if file_mtime < since:
                    continue

            # Apply note_types filter (based on parent directory)
            if note_types:
                parent_dir = md_file.parent.name
                # Check if any part of path matches note_types
                path_parts = [p.name for p in md_file.relative_to(search_path).parents]
                if not any(nt in path_parts or nt == parent_dir for nt in note_types):
                    continue

            # Parse the file
            try:
                note = self._parse_file(md_file, realm_id, node_id)
                if note:
                    notes.append(note)
            except Exception as e:
                print(f"Warning: Could not parse {md_file}: {e}")
                continue

            # Apply limit
            if limit and len(notes) >= limit:
                break

        return notes

    def _parse_file(
        self,
        file_path: Path,
        realm_id: Optional[str],
        node_id: Optional[str]
    ) -> Optional[Note]:
        """Parse a markdown file into a Note"""
        parsed = parse_markdown_with_frontmatter(file_path)

        # Extract metadata from frontmatter
        frontmatter = parsed.get('frontmatter', {})
        content = parsed.get('content', '')
        tags = parsed.get('tags', [])

        # Determine note type from path
        note_type = self._infer_note_type(file_path)

        # Extract realm/node from path if not provided
        if not realm_id or not node_id:
            detected_realm, detected_node = self._extract_realm_node(file_path)
            realm_id = realm_id or detected_realm
            node_id = node_id or detected_node

        # Extract date from filename or frontmatter
        date = self._extract_date(file_path, frontmatter)

        # Build Note object
        return Note(
            id=str(file_path),
            title=self._extract_title(content, file_path),
            content=content,
            source=ConnectorType.FILESYSTEM,
            source_url=f"file://{file_path}",
            created_at=date,
            updated_at=datetime.fromtimestamp(file_path.stat().st_mtime),
            author=frontmatter.get('author'),
            realm_id=realm_id,
            node_id=node_id,
            tags=tags,
            note_type=note_type,
            participants=frontmatter.get('participants', []),
            raw_metadata=frontmatter
        )

    def _infer_note_type(self, file_path: Path) -> str:
        """Infer note type from file path"""
        path_str = str(file_path).lower()

        if 'meeting' in path_str:
            if 'external' in path_str:
                return 'external_meeting'
            elif 'internal' in path_str:
                return 'internal_meeting'
            return 'meeting'
        elif 'decision' in path_str:
            return 'decision'
        elif 'risk' in path_str:
            return 'risk'
        elif 'action' in path_str:
            return 'action'
        elif 'stakeholder' in path_str:
            return 'stakeholder'

        return 'note'

    def _extract_realm_node(self, file_path: Path) -> tuple:
        """Extract realm and node from file path"""
        try:
            rel_path = file_path.relative_to(self.root_path)
            parts = rel_path.parts

            if len(parts) >= 2:
                return parts[0], parts[1]
            elif len(parts) == 1:
                return parts[0], None
        except ValueError:
            pass

        return None, None

    def _extract_date(self, file_path: Path, frontmatter: Dict) -> Optional[datetime]:
        """Extract date from filename or frontmatter"""
        # Try frontmatter first
        if 'date' in frontmatter:
            try:
                if isinstance(frontmatter['date'], datetime):
                    return frontmatter['date']
                return datetime.fromisoformat(str(frontmatter['date']))
            except (ValueError, TypeError):
                pass

        # Try filename pattern (YYYY-MM-DD)
        match = re.search(r'(\d{4}-\d{2}-\d{2})', file_path.name)
        if match:
            try:
                return datetime.strptime(match.group(1), '%Y-%m-%d')
            except ValueError:
                pass

        # Fall back to file modification time
        return datetime.fromtimestamp(file_path.stat().st_mtime)

    def _extract_title(self, content: str, file_path: Path) -> str:
        """Extract title from content or filename"""
        # Look for H1 header
        match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        if match:
            return match.group(1).strip()

        # Fall back to filename
        return file_path.stem.replace('_', ' ').replace('-', ' ').title()
