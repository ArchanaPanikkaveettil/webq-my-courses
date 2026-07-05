from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    CourseListView,
    CourseDetailView,
    MyCoursesListView,
    MyCourseDetailView,
    ToggleMaterialCompletionView,
    ModuleListView,
    StudyMaterialListView,
    AssignmentListView,
    LiveSessionListView,
    RegisterView,
    MeView,
    SubmitAssignmentView,
    ChangePasswordView,
    DashboardSummaryView,
    GlobalSearchView,
    NotificationListView,
    MarkNotificationReadView,
    MarkAllNotificationsReadView,
    TempResetAdminView,
)

urlpatterns = [
    # JWT authentication endpoints
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", MeView.as_view(), name="me"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("assignments/<int:pk>/submit/", SubmitAssignmentView.as_view(), name="submit-assignment"),
    path("dashboard-summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path("search/", GlobalSearchView.as_view(), name="global-search"),
    path("notifications/", NotificationListView.as_view(), name="notification-list"),
    path("notifications/<int:pk>/read/", MarkNotificationReadView.as_view(), name="notification-read"),
    path("notifications/read-all/", MarkAllNotificationsReadView.as_view(), name="notifications-read-all"),
    path("temp-reset-admin/", TempResetAdminView.as_view(), name="temp-reset-admin"),

    # Student personal course access APIs
    path("my-courses/", MyCoursesListView.as_view(), name="my-courses-list"),
    path("my-courses/<int:pk>/", MyCourseDetailView.as_view(), name="my-course-detail"),

    # Study material toggle completion API
    path("materials/<int:pk>/toggle/", ToggleMaterialCompletionView.as_view(), name="material-toggle-completion"),

    # Base entity list endpoints (for admin or debugging if needed)
    path("courses/", CourseListView.as_view(), name="course-list"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
    path("modules/", ModuleListView.as_view(), name="module-list"),
    path("materials/", StudyMaterialListView.as_view(), name="material-list"),
    path("assignments/", AssignmentListView.as_view(), name="assignment-list"),
    path("live-sessions/", LiveSessionListView.as_view(), name="live-session-list"),
]
