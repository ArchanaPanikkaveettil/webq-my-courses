from django.urls import path

from .views import (
    CourseListView,
    CourseDetailView,
    ModuleListView,
    StudyMaterialListView,
    AssignmentListView,
    LiveSessionListView,
)

urlpatterns = [
    path("courses/", CourseListView.as_view(), name="course-list"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),

    path("modules/", ModuleListView.as_view(), name="module-list"),

    path("materials/", StudyMaterialListView.as_view(), name="material-list"),

    path("assignments/", AssignmentListView.as_view(), name="assignment-list"),

    path("live-sessions/", LiveSessionListView.as_view(), name="live-session-list"),
]
