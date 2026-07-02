from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

from lms.models import (
    Student, Faculty, Course, Classroom, Enrollment,
    Module, StudyMaterial, MaterialCompletion,
    Assignment, AssignmentSubmission, LiveSession,
)


class Command(BaseCommand):
    help = "Seeds the database with sample LMS data"

    def handle(self, *args, **kwargs):
        self.stdout.write("Deleting old data...")

        MaterialCompletion.objects.all().delete()
        AssignmentSubmission.objects.all().delete()
        Assignment.objects.all().delete()
        LiveSession.objects.all().delete()
        StudyMaterial.objects.all().delete()
        Module.objects.all().delete()
        Enrollment.objects.all().delete()
        Classroom.objects.all().delete()
        Course.objects.all().delete()
        Faculty.objects.all().delete()
        Student.objects.all().delete()
        User.objects.exclude(is_superuser=True).delete()

        self.stdout.write(self.style.SUCCESS("Old data deleted successfully!"))

        faculty1 = Faculty.objects.create(
            name="Dr. Alan Turing",
            email="alan@example.com",
            department="Computer Science",
        )

        faculty2 = Faculty.objects.create(
            name="Dr. Grace Hopper",
            email="grace@example.com",
            department="Software Engineering",
        )

        faculty3 = Faculty.objects.create(
            name="Dr. James Gosling",
            email="james@example.com",
            department="Programming Languages",
        )

        self.stdout.write(self.style.SUCCESS("Faculty created successfully!"))

        python_course = Course.objects.create(
            course_name="Python Programming",
            course_code="PY101",
            description="Learn Python from scratch.",
            estimated_duration="8 Weeks",
        )

        django_course = Course.objects.create(
            course_name="Django Development",
            course_code="DJ201",
            description="Build web applications using Django.",
            estimated_duration="10 Weeks",
        )

        sql_course = Course.objects.create(
            course_name="SQL Database",
            course_code="SQL301",
            description="Master SQL.",
            estimated_duration="6 Weeks",
        )

        react_course = Course.objects.create(
            course_name="React Development",
            course_code="RE401",
            description="Modern React.",
            estimated_duration="8 Weeks",
        )

        ml_course = Course.objects.create(
            course_name="Machine Learning",
            course_code="ML501",
            description="ML Basics.",
            estimated_duration="12 Weeks",
        )

        self.stdout.write(self.style.SUCCESS("Courses created successfully!"))

        students = []
        for i in range(1, 11):
            user = User.objects.create_user(
                username=f"student{i}",
                email=f"student{i}@example.com",
                password="password123",
                first_name=f"Student{i}",
                last_name="Demo",
            )

            students.append(Student.objects.create(
                user=user,
                student_id=f"STU{i:03d}"
            ))

        self.stdout.write(self.style.SUCCESS("Students created successfully!"))

        classroom_python = Classroom.objects.create(
            course=python_course,
            faculty=faculty1,
            section_name="Python Batch A"
        )

        classroom_django = Classroom.objects.create(
            course=django_course,
            faculty=faculty2,
            section_name="Django Batch A"
        )

        classroom_sql = Classroom.objects.create(
            course=sql_course,
            faculty=faculty3,
            section_name="SQL Batch A"
        )

        classroom_react = Classroom.objects.create(
            course=react_course,
            faculty=faculty1,
            section_name="React Batch A"
        )

        classroom_ml = Classroom.objects.create(
            course=ml_course,
            faculty=faculty2,
            section_name="ML Batch A"
        )

        self.stdout.write(self.style.SUCCESS("Classrooms created successfully!"))

        classrooms = [
            classroom_python,
            classroom_django,
            classroom_sql,
            classroom_react,
            classroom_ml,
        ]

        for idx, student in enumerate(students):
            classroom = classrooms[idx % len(classrooms)]
            Enrollment.objects.create(
                student=student,
                course=classroom.course,
                classroom=classroom
            )

        self.stdout.write(self.style.SUCCESS("Enrollments created successfully!"))

        modules = []
        for course in [python_course, django_course, sql_course, react_course, ml_course]:
            for i in range(1, 4):
                modules.append(Module.objects.create(
                    course=course,
                    title=f"Module {i}",
                    description=f"Module {i} of {course.course_name}",
                    order=i
                ))

        self.stdout.write(self.style.SUCCESS("Modules created successfully!"))

        materials = []
        for module in modules:
            for i, mtype in enumerate(["PDF", "VIDEO", "NOTE"], start=1):
                materials.append(StudyMaterial.objects.create(
                    module=module,
                    title=f"{module.title} - {mtype}",
                    material_type=mtype,
                    resource_url="https://example.com/resource",
                    order=i
                ))

        self.stdout.write(self.style.SUCCESS("Study Materials created successfully!"))

        for student in students:
            for material in materials[:5]:
                MaterialCompletion.objects.create(
                    student=student,
                    material=material,
                    completed=True,
                    completed_at=timezone.now()
                )

        self.stdout.write(self.style.SUCCESS("Material Completion created successfully!"))

        assignments = []
        for course in [python_course, django_course, sql_course, react_course, ml_course]:
            assignments.append(Assignment.objects.create(
                course=course,
                title=f"{course.course_name} Assignment",
                description="Complete the assignment.",
                due_date=timezone.now() + timedelta(days=7)
            ))

        self.stdout.write(self.style.SUCCESS("Assignments created successfully!"))

        enrollments = Enrollment.objects.select_related("student", "course")
        for enrollment in enrollments:
            assignment = next(a for a in assignments if a.course_id == enrollment.course_id)
            AssignmentSubmission.objects.create(
                assignment=assignment,
                student=enrollment.student,
                status="PUBLISHED"
            )

        self.stdout.write(self.style.SUCCESS("Assignment Submissions created successfully!"))

        for classroom in classrooms:
            LiveSession.objects.create(
                course=classroom.course,
                classroom=classroom,
                title=f"{classroom.course.course_name} Live Session",
                meeting_link="https://meet.example.com/demo",
                scheduled_at=timezone.now() + timedelta(days=1),
                duration_minutes=60
            )

        self.stdout.write(self.style.SUCCESS("Live Sessions created successfully!"))
        self.stdout.write(self.style.SUCCESS("Database seeded successfully!"))
