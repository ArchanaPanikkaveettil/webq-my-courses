from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import (
    Student,
    Course,
    Module,
    StudyMaterial,
    MaterialCompletion,
    Assignment,
    AssignmentSubmission,
    LiveSession,
    Enrollment,
    Classroom,
)

from .serializers import (
    CourseSerializer,
    ModuleSerializer,
    StudyMaterialSerializer,
    AssignmentSerializer,
    LiveSessionSerializer,
    MyCourseListSerializer,
)


# -------------------------
# Courses APIs
# -------------------------

class CourseListView(generics.ListAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


class MyCoursesListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            student = request.user.student_profile
        except (AttributeError, Student.DoesNotExist):
            return Response(
                {"detail": "Only students have enrolled courses."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        courses = Course.objects.filter(enrollments__student=student).distinct()
        serializer = MyCourseListSerializer(courses, many=True, context={"request": request})
        return Response(serializer.data)


class MyCourseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            student = request.user.student_profile
        except (AttributeError, Student.DoesNotExist):
            return Response(
                {"detail": "Only students can view course details."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # IDOR check: Is student enrolled in the requested course?
        enrollment = Enrollment.objects.filter(student=student, course_id=pk).first()
        if not enrollment:
            return Response(
                {"detail": "You are not enrolled in this course."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response(
                {"detail": "Course not found."},
                status=status.HTTP_404_NOT_FOUND
            )
            
        classroom = enrollment.classroom
        
        # Calculate progress
        total_materials = StudyMaterial.objects.filter(module__course=course).count()
        completed_materials = MaterialCompletion.objects.filter(
            student=student,
            material__module__course=course,
            completed=True
        ).count()
        progress = int((completed_materials / total_materials) * 100) if total_materials > 0 else 0
        
        # Get modules & materials with completion status
        modules = Module.objects.filter(course=course).order_by("order")
        modules_data = []
        for module in modules:
            materials = StudyMaterial.objects.filter(module=module).order_by("order")
            materials_data = []
            for material in materials:
                completion = MaterialCompletion.objects.filter(student=student, material=material).first()
                completed = completion.completed if completion else False
                materials_data.append({
                    "id": material.id,
                    "title": material.title,
                    "material_type": material.material_type,
                    "resource_url": material.resource_url,
                    "order": material.order,
                    "completed": completed
                })
            modules_data.append({
                "id": module.id,
                "title": module.title,
                "description": module.description,
                "order": module.order,
                "materials": materials_data
            })
            
        # Get assignments & submission status
        assignments = Assignment.objects.filter(course=course).order_by("due_date")
        assignments_data = []
        for assignment in assignments:
            submission = AssignmentSubmission.objects.filter(student=student, assignment=assignment).first()
            submission_data = None
            if submission:
                submission_data = {
                    "id": submission.id,
                    "status": submission.status,
                    "submitted_at": submission.submitted_at,
                    "grade": submission.grade,
                    "feedback": submission.feedback
                }
            assignments_data.append({
                "id": assignment.id,
                "title": assignment.title,
                "description": assignment.description,
                "due_date": assignment.due_date,
                "submission": submission_data
            })
            
        # Get live sessions (classroom specific, or general course sessions)
        if classroom:
            live_sessions = LiveSession.objects.filter(classroom=classroom).order_by("scheduled_at")
        else:
            live_sessions = LiveSession.objects.filter(course=course, classroom__isnull=True).order_by("scheduled_at")
            
        live_sessions_data = [{
            "id": session.id,
            "title": session.title,
            "meeting_link": session.meeting_link,
            "scheduled_at": session.scheduled_at,
            "duration_minutes": session.duration_minutes
        } for session in live_sessions]
        
        # Get faculty details from classroom
        faculty_data = None
        if classroom and classroom.faculty:
            faculty = classroom.faculty
            faculty_data = {
                "id": faculty.id,
                "name": faculty.name,
                "email": faculty.email,
                "department": faculty.department,
                "profile_photo": faculty.profile_photo
            }
            
        return Response({
            "id": course.id,
            "course_name": course.course_name,
            "course_code": course.course_code,
            "description": course.description,
            "thumbnail": course.thumbnail,
            "estimated_duration": course.estimated_duration,
            "progress": progress,
            "classroom": {
                "id": classroom.id,
                "section_name": classroom.section_name
            } if classroom else None,
            "faculty": faculty_data,
            "modules": modules_data,
            "assignments": assignments_data,
            "live_sessions": live_sessions_data
        })


# -------------------------
# Study Materials APIs
# -------------------------

class StudyMaterialListView(generics.ListAPIView):
    queryset = StudyMaterial.objects.all()
    serializer_class = StudyMaterialSerializer


class ToggleMaterialCompletionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            student = request.user.student_profile
        except (AttributeError, Student.DoesNotExist):
            return Response(
                {"detail": "Only students can track study material completion."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        try:
            material = StudyMaterial.objects.get(pk=pk)
        except StudyMaterial.DoesNotExist:
            return Response(
                {"detail": "Study material not found."},
                status=status.HTTP_404_NOT_FOUND
            )
            
        # IDOR check: Is student enrolled in the course containing this material?
        course = material.module.course
        is_enrolled = Enrollment.objects.filter(student=student, course=course).exists()
        if not is_enrolled:
            return Response(
                {"detail": "You are not enrolled in the course for this study material."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        completion, created = MaterialCompletion.objects.get_or_create(
            student=student,
            material=material
        )
        
        # Toggle completed state
        completion.completed = not completion.completed
        if completion.completed:
            from django.utils import timezone
            completion.completed_at = timezone.now()
        else:
            completion.completed_at = None
        completion.save()
        
        # Calculate updated progress
        total_materials = StudyMaterial.objects.filter(module__course=course).count()
        completed_materials = MaterialCompletion.objects.filter(
            student=student,
            material__module__course=course,
            completed=True
        ).count()
        progress = int((completed_materials / total_materials) * 100) if total_materials > 0 else 0
        
        return Response({
            "material_id": material.id,
            "completed": completion.completed,
            "completed_at": completion.completed_at,
            "course_progress": progress
        })


# -------------------------
# Modules APIs
# -------------------------

class ModuleListView(generics.ListAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer


# -------------------------
# Assignments APIs
# -------------------------

class AssignmentListView(generics.ListAPIView):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer


# -------------------------
# Live Sessions APIs
# -------------------------

class LiveSessionListView(generics.ListAPIView):
    queryset = LiveSession.objects.all()
    serializer_class = LiveSessionSerializer