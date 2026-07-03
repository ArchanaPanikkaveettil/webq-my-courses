from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "message": "Welcome to the My Courses LMS API",
        "endpoints": {
            "token_obtain": "/api/token/",
            "token_refresh": "/api/token/refresh/",
            "my_courses": "/api/my-courses/",
            "my_course_detail": "/api/my-courses/<course_id>/",
            "toggle_material": "/api/materials/<material_id>/toggle/",
            "admin": "/admin/"
        }
    })

urlpatterns = [
    path("", api_root, name="api-root"),
    path("admin/", admin.site.urls),
    path("api/", include("lms.urls")),
]