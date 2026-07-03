from rest_framework import serializers
from .models import (
    Faculty,
    Course,
    Classroom,
    Enrollment,
    Module,
    StudyMaterial,
    MaterialCompletion,
    Assignment,
    AssignmentSubmission,
    LiveSession,
    Student,
)


class FacultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = "__all__"


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"


class MyCourseListSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "course_name",
            "course_code",
            "description",
            "thumbnail",
            "estimated_duration",
            "created_at",
            "progress",
        ]

    def get_progress(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return 0
        try:
            student = request.user.student_profile
        except AttributeError:
            return 0
        except Student.DoesNotExist:
            return 0
        
        total_materials = StudyMaterial.objects.filter(module__course=obj).count()
        if total_materials == 0:
            return 0
        completed_materials = MaterialCompletion.objects.filter(
            student=student,
            material__module__course=obj,
            completed=True
        ).count()
        return int((completed_materials / total_materials) * 100)



class ClassroomSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    faculty = FacultySerializer(read_only=True)

    class Meta:
        model = Classroom
        fields = "__all__"


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = "__all__"


class EnrollmentSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    classroom = ClassroomSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = "__all__"


class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = "__all__"


class StudyMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyMaterial
        fields = "__all__"


class MaterialCompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialCompletion
        fields = "__all__"


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = "__all__"


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentSubmission
        fields = "__all__"


class LiveSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveSession
        fields = "__all__"
