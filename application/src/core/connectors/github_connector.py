"""
GitHub Connector

Fetches data from GitHub repositories:
- Issues (as meeting notes, decisions, risks)
- Pull Requests (as technical decisions)
- Discussions (as meeting notes)
- Wiki pages (as documentation)

Uses the `gh` CLI for authentication (must be installed and authenticated).

Mapping:
    - Realm = GitHub Organization or Owner
    - Node = Repository name
"""

import subprocess
import json
from datetime import datetime
from typing import Dict, List, Any, Optional

from .base import BaseConnector, ConnectorType, Note


class GitHubConnector(BaseConnector):
    """
    Connector for fetching notes from GitHub.

    Configuration:
        owner: GitHub organization or user (default: from gh CLI)
        repo: Repository name (optional, can be specified per-fetch)
        include_issues: Fetch issues (default: True)
        include_prs: Fetch pull requests (default: True)
        include_discussions: Fetch discussions (default: True)
        labels: Filter by labels (optional)
    """

    @property
    def connector_type(self) -> ConnectorType:
        return ConnectorType.GITHUB

    def _validate_config(self) -> None:
        """Validate configuration"""
        self.owner = self.config.get('owner')
        self.repo = self.config.get('repo')
        self.include_issues = self.config.get('include_issues', True)
        self.include_prs = self.config.get('include_prs', True)
        self.include_discussions = self.config.get('include_discussions', True)
        self.labels = self.config.get('labels', [])

    def test_connection(self) -> bool:
        """Test if gh CLI is available and authenticated"""
        try:
            result = subprocess.run(
                ['gh', 'auth', 'status'],
                capture_output=True,
                text=True,
                timeout=10
            )
            return result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False

    def get_realms(self) -> List[str]:
        """List organizations the user has access to"""
        try:
            result = subprocess.run(
                ['gh', 'api', 'user/orgs', '--jq', '.[].login'],
                capture_output=True,
                text=True,
                timeout=30
            )
            if result.returncode == 0:
                orgs = result.stdout.strip().split('\n')
                return [o for o in orgs if o]
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass
        return []

    def get_nodes(self, realm_id: str) -> List[str]:
        """List repositories in an organization"""
        try:
            result = subprocess.run(
                ['gh', 'repo', 'list', realm_id, '--json', 'name', '--jq', '.[].name'],
                capture_output=True,
                text=True,
                timeout=30
            )
            if result.returncode == 0:
                repos = result.stdout.strip().split('\n')
                return [r for r in repos if r]
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass
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
        Fetch notes from GitHub.

        Args:
            realm_id: GitHub owner/organization
            node_id: Repository name
            since: Only fetch items updated after this time
            note_types: Filter by type ('issue', 'pr', 'discussion')
            limit: Maximum items to return
        """
        owner = realm_id or self.owner
        repo = node_id or self.repo

        if not owner or not repo:
            raise ValueError("GitHub connector requires owner and repo (realm_id and node_id)")

        notes = []
        repo_full = f"{owner}/{repo}"

        # Determine what to fetch
        fetch_issues = self.include_issues and (not note_types or 'issue' in note_types)
        fetch_prs = self.include_prs and (not note_types or 'pr' in note_types)
        fetch_discussions = self.include_discussions and (not note_types or 'discussion' in note_types)

        # Fetch issues
        if fetch_issues:
            issues = self._fetch_issues(repo_full, since, limit)
            notes.extend(issues)

        # Fetch PRs
        if fetch_prs:
            prs = self._fetch_prs(repo_full, since, limit)
            notes.extend(prs)

        # Fetch discussions
        if fetch_discussions:
            discussions = self._fetch_discussions(repo_full, since, limit)
            notes.extend(discussions)

        # Sort by updated time
        notes.sort(key=lambda n: n.updated_at or datetime.min, reverse=True)

        # Apply overall limit
        if limit:
            notes = notes[:limit]

        return notes

    def _fetch_issues(self, repo: str, since: Optional[datetime], limit: Optional[int]) -> List[Note]:
        """Fetch issues from repository"""
        notes = []

        try:
            cmd = [
                'gh', 'issue', 'list',
                '--repo', repo,
                '--state', 'all',
                '--json', 'number,title,body,author,labels,createdAt,updatedAt,url,state',
                '--limit', str(limit or 100)
            ]

            # Add label filter if configured
            for label in self.labels:
                cmd.extend(['--label', label])

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)

            if result.returncode == 0 and result.stdout.strip():
                issues = json.loads(result.stdout)

                for issue in issues:
                    # Apply since filter
                    updated = self._parse_datetime(issue.get('updatedAt'))
                    if since and updated and updated < since:
                        continue

                    note = self._issue_to_note(issue, repo)
                    notes.append(note)

        except (subprocess.TimeoutExpired, FileNotFoundError, json.JSONDecodeError) as e:
            print(f"Warning: Could not fetch issues from {repo}: {e}")

        return notes

    def _fetch_prs(self, repo: str, since: Optional[datetime], limit: Optional[int]) -> List[Note]:
        """Fetch pull requests from repository"""
        notes = []

        try:
            cmd = [
                'gh', 'pr', 'list',
                '--repo', repo,
                '--state', 'all',
                '--json', 'number,title,body,author,labels,createdAt,updatedAt,url,state',
                '--limit', str(limit or 100)
            ]

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)

            if result.returncode == 0 and result.stdout.strip():
                prs = json.loads(result.stdout)

                for pr in prs:
                    updated = self._parse_datetime(pr.get('updatedAt'))
                    if since and updated and updated < since:
                        continue

                    note = self._pr_to_note(pr, repo)
                    notes.append(note)

        except (subprocess.TimeoutExpired, FileNotFoundError, json.JSONDecodeError) as e:
            print(f"Warning: Could not fetch PRs from {repo}: {e}")

        return notes

    def _fetch_discussions(self, repo: str, since: Optional[datetime], limit: Optional[int]) -> List[Note]:
        """Fetch discussions from repository"""
        notes = []

        try:
            # Discussions require GraphQL API
            query = '''
            query($owner: String!, $repo: String!, $limit: Int!) {
              repository(owner: $owner, name: $repo) {
                discussions(first: $limit, orderBy: {field: UPDATED_AT, direction: DESC}) {
                  nodes {
                    number
                    title
                    body
                    author { login }
                    createdAt
                    updatedAt
                    url
                    category { name }
                  }
                }
              }
            }
            '''

            owner, repo_name = repo.split('/')

            cmd = [
                'gh', 'api', 'graphql',
                '-f', f'query={query}',
                '-f', f'owner={owner}',
                '-f', f'repo={repo_name}',
                '-F', f'limit={limit or 50}'
            ]

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)

            if result.returncode == 0 and result.stdout.strip():
                data = json.loads(result.stdout)
                discussions = data.get('data', {}).get('repository', {}).get('discussions', {}).get('nodes', [])

                for disc in discussions:
                    updated = self._parse_datetime(disc.get('updatedAt'))
                    if since and updated and updated < since:
                        continue

                    note = self._discussion_to_note(disc, repo)
                    notes.append(note)

        except (subprocess.TimeoutExpired, FileNotFoundError, json.JSONDecodeError) as e:
            # Discussions might not be enabled
            pass

        return notes

    def _issue_to_note(self, issue: Dict, repo: str) -> Note:
        """Convert GitHub issue to Note"""
        owner, repo_name = repo.split('/')

        labels = [l.get('name', '') for l in issue.get('labels', [])]

        # Infer note type from labels
        note_type = 'issue'
        if any('risk' in l.lower() for l in labels):
            note_type = 'risk'
        elif any('decision' in l.lower() for l in labels):
            note_type = 'decision'
        elif any('action' in l.lower() or 'task' in l.lower() for l in labels):
            note_type = 'action'
        elif any('meeting' in l.lower() for l in labels):
            note_type = 'meeting'

        return Note(
            id=f"github:issue:{repo}:{issue['number']}",
            title=f"#{issue['number']}: {issue['title']}",
            content=issue.get('body') or '',
            source=ConnectorType.GITHUB,
            source_url=issue.get('url'),
            created_at=self._parse_datetime(issue.get('createdAt')),
            updated_at=self._parse_datetime(issue.get('updatedAt')),
            author=issue.get('author', {}).get('login'),
            realm_id=owner,
            node_id=repo_name,
            tags=labels + ['github', 'issue', issue.get('state', 'open')],
            note_type=note_type,
            raw_metadata=issue
        )

    def _pr_to_note(self, pr: Dict, repo: str) -> Note:
        """Convert GitHub PR to Note"""
        owner, repo_name = repo.split('/')

        labels = [l.get('name', '') for l in pr.get('labels', [])]

        return Note(
            id=f"github:pr:{repo}:{pr['number']}",
            title=f"PR #{pr['number']}: {pr['title']}",
            content=pr.get('body') or '',
            source=ConnectorType.GITHUB,
            source_url=pr.get('url'),
            created_at=self._parse_datetime(pr.get('createdAt')),
            updated_at=self._parse_datetime(pr.get('updatedAt')),
            author=pr.get('author', {}).get('login'),
            realm_id=owner,
            node_id=repo_name,
            tags=labels + ['github', 'pull-request', pr.get('state', 'open')],
            note_type='technical_decision',
            raw_metadata=pr
        )

    def _discussion_to_note(self, disc: Dict, repo: str) -> Note:
        """Convert GitHub discussion to Note"""
        owner, repo_name = repo.split('/')

        category = disc.get('category', {}).get('name', 'General')

        return Note(
            id=f"github:discussion:{repo}:{disc['number']}",
            title=f"Discussion #{disc['number']}: {disc['title']}",
            content=disc.get('body') or '',
            source=ConnectorType.GITHUB,
            source_url=disc.get('url'),
            created_at=self._parse_datetime(disc.get('createdAt')),
            updated_at=self._parse_datetime(disc.get('updatedAt')),
            author=disc.get('author', {}).get('login'),
            realm_id=owner,
            node_id=repo_name,
            tags=['github', 'discussion', category.lower()],
            note_type='meeting' if 'meeting' in category.lower() else 'discussion',
            raw_metadata=disc
        )

    def _parse_datetime(self, dt_str: Optional[str]) -> Optional[datetime]:
        """Parse ISO datetime string"""
        if not dt_str:
            return None
        try:
            # Handle GitHub's ISO format
            return datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            return None
