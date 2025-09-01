
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional
from config import Config

class DataManager:
    def __init__(self):
        self.config = Config()
        self._ensure_data_dir()
        self._ensure_files()
    
    def _ensure_data_dir(self):
        """确保数据目录存在"""
        if not os.path.exists(self.config.DATA_DIR):
            os.makedirs(self.config.DATA_DIR)
    
    def _ensure_files(self):
        """确保数据文件存在"""
        # 如果文件不存在，创建默认数据
        if not os.path.exists(self.config.STUDENTS_FILE):
            self._create_default_students()
        if not os.path.exists(self.config.SUBJECTS_FILE):
            self._create_default_subjects()
        if not os.path.exists(self.config.PROGRESS_FILE):
            self._create_default_progress()
    
    def _create_default_students(self):
        """创建默认学生数据"""
        default_students = [
            {
                "id": "student_001",
                "name": "张小明",
                "avatar": "👦",
                "subjects": ["math", "chinese", "english"],
                "createdAt": "2024-01-15",
                "lastUpdate": "2024-01-20",
                "grade": "一年级",
                "notes": "学习积极主动，数学基础较好"
            },
            {
                "id": "student_002",
                "name": "李小红",
                "avatar": "👧",
                "subjects": ["math", "chinese", "science"],
                "createdAt": "2024-01-10",
                "lastUpdate": "2024-01-18",
                "grade": "一年级",
                "notes": "语文表达能力强，喜欢科学实验"
            },
            {
                "id": "student_003",
                "name": "王大强",
                "avatar": "👨",
                "subjects": ["math", "english", "science"],
                "createdAt": "2024-01-12",
                "lastUpdate": "2024-01-19",
                "grade": "一年级",
                "notes": "动手能力强，逻辑思维清晰"
            }
        ]
        self._write_json(self.config.STUDENTS_FILE, default_students)
    
    def _create_default_subjects(self):
        """创建默认科目数据"""
        default_subjects = [
            {
                "id": "math",
                "name": "数学",
                "icon": "🧮",
                "color": "#4285f4",
                "description": "基础数学概念和运算能力培养",
                "levels": [
                    {
                        "id": "grade_1",
                        "name": "一年级数学",
                        "chapters": [
                            {
                                "id": "numbers_basic",
                                "name": "数字认知",
                                "description": "学习0-100的数字概念",
                                "tasks": [
                                    {
                                        "id": "task_001",
                                        "name": "认识1-10",
                                        "type": "concept",
                                        "steps": [
                                            "符号灌输：数字1,2,3...的写法和读音",
                                            "现实意义：用物品数数，理解数量概念",
                                            "题目训练：数字连线、填空练习",
                                            "测试：口算测验和应用题"
                                        ],
                                        "estimatedTime": 30,
                                        "difficulty": 1,
                                        "prerequisites": []
                                    },
                                    {
                                        "id": "task_002",
                                        "name": "数字比较大小",
                                        "type": "skill",
                                        "steps": [
                                            "符号灌输：大于号>、小于号<、等于号=",
                                            "现实意义：比较糖果数量、身高体重",
                                            "题目训练：填空比较、选择题练习",
                                            "测试：综合比较判断题"
                                        ],
                                        "estimatedTime": 25,
                                        "difficulty": 2,
                                        "prerequisites": ["task_001"]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "id": "chinese",
                "name": "语文",
                "icon": "📚",
                "color": "#34a853",
                "description": "汉语拼音、汉字认识和阅读理解",
                "levels": [
                    {
                        "id": "grade_1",
                        "name": "一年级语文",
                        "chapters": [
                            {
                                "id": "pinyin_basic",
                                "name": "拼音基础",
                                "description": "学习声母韵母和拼读",
                                "tasks": [
                                    {
                                        "id": "task_001",
                                        "name": "认识声母",
                                        "type": "concept",
                                        "steps": [
                                            "符号灌输：23个声母的读音和写法",
                                            "现实意义：结合生活中的词汇记忆",
                                            "题目训练：声母认读和书写练习",
                                            "测试：声母默写和发音测试"
                                        ],
                                        "estimatedTime": 40,
                                        "difficulty": 2,
                                        "prerequisites": []
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "id": "english",
                "name": "英语",
                "icon": "🇺🇸",
                "color": "#ea4335",
                "description": "英语字母、单词和简单句型学习",
                "levels": [
                    {
                        "id": "grade_1",
                        "name": "一年级英语",
                        "chapters": [
                            {
                                "id": "alphabet_basic",
                                "name": "字母学习",
                                "description": "认识26个英文字母",
                                "tasks": [
                                    {
                                        "id": "task_001",
                                        "name": "认识字母A-M",
                                        "type": "concept",
                                        "steps": [
                                            "符号灌输：字母A-M的大小写形式和发音",
                                            "现实意义：字母在生活中的应用（标识、品牌等）",
                                            "题目训练：字母描红和发音练习",
                                            "测试：字母认读和书写测试"
                                        ],
                                        "estimatedTime": 35,
                                        "difficulty": 2,
                                        "prerequisites": []
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "id": "science",
                "name": "科学",
                "icon": "🔬",
                "color": "#fbbc04",
                "description": "自然现象观察和科学思维培养",
                "levels": [
                    {
                        "id": "grade_1",
                        "name": "一年级科学",
                        "chapters": [
                            {
                                "id": "nature_observation",
                                "name": "自然观察",
                                "description": "观察身边的自然现象",
                                "tasks": [
                                    {
                                        "id": "task_001",
                                        "name": "观察植物",
                                        "type": "concept",
                                        "steps": [
                                            "符号灌输：植物的基本部位（根、茎、叶、花、果）",
                                            "现实意义：观察校园和家周围的植物",
                                            "题目训练：植物部位标识和分类练习",
                                            "测试：植物观察记录和部位识别"
                                        ],
                                        "estimatedTime": 45,
                                        "difficulty": 2,
                                        "prerequisites": []
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
        self._write_json(self.config.SUBJECTS_FILE, default_subjects)
    
    def _create_default_progress(self):
        """创建默认进度数据"""
        self._write_json(self.config.PROGRESS_FILE, {})
    
    def _read_json(self, filepath: str) -> Any:
        """读取JSON文件"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return None
    
    def _write_json(self, filepath: str, data: Any) -> bool:
        """写入JSON文件"""
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"写入文件失败: {e}")
            return False
    
    # 学生相关方法
    def get_all_students(self) -> List[Dict[str, Any]]:
        """获取所有学生"""
        return self._read_json(self.config.STUDENTS_FILE) or []
    
    def get_student_by_id(self, student_id: str) -> Optional[Dict[str, Any]]:
        """根据ID获取学生"""
        students = self.get_all_students()
        return next((s for s in students if s['id'] == student_id), None)
    
    def add_student(self, student_data: Dict[str, Any]) -> bool:
        """添加新学生"""
        students = self.get_all_students()
        
        # 检查ID是否已存在
        if any(s['id'] == student_data['id'] for s in students):
            return False
        
        # 添加时间戳
        student_data['createdAt'] = datetime.now().strftime('%Y-%m-%d')
        student_data['lastUpdate'] = datetime.now().strftime('%Y-%m-%d')
        
        students.append(student_data)
        return self._write_json(self.config.STUDENTS_FILE, students)
    
    def update_student(self, student_id: str, student_data: Dict[str, Any]) -> bool:
        """更新学生信息"""
        students = self.get_all_students()
        
        for i, student in enumerate(students):
            if student['id'] == student_id:
                student_data['lastUpdate'] = datetime.now().strftime('%Y-%m-%d')
                students[i] = {**student, **student_data}
                return self._write_json(self.config.STUDENTS_FILE, students)
        
        return False
    
    def delete_student(self, student_id: str) -> bool:
        """删除学生"""
        students = self.get_all_students()
        students = [s for s in students if s['id'] != student_id]
        return self._write_json(self.config.STUDENTS_FILE, students)
    
    # 科目相关方法
    def get_all_subjects(self) -> List[Dict[str, Any]]:
        """获取所有科目"""
        return self._read_json(self.config.SUBJECTS_FILE) or []
    
    def get_subject_by_id(self, subject_id: str) -> Optional[Dict[str, Any]]:
        """根据ID获取科目"""
        subjects = self.get_all_subjects()
        return next((s for s in subjects if s['id'] == subject_id), None)
    
    def add_subject(self, subject_data: Dict[str, Any]) -> bool:
        """添加新科目"""
        subjects = self.get_all_subjects()
        
        # 检查ID是否已存在
        if any(s['id'] == subject_data['id'] for s in subjects):
            return False
        
        subjects.append(subject_data)
        return self._write_json(self.config.SUBJECTS_FILE, subjects)
    
    def update_subject(self, subject_id: str, subject_data: Dict[str, Any]) -> bool:
        """更新科目信息"""
        subjects = self.get_all_subjects()
        
        for i, subject in enumerate(subjects):
            if subject['id'] == subject_id:
                subjects[i] = {**subject, **subject_data}
                return self._write_json(self.config.SUBJECTS_FILE, subjects)
        
        return False
    

    def delete_subject(self, subject_id: str) -> bool:
        """删除科目"""
        subjects = self.get_all_subjects()  # 🔧 修复这里的错误
        subjects = [s for s in subjects if s['id'] != subject_id]
        return self._write_json(self.config.SUBJECTS_FILE, subjects)

    
    def _sync_student_subjects(self, student_id: str) -> None:
        """同步学生的科目进度数据 - 关键修复"""
        student = self.get_student_by_id(student_id)
        if not student:
            return
        
        all_progress = self._read_json(self.config.PROGRESS_FILE) or {}
        student_progress = all_progress.get(student_id, {
            'studentId': student_id,
            'subjects': {}
        })
        
        # 确保学生拥有的每个科目都有进度数据
        for subject_id in student.get('subjects', []):
            if subject_id not in student_progress['subjects']:
                student_progress['subjects'][subject_id] = {
                    'currentLevel': 'grade_1',
                    'totalProgress': 0,
                    'tasks': {}
                }
                print(f"为学生 {student_id} 创建科目 {subject_id} 的进度数据")
        
        # 移除学生不再拥有的科目进度数据
        current_subjects = set(student.get('subjects', []))
        existing_subjects = set(student_progress['subjects'].keys())
        for subject_id in existing_subjects - current_subjects:
            del student_progress['subjects'][subject_id]
            print(f"移除学生 {student_id} 科目 {subject_id} 的进度数据")
        
        all_progress[student_id] = student_progress
        self._write_json(self.config.PROGRESS_FILE, all_progress)
    
    # 进度相关方法 - 修复版本
    def get_student_progress(self, student_id: str) -> Dict[str, Any]:
        """获取学生进度 - 自动同步科目数据"""
        # 首先同步科目数据
        self._sync_student_subjects(student_id)
        
        all_progress = self._read_json(self.config.PROGRESS_FILE) or {}
        
        if student_id not in all_progress:
            # 创建默认进度
            student = self.get_student_by_id(student_id)
            if not student:
                return {}
            
            default_progress = {
                'studentId': student_id,
                'subjects': {}
            }
            
            for subject_id in student.get('subjects', []):
                default_progress['subjects'][subject_id] = {
                    'currentLevel': 'grade_1',
                    'totalProgress': 0,
                    'tasks': {}
                }
            
            all_progress[student_id] = default_progress
            self._write_json(self.config.PROGRESS_FILE, all_progress)
        
        return all_progress[student_id]
    
    def save_student_progress(self, student_id: str, progress_data: Dict[str, Any]) -> bool:
        """保存学生进度"""
        all_progress = self._read_json(self.config.PROGRESS_FILE) or {}
        all_progress[student_id] = progress_data
        return self._write_json(self.config.PROGRESS_FILE, all_progress)
    
    # 统计方法
    def calculate_overall_progress(self, student_id: str) -> int:
        """计算学生总体进度"""
        progress_data = self.get_student_progress(student_id)
        subjects = self.get_all_subjects()
        
        total_tasks = 0
        completed_tasks = 0
        
        for subject_id in progress_data.get('subjects', {}):
            subject_data = progress_data['subjects'][subject_id]
            subject = next((s for s in subjects if s['id'] == subject_id), None)
            
            if subject and subject.get('levels'):
                for level in subject['levels']:
                    for chapter in level.get('chapters', []):
                        for task in chapter.get('tasks', []):
                            total_tasks += 1
                            task_progress = subject_data.get('tasks', {}).get(task['id'])
                            if task_progress and task_progress.get('status') == 'completed':
                                completed_tasks += 1
        
        return round((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0
    
    def calculate_subject_progress(self, student_id: str, subject_id: str) -> Dict[str, int]:
        """计算学科进度"""
        progress_data = self.get_student_progress(student_id)
        subject = self.get_subject_by_id(subject_id)
        
        if not subject or not subject.get('levels'):
            return {'progress': 0, 'completed': 0, 'total': 0}
        
        total_tasks = 0
        completed_tasks = 0
        
        for level in subject['levels']:
            for chapter in level.get('chapters', []):
                for task in chapter.get('tasks', []):
                    total_tasks += 1
                    subject_data = progress_data.get('subjects', {}).get(subject_id, {})
                    task_progress = subject_data.get('tasks', {}).get(task['id'])
                    if task_progress and task_progress.get('status') == 'completed':
                        completed_tasks += 1
        
        return {
            'progress': round((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0,
            'completed': completed_tasks,
            'total': total_tasks
        }

# 全局数据管理器实例
data_manager = DataManager()
