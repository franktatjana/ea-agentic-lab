"""Documentation service for browsing and reading docs/ markdown files."""

from pathlib import Path
from functools import lru_cache
from typing import Optional

from ..config import get_settings


class DocsService:
    """Serves documentation content from the project's docs/ directory."""

    def __init__(self, docs_path: Path):
        self.docs_path = docs_path  # Absolute path to the docs/ directory

    def get_tree(self) -> list[dict]:
        """Build a hierarchical tree of the docs/ directory for the sidebar navigator."""
        if not self.docs_path.is_dir():
            return []
        return self._build_tree(self.docs_path)

    def _build_tree(self, directory: Path) -> list[dict]:
        """Recursively build a nested list of files and directories.

        Sorting: items with a frontmatter ``order`` field appear first (ascending),
        followed by items without ``order`` in alphabetical order. Directories are
        sorted before files within each group.
        """
        entries: list[dict] = []

        for item in directory.iterdir():
            # Skip hidden and private directories (e.g. .git, _templates)
            if item.name.startswith(".") or item.name.startswith("_"):
                continue

            rel = item.relative_to(self.docs_path)

            if item.is_dir():
                children = self._build_tree(item)
                if children:
                    dir_order = self._extract_dir_order(item)
                    entries.append({
                        "name": item.name,
                        "path": str(rel),
                        "type": "directory",
                        "children": children,
                        "order": dir_order,
                    })
            elif item.suffix == ".md":
                title, order = self._extract_meta(item)
                entries.append({
                    "name": item.stem,
                    "path": str(rel),
                    "type": "file",
                    "title": title,
                    "order": order,
                })

        # Sort: directories before files, then by order (None sorts last), then alphabetically
        entries.sort(key=lambda e: (
            e["type"] == "file",                        # directories first
            e.get("order") is None,                     # items with order before items without
            e.get("order") or 0,                        # ascending order value
            (e.get("title") or e["name"]).lower(),      # alphabetical fallback
        ))

        return entries

    def _extract_dir_order(self, directory: Path) -> int | None:
        """Check for a README.md in a directory to get its order."""
        index_file = directory / "README.md"
        if index_file.is_file():
            _, order = self._extract_meta(index_file)
            return order
        return None

    def _extract_meta(self, filepath: Path) -> tuple[str, int | None]:
        """Extract title and order from frontmatter or first H1 heading.

        Returns (title, order) where order may be None if not specified.
        """
        title: str | None = None
        order: int | None = None

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                in_frontmatter = False
                for line in f:
                    stripped = line.strip()
                    if stripped == "---":
                        if in_frontmatter:
                            break  # End of frontmatter
                        in_frontmatter = True
                        continue
                    if in_frontmatter:
                        if stripped.startswith("title:"):
                            title = stripped[6:].strip().strip("\"'")
                        elif stripped.startswith("order:"):
                            try:
                                order = int(stripped[6:].strip())
                            except ValueError:
                                pass
                        continue
                    # Outside frontmatter, look for # H1 heading
                    if stripped.startswith("# ") and not title:
                        title = stripped[2:].strip()
                        break
                    if stripped and not stripped.startswith("---"):
                        break
        except Exception:
            pass

        if not title:
            title = filepath.stem.replace("-", " ").replace("_", " ").title()

        return title, order

    def get_content(self, doc_path: str) -> Optional[str]:
        """Read a markdown file by its relative path within docs/."""
        safe_path = Path(doc_path)
        if ".." in safe_path.parts or safe_path.is_absolute():
            return None

        full_path = (self.docs_path / safe_path).resolve()
        if not full_path.is_relative_to(self.docs_path.resolve()):
            return None
        if not full_path.is_file() or full_path.suffix != ".md":
            return None

        try:
            return full_path.read_text(encoding="utf-8")
        except Exception:
            return None


@lru_cache
def get_docs_service() -> DocsService:
    """Factory for dependency injection, cached as singleton."""
    settings = get_settings()
    return DocsService(settings.project_root / "docs")
