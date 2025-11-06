from django.http import JsonResponse
from django.urls import path, include

def home(request):
    return JsonResponse({"status": "ok", "service": "fitness-ai-backend"})

urlpatterns = [
    path('', home),
    path('api/', include('api.urls')),
]
