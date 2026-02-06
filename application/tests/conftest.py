"""
Pytest configuration for EA Agentic Lab tests.
Adds application/src to the Python path for imports.
"""

import sys
from pathlib import Path

# Add application/src to path for imports
APPLICATION_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(APPLICATION_ROOT / "src"))
