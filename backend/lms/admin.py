from django.contrib import admin

from .models import (
    Student,
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
)

admin.site.register(Student)
admin.site.register(Faculty)
admin.site.register(Course)
admin.site.register(Classroom)
admin.site.register(Enrollment)
admin.site.register(Module)
admin.site.register(StudyMaterial)
admin.site.register(MaterialCompletion)
admin.site.register(Assignment)
admin.site.register(AssignmentSubmission)
admin.site.register(LiveSession)