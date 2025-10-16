from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def health_check(request):
    """Health check endpoint for load balancers."""
    return JsonResponse({
        'status': 'healthy',
        'service': 'mopc-platform-api'
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('authentication.urls')),
    path('api/v1/documents/', include('documents.urls')),
    path('api/v1/workflow/', include('workflow.urls')),
    path('health/', health_check, name='health-check'),
    path('api/v1/', include('core.urls')),  # API root info
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)