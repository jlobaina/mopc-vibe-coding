"""
MOPC Platform Backend - Main Package

This package contains all the Django applications for the MOPC platform.
"""

# Import Django app configurations
from .core.apps import CoreConfig
from .workflow.apps import WorkflowConfig
from .documents.apps import DocumentsConfig
from .authentication.apps import AuthenticationConfig

__all__ = [
    'CoreConfig',
    'WorkflowConfig',
    'DocumentsConfig',
    'AuthenticationConfig'
]