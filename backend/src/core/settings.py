"""
Django settings for MOPC platform project.

This module uses environment-specific settings files.
Set DJANGO_SETTINGS_MODULE environment variable to:
- core.settings.development for development
- core.settings.production for production
- core.settings.test for testing
"""

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Environment-specific settings
ENVIRONMENT = os.getenv('DJANGO_SETTINGS_MODULE', 'core.settings.development')

if 'development' in ENVIRONMENT:
    from .settings.development import *
elif 'production' in ENVIRONMENT:
    from .settings.production import *
elif 'test' in ENVIRONMENT:
    from .settings.test import *
else:
    from .settings.development import *  # Default to development