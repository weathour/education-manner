
from flask import Blueprint, jsonify, request
from models import data_manager
import uuid
from datetime import datetime

api = Blueprint('api', __name__)

# 错误处理装饰器
def handle_errors(f):
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    wrapper.__name__ = f.__name__
    return wrapper

# 学生相关API
@api.route('/students', methods=['GET'])
@handle_errors
def get_students():
    """获取所有学生"""
    students = data_manager.get_all_students()
    
    # 为每个学生添加进度信息
    for student in students:
        student['overallProgress'] = data_manager.calculate_overall_progress(student['id'])
    
    return jsonify(students)

@api.route('/students/<student_id>', methods=['GET'])
@handle_errors
def get_student(student_id):
    """获取单个学生"""
    student = data_manager.get_student_by_id(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    # 添加进度信息
    student['overallProgress'] = data_manager.calculate_overall_progress(student_id)
    
    return jsonify(student)

@api.route('/students', methods=['POST'])
@handle_errors
def add_student():
    """添加新学生"""
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'error': 'Name is required'}), 400
    
    # 生成唯一ID
    student_id = f"student_{int(datetime.now().timestamp())}"
    
    student_data = {
        'id': student_id,
        'name': data['name'],
        'avatar': data.get('avatar', '👦'),
        'subjects': data.get('subjects', []),
        'grade': data.get('grade', '一年级'),
        'notes': data.get('notes', '')
    }
    
    if data_manager.add_student(student_data):
        return jsonify(student_data), 201
    else:
        return jsonify({'error': 'Failed to add student'}), 500

@api.route('/students/<student_id>', methods=['PUT'])
@handle_errors
def update_student(student_id):
    """更新学生信息"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    if data_manager.update_student(student_id, data):
        return jsonify({'message': 'Student updated successfully'})
    else:
        return jsonify({'error': 'Failed to update student'}), 500

@api.route('/students/<student_id>', methods=['DELETE'])
@handle_errors
def delete_student(student_id):
    """删除学生"""
    if data_manager.delete_student(student_id):
        return jsonify({'message': 'Student deleted successfully'})
    else:
        return jsonify({'error': 'Failed to delete student'}), 500

# 科目相关API
@api.route('/subjects', methods=['GET'])
@handle_errors
def get_subjects():
    """获取所有科目"""
    subjects = data_manager.get_all_subjects()
    return jsonify(subjects)

@api.route('/subjects/<subject_id>', methods=['GET'])
@handle_errors
def get_subject(subject_id):
    """获取单个科目"""
    subject = data_manager.get_subject_by_id(subject_id)
    if not subject:
        return jsonify({'error': 'Subject not found'}), 404
    
    return jsonify(subject)

@api.route('/subjects', methods=['POST'])
@handle_errors
def add_subject():
    """添加新科目"""
    data = request.get_json()
    
    if not data or not data.get('id') or not data.get('name'):
        return jsonify({'error': 'ID and name are required'}), 400
    
    subject_data = {
        'id': data['id'],
        'name': data['name'],
        'icon': data.get('icon', '📚'),
        'color': data.get('color', '#666'),
        'description': data.get('description', ''),
        'levels': data.get('levels', [])
    }
    
    if data_manager.add_subject(subject_data):
        return jsonify(subject_data), 201
    else:
        return jsonify({'error': 'Subject ID already exists or failed to add'}), 400

@api.route('/subjects/<subject_id>', methods=['PUT'])
@handle_errors
def update_subject(subject_id):
    """更新科目信息"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    if data_manager.update_subject(subject_id, data):
        return jsonify({'message': 'Subject updated successfully'})
    else:
        return jsonify({'error': 'Failed to update subject'}), 500

@api.route('/subjects/<subject_id>', methods=['DELETE'])
@handle_errors
def delete_subject(subject_id):
    """删除科目"""
    if data_manager.delete_subject(subject_id):
        return jsonify({'message': 'Subject deleted successfully'})
    else:
        return jsonify({'error': 'Failed to delete subject'}), 500

# 进度相关API
@api.route('/students/<student_id>/progress', methods=['GET'])
@handle_errors
def get_student_progress(student_id):
    """获取学生进度"""
    progress = data_manager.get_student_progress(student_id)
    return jsonify(progress)

@api.route('/students/<student_id>/progress', methods=['POST'])
@handle_errors
def save_student_progress(student_id):
    """保存学生进度"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    if data_manager.save_student_progress(student_id, data):
        return jsonify({'message': 'Progress saved successfully'})
    else:
        return jsonify({'error': 'Failed to save progress'}), 500

@api.route('/students/<student_id>/subjects/<subject_id>/progress', methods=['GET'])
@handle_errors
def get_subject_progress(student_id, subject_id):
    """获取学科进度统计"""
    progress_stats = data_manager.calculate_subject_progress(student_id, subject_id)
    return jsonify(progress_stats)

# 统计API
@api.route('/stats/overall', methods=['GET'])
@handle_errors
def get_overall_stats():
    """获取整体统计"""
    students = data_manager.get_all_students()
    subjects = data_manager.get_all_subjects()
    
    total_students = len(students)
    total_subjects = len(subjects)
    
    # 计算平均进度
    if total_students > 0:
        total_progress = sum(data_manager.calculate_overall_progress(s['id']) for s in students)
        average_progress = total_progress / total_students
    else:
        average_progress = 0
    
    return jsonify({
        'totalStudents': total_students,
        'totalSubjects': total_subjects,
        'averageProgress': round(average_progress, 1)
    })

# 批量操作API
@api.route('/batch/add-subject-to-students', methods=['POST'])
@handle_errors
def add_subject_to_students():
    """批量为学生添加科目"""
    data = request.get_json()
    subject_id = data.get('subjectId')
    student_ids = data.get('studentIds', [])
    
    if not subject_id or not student_ids:
        return jsonify({'error': 'Subject ID and student IDs are required'}), 400
    
    success_count = 0
    for student_id in student_ids:
        student = data_manager.get_student_by_id(student_id)
        if student and subject_id not in student.get('subjects', []):
            updated_subjects = student['subjects'] + [subject_id]
            if data_manager.update_student(student_id, {'subjects': updated_subjects}):
                success_count += 1
    
    return jsonify({
        'message': f'Successfully added subject to {success_count} students',
        'successCount': success_count,
        'totalCount': len(student_ids)
    })
