from django.db import models
from django.contrib.auth.models import User

class Student(models.Model):
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='student_profile'
    )
    student_id = models.CharField(max_length=20, unique=True)
    profile_photo = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.student_id})"




class Faculty(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    department = models.CharField(
        max_length=100,
        blank=True
    )
    profile_photo = models.URLField(
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.name} ({self.department})"




class Course(models.Model):
    course_name = models.CharField(max_length=150)

    course_code = models.CharField(
        max_length=20,
        unique=True
    )

    description = models.TextField()

    thumbnail = models.URLField(
        blank=True,
        null=True
    )

    estimated_duration = models.CharField(
        max_length=50
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.course_code} - {self.course_name}"



    
class Classroom(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="classrooms"
    )

    faculty = models.ForeignKey(
        Faculty,
        on_delete=models.CASCADE,
        related_name="classrooms"
    )

    section_name = models.CharField(max_length=50)

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.course.course_code} - {self.section_name}"


class Enrollment(models.Model):
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="enrollments"
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="enrollments"
    )

    classroom = models.ForeignKey(
        Classroom,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="enrollments"
    )

    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "course")

    def __str__(self):
        return f"{self.student.student_id} - {self.course.course_code}"


    


class Enrollment(models.Model):
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="enrollments"
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="enrollments"
    )

    classroom = models.ForeignKey(
        Classroom,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="enrollments"
    )

    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "course")

    def __str__(self):
        return f"{self.student.student_id} - {self.course.course_code}"


class Module(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="modules"
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=1)

    def __str__(self):
        return self.title


class StudyMaterial(models.Model):
    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name="materials"
    )

    title = models.CharField(max_length=200)

    material_type = models.CharField(
        max_length=20,
        choices=[
            ("PDF", "PDF"),
            ("VIDEO", "Video"),
            ("LINK", "Link"),
            ("NOTE", "Note"),
        ]
    )

    resource_url = models.URLField()

    order = models.PositiveIntegerField(default=1)

    def __str__(self):
        return self.title



class MaterialCompletion(models.Model):
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="completed_materials"
    )

    material = models.ForeignKey(
        StudyMaterial,
        on_delete=models.CASCADE,
        related_name="completed_by"
    )

    completed = models.BooleanField(default=False)

    completed_at = models.DateTimeField(
        blank=True,
        null=True
    )

    class Meta:
        unique_together = ("student", "material")

    def __str__(self):
        return f"{self.student.student_id} - {self.material.title}"




class Assignment(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="assignments"
    )

    title = models.CharField(max_length=200)

    description = models.TextField()

    due_date = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title




class AssignmentSubmission(models.Model):

    STATUS_CHOICES = [
        ("PUBLISHED", "Published"),
        ("SUBMITTED", "Submitted"),
        ("EVALUATED", "Evaluated"),
    ]

    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name="submissions"
    )

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="submissions"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PUBLISHED"
    )

    submitted_at = models.DateTimeField(
        blank=True,
        null=True
    )

    grade = models.CharField(
        max_length=10,
        blank=True
    )

    feedback = models.TextField(
        blank=True
    )

    class Meta:
        unique_together = ("assignment", "student")

    def __str__(self):
        return f"{self.student.student_id} - {self.assignment.title}"



class LiveSession(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="live_sessions"
    )
    classroom = models.ForeignKey(
        Classroom,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="live_sessions"
    )
    title = models.CharField(max_length=200)
    meeting_link = models.URLField()
    scheduled_at = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField()

    def __str__(self):
        return self.title