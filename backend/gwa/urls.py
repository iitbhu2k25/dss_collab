from django.urls import path
from .views import WellsAPI

urlpatterns = [
    path('wells', WellsAPI.as_view(), name='wells-api'),
]