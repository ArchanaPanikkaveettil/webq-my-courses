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


# -------------------------
# Registration API
# -------------------------
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
import random

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get("email")
        name = request.data.get("name", "")

        if not username or not password or not email:
            return Response(
                {"detail": "Username, password and email are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"detail": "Username already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"detail": "Email already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        parts = name.split(" ", 1)
        first_name = parts[0] if parts else ""
        last_name = parts[1] if len(parts) > 1 else ""

        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            
            # Generate student ID: e.g. STU12345
            student_id = f"STU{random.randint(100, 99999):05d}"
            while Student.objects.filter(student_id=student_id).exists():
                student_id = f"STU{random.randint(100, 99999):05d}"
                
            student = Student.objects.create(user=user, student_id=student_id)
            
            # Enroll in all existing courses
            for course in Course.objects.all():
                classroom = Classroom.objects.filter(course=course).first()
                Enrollment.objects.get_or_create(student=student, course=course, classroom=classroom)
                
            return Response(
                {"detail": "Student registered and enrolled successfully!"},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            student = user.student_profile
            student_id = student.student_id
            profile_photo = student.profile_photo
        except Student.DoesNotExist:
            student_id = None
            profile_photo = None

        courses_data = []
        if student_id:
            enrollments = Enrollment.objects.filter(student=student)
            for enrollment in enrollments:
                course = enrollment.course
                total_materials = StudyMaterial.objects.filter(module__course=course).count()
                completed_materials = MaterialCompletion.objects.filter(
                    student=student,
                    material__module__course=course,
                    completed=True
                ).count()
                progress = int((completed_materials / total_materials) * 100) if total_materials > 0 else 0
                courses_data.append({
                    "id": course.id,
                    "course_name": course.course_name,
                    "course_code": course.course_code,
                    "progress": progress
                })

        return Response({
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "student_id": student_id,
            "profile_photo": profile_photo,
            "date_joined": user.date_joined,
            "enrolled_courses": courses_data,
            "full_name": f"{user.first_name} {user.last_name}".strip() or user.username
        })

    def patch(self, request):
        user = request.user
        email = request.data.get("email")
        full_name = request.data.get("full_name")
        profile_photo = request.data.get("profile_photo")

        if email:
            if User.objects.filter(email=email).exclude(pk=user.pk).exists():
                return Response(
                    {"detail": "Email is already in use by another account."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.email = email

        if full_name:
            parts = full_name.split(" ", 1)
            user.first_name = parts[0]
            user.last_name = parts[1] if len(parts) > 1 else ""

        user.save()

        try:
            student = user.student_profile
            if profile_photo is not None:
                student.profile_photo = profile_photo
                student.save()
            student_id = student.student_id
            profile_photo = student.profile_photo
        except Student.DoesNotExist:
            student_id = None
            profile_photo = None

        courses_data = []
        if student_id:
            enrollments = Enrollment.objects.filter(student=student)
            for enrollment in enrollments:
                course = enrollment.course
                total_materials = StudyMaterial.objects.filter(module__course=course).count()
                completed_materials = MaterialCompletion.objects.filter(
                    student=student,
                    material__module__course=course,
                    completed=True
                ).count()
                progress = int((completed_materials / total_materials) * 100) if total_materials > 0 else 0
                courses_data.append({
                    "id": course.id,
                    "course_name": course.course_name,
                    "course_code": course.course_code,
                    "progress": progress
                })

        return Response({
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "student_id": student_id,
            "profile_photo": profile_photo,
            "date_joined": user.date_joined,
            "enrolled_courses": courses_data,
            "full_name": f"{user.first_name} {user.last_name}".strip() or user.username
        }, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")

        if not current_password or not new_password:
            return Response(
                {"detail": "Current password and new password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(current_password):
            return Response(
                {"detail": "Incorrect current password."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 6:
            return Response(
                {"detail": "New password must be at least 6 characters long."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)


class SubmitAssignmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            student = request.user.student_profile
        except (AttributeError, Student.DoesNotExist):
            return Response(
                {"detail": "Only enrolled students can submit assignments."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            assignment = Assignment.objects.get(pk=pk)
        except Assignment.DoesNotExist:
            return Response(
                {"detail": "Assignment not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Enrolled student validation
        course = assignment.course
        is_enrolled = Enrollment.objects.filter(student=student, course=course).exists()
        if not is_enrolled:
            return Response(
                {"detail": "You are not enrolled in the course for this assignment."},
                status=status.HTTP_403_FORBIDDEN
            )

        submission, created = AssignmentSubmission.objects.get_or_create(
            assignment=assignment,
            student=student
        )

        # Prevent duplicate submissions if already submitted
        if not created and submission.status == "SUBMITTED":
            return Response(
                {"detail": "Assignment has already been submitted."},
                status=status.HTTP_400_BAD_REQUEST
            )

        from django.utils import timezone
        submission.status = "SUBMITTED"
        submission.submitted_at = timezone.now()
        submission.save()

        return Response({
            "id": submission.id,
            "status": submission.status,
            "submitted_at": submission.submitted_at,
            "grade": submission.grade,
            "feedback": submission.feedback
        }, status=status.HTTP_200_OK)


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            student = request.user.student_profile
        except (AttributeError, Student.DoesNotExist):
            return Response(
                {"detail": "Only students have access to the learning dashboard summary."},
                status=status.HTTP_403_FORBIDDEN
            )

        from django.utils import timezone
        from django.db import models
        now = timezone.now()

        # Prefetch related data to optimize query and prevent N+1 issue
        enrollments = Enrollment.objects.filter(student=student).select_related("course")
        courses = [e.course for e in enrollments]
        
        # Calculate statistics
        total_courses = len(courses)
        
        # Study Materials count & completions
        total_materials = StudyMaterial.objects.filter(module__course__in=courses).count()
        completed_materials = MaterialCompletion.objects.filter(
            student=student,
            material__module__course__in=courses,
            completed=True
        ).count()
        
        overall_progress = int((completed_materials / total_materials) * 100) if total_materials > 0 else 0

        # Pending assignments
        total_assignments = Assignment.objects.filter(course__in=courses).count()
        submitted_assignments = AssignmentSubmission.objects.filter(
            student=student,
            assignment__course__in=courses,
            status__in=["SUBMITTED", "EVALUATED"]
        ).count()
        pending_assignments = max(0, total_assignments - submitted_assignments)

        # Upcoming live sessions
        classrooms = Classroom.objects.filter(enrollments__student=student)
        upcoming_live_count = LiveSession.objects.filter(
            models.Q(course__in=courses) &
            (models.Q(classroom__in=classrooms) | models.Q(classroom__isnull=True)),
            scheduled_at__gt=now
        ).count()

        # Recent activities (Completions + Submissions)
        activities = []
        completions = MaterialCompletion.objects.filter(
            student=student,
            completed=True
        ).select_related("material", "material__module", "material__module__course").order_by("-completed_at")[:5]
        for c in completions:
            activities.append({
                "type": "material",
                "title": f"Completed '{c.material.title}'",
                "timestamp": c.completed_at,
                "course_name": c.material.module.course.course_name
            })

        submissions = AssignmentSubmission.objects.filter(
            student=student,
            status__in=["SUBMITTED", "EVALUATED"]
        ).select_related("assignment", "assignment__course").order_by("-submitted_at")[:5]
        for s in submissions:
            activities.append({
                "type": "assignment",
                "title": f"Submitted '{s.assignment.title}'",
                "timestamp": s.submitted_at,
                "course_name": s.assignment.course.course_name
            })

        activities.sort(key=lambda x: x["timestamp"] if x["timestamp"] else now, reverse=True)
        recent_activities = activities[:5]

        # Upcoming deadlines (unsubmitted assignments + upcoming live classes)
        deadlines = []
        pending_assigns = Assignment.objects.filter(
            course__in=courses,
            due_date__gt=now
        ).exclude(
            submissions__student=student,
            submissions__status__in=["SUBMITTED", "EVALUATED"]
        ).select_related("course").order_by("due_date")[:3]
        for pa in pending_assigns:
            deadlines.append({
                "type": "assignment",
                "title": pa.title,
                "due_date": pa.due_date,
                "course_name": pa.course.course_name
            })

        upcoming_sessions = LiveSession.objects.filter(
            models.Q(course__in=courses) &
            (models.Q(classroom__in=classrooms) | models.Q(classroom__isnull=True)),
            scheduled_at__gt=now
        ).select_related("course").order_by("scheduled_at")[:3]
        for us in upcoming_sessions:
            deadlines.append({
                "type": "live_session",
                "title": us.title,
                "due_date": us.scheduled_at,
                "course_name": us.course.course_name
            })

        deadlines.sort(key=lambda x: x["due_date"])
        upcoming_deadlines = deadlines[:5]

        # Continue Learning shortcut
        continue_learning = None
        for enrollment in enrollments.order_by("enrolled_at"):
            c = enrollment.course
            first_incomplete = StudyMaterial.objects.filter(
                module__course=c
            ).exclude(
                completed_by__student=student,
                completed_by__completed=True
            ).select_related("module", "module__course").order_by("module__order", "order").first()
            if first_incomplete:
                continue_learning = {
                    "course_id": c.id,
                    "course_name": c.course_name,
                    "course_code": c.course_code,
                    "module_title": first_incomplete.module.title,
                    "material_title": first_incomplete.title
                }
                break

        return Response({
            "stats": {
                "total_courses": total_courses,
                "overall_progress": overall_progress,
                "completed_materials": completed_materials,
                "pending_assignments": pending_assignments,
                "upcoming_live_sessions": upcoming_live_count
            },
            "recent_activities": recent_activities,
            "upcoming_deadlines": upcoming_deadlines,
            "continue_learning": continue_learning
        })


