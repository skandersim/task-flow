from flask import Blueprint, render_template, session, redirect, url_for
from db import get_user_tasks
from datetime import datetime

main_bp = Blueprint('main', __name__)

@main_bp.route('/main')
def main_page():
    user_id = session.get('user_id')
    
    if not user_id:
        return redirect(url_for('auth.entrance'))

    user_tasks = get_user_tasks(user_id=user_id)

    today = datetime.now().date()
    today_tasks = []
    overdue = []

    for task in user_tasks:
        if task.get('is_deleted', 0) != 0:
            continue

        due_raw = task.get('due_date')
        if not due_raw:
            continue

        try:
            due_date = datetime.strptime(due_raw, '%d.%m.%Y').date()
        except (TypeError, ValueError):
            continue

        if due_date == today:
            today_tasks.append(task)
        elif due_date < today and task.get('status') != 'done':
            overdue.append(task)

    total = len(user_tasks)
    completed = sum(1 for t in user_tasks if t.get('status') == 'done')
    pending = total - completed 
    
    percent = round((completed / total) * 100) if total > 0 else 0

    return render_template(
        'main.html',
        tasks=user_tasks,
        total=total,
        completed=completed,
        pending=pending,
        overdue=len(overdue),
        percent=percent,
        today_tasks=today_tasks
    )