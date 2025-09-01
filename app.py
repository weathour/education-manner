
from flask import Flask, render_template, send_from_directory
from flask_cors import CORS
from api import api
from config import Config
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # 启用CORS
    CORS(app)
    
    # 注册API蓝图
    app.register_blueprint(api, url_prefix='/api')
    
    # 主页路由
    @app.route('/')
    def index():
        return render_template('index.html')
    
    # 静态文件路由 - 修复这里
    @app.route('/static/<path:filename>')
    def static_files(filename):
        return send_from_directory('static', filename)
    
    # 错误处理
    @app.errorhandler(404)
    def not_found(error):
        return render_template('index.html')
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    # 确保数据目录存在
    os.makedirs(app.config['DATA_DIR'], exist_ok=True)
    
    print("🚀 学习进度管理系统启动中...")
    print("📝 访问地址: http://localhost:5000")
    print("🔧 API文档: http://localhost:5000/api")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
