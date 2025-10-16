"""
Test Django settings for MOPC platform.

Testing-specific configuration.
"""

from .base import *
import tempfile

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Use in-memory database for testing
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Password hashing for faster tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Disable migrations for faster test runs
class DisableMigrations:
    def __contains__(self, item):
        return True

    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()

# Cache configuration for testing
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'test-cache',
    }
}

# Email backend for testing
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Media files for testing
MEDIA_ROOT = tempfile.mkdtemp()
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# Logging for testing (minimal output)
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',
    },
}

# Security settings for testing
SECURE_SSL_REDIRECT = False
SECURE_BROWSER_XSS_FILTER = False
SECURE_CONTENT_TYPE_NOSNIFF = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# CORS settings for testing
CORS_ALLOW_ALL_ORIGINS = True

# JWT settings for testing (longer-lived tokens for convenience)
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),  # 24 hours for testing
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),  # 30 days for testing
    'ROTATE_REFRESH_TOKENS': False,  # Disable rotation for simpler testing
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': 'test-secret-key-do-not-use-in-production',
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}

# REST Framework settings for testing
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Allow all for testing
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,  # Smaller page size for testing
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'TEST_REQUEST_DEFAULT_FORMAT': 'json',
    'TEST_REQUEST_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

# Celery configuration for testing (synchronous execution)
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# File upload settings for testing
FILE_UPLOAD_MAX_MEMORY_SIZE = 1024 * 1024  # 1MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 1024 * 1024  # 1MB

# Disable debug toolbar in tests
if 'debug_toolbar' in INSTALLED_APPS:
    INSTALLED_APPS.remove('debug_toolbar')

# Disable django extensions in tests
if 'django_extensions' in INSTALLED_APPS:
    INSTALLED_APPS.remove('django_extensions')

# Test-specific settings
TEST_RUNNER = 'django.test.runner.DiscoverRunner'

# Speed up tests
SILENCED_SYSTEM_CHECKS = [
    'fields.W342',  # ForeignKey unique constraint warning
    'security.W008',  # SSL redirect warning
    'security.W009',  # HSTS warning
]

# Disable throttling in tests
REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES'] = []
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {}

# Test-specific middleware (remove unnecessary ones)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

# Simplify static files for testing
STATICFILES_DIRS = []

# Disable migration history for faster tests
MIGRATION_MODULES = DisableMigrations()

# Test-specific environment variables
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.test')

# Performance settings for testing
CONN_MAX_AGE = 0  # Don't persist connections between tests

# Mock external services if needed
if config('MOCK_EXTERNAL_SERVICES', default=True, cast=bool):
    # Add any mock configurations here
    pass

# Coverage settings
if config('RUN_COVERAGE', default=False, cast=bool):
    TEST_RUNNER = 'django_coverage.test_runner.CoverageRunner'
    COVERAGE_EXCLUDE_MODULES = [
        'migrations',
        'settings',
        'tests',
        'management.commands',
    ]
    COVERAGE_REPORT_HTML_OUTPUT_DIR = BASE_DIR / 'coverage'