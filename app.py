from flask import Flask
from db import init_db
from utils import get_current_user, format_date_dmy
import os
from dotenv import load_dotenv

load_dotenv()

# импортируем блюпринты
from routes.auth import auth_bp
from routes.main import main_bp
from routes.tasks import tasks_bp
from routes.profile import profile_bp
from routes.calendar import calendar_bp
from routes.stats import stats_bp
from routes.settings import settings_bp

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY")
app.add_template_filter(format_date_dmy, "date_dmy")

# регистрируем все модули в приложении
app.register_blueprint(auth_bp)
app.register_blueprint(main_bp)
app.register_blueprint(tasks_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(calendar_bp)
app.register_blueprint(stats_bp)
app.register_blueprint(settings_bp)

# чтобы переменная user была доступна во всех html-шаблонах автоматически
@app.context_processor
def inject_user():
    return dict(user=get_current_user())

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)