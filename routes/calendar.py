from flask import Blueprint, render_template, redirect, url_for, session
from db import get_user_tasks

calendar_bp = Blueprint('calendar', __name__)

@calendar_bp.route('/calendar', methods=["GET", "POST"])
def calendare_page():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('auth.entrance'))

    user_tasks = get_user_tasks(user_id)
    return render_template('calendar.html', tasks=user_tasks)