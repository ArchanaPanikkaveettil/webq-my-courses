from rest_framework import generics

from .models import (
    Course,
    Module,
    StudyMaterial,
    Assignment,
    LiveSession,
)

from .serializers import (
    CourseSerializer,
    ModuleSerializer,
    StudyMaterialSerializer,
    AssignmentSerializer,
    LiveSessionSerializer,
)


# -------------------------
# Courses
# -------------------------

class CourseListView(generics.ListAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


# -------------------------
# Modules
# -------------------------

class ModuleListView(generics.ListAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer


# -------------------------
# Study Materials
# -------------------------

class StudyMaterialListView(generics.ListAPIView):
    queryset = StudyMaterial.objects.all()
    serializer_class = StudyMaterialSerializer


# -------------------------
# Assignments
# -------------------------

class AssignmentListView(generics.ListAPIView):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer


# -------------------------
# Live Sessions
# -------------------------

class LiveSessionListView(generics.ListAPIView):
    queryset = LiveSession.objects.all()
    serializer_class = LiveSessionSerializer