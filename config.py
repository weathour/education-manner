
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
    STUDENTS_FILE = os.path.join(DATA_DIR, 'students.json')
    SUBJECTS_FILE = os.path.join(DATA_DIR, 'subjects.json')
    PROGRESS_FILE = os.path.join(DATA_DIR, 'progress.json')

