from flask import Blueprint, render_template, session, redirect, url_for
from db import get_user_tasks_history, get_user_tasks
from datetime import datetime, date

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('/stats')
def stats_page():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('auth.entrance'))

    today = datetime.now().date()

    all_tasks = get_user_tasks_history(user_id)
    user_tasks = get_user_tasks(user_id)

    total = len(user_tasks)
    completed = sum(1 for t in user_tasks if t.get('status') == 'done')
    work_tasks = total - completed 

    total_tasks = len(all_tasks)
    done_tasks = 0
    overdue_tasks = 0

    high_priority = 0
    average_priority = 0
    low_priority = 0

    work_hobbies = 0
    study_hobbies = 0
    sport_hobbies = 0
    lifestyle_hobbies = 0

    for task in all_tasks:
        if task['due_date']:
            due_raw = task['due_date']
            if isinstance(due_raw, date):
                task_date = due_raw
            else:
                task_date = datetime.strptime(due_raw, '%d.%m.%Y').date()

            if task_date < today and task['is_deleted'] == 0 and task['status'] != 'done': 
                overdue_tasks += 1

        if task['status'] == 'done':
            done_tasks += 1

        if task['priority'] == 'high':
            high_priority += 1
        elif task['priority'] == 'average':
            average_priority += 1
        else:
            low_priority += 1

        if task['hobbies'] == 'work':
            work_hobbies += 1
        elif task['hobbies'] == 'study':
            study_hobbies += 1
        elif task['hobbies'] == 'sport':
            sport_hobbies += 1
        else:
            lifestyle_hobbies += 1

    percent = round((completed / total) * 100) if total > 0 else 0
    study_percent = round((study_hobbies / total_tasks) * 100) if total_tasks > 0 else 0
    work_percent = round((work_hobbies / total_tasks) * 100) if total_tasks > 0 else 0
    sport_percent = round((sport_hobbies / total_tasks) * 100) if total_tasks > 0 else 0
    lifestyle_percent = round((lifestyle_hobbies / total_tasks) * 100) if total_tasks > 0 else 0

    return render_template(
        'stats.html',
        total_tasks=total_tasks,
        done_tasks=done_tasks,
        work_tasks=work_tasks,
        overdue_tasks=overdue_tasks,
        percent=percent,
        high_priority=high_priority,
        average_priority=average_priority,
        low_priority=low_priority,
        completed=completed,
        total=total,
        work_hobbies=work_hobbies,
        study_hobbies=study_hobbies,
        sport_hobbies=sport_hobbies,
        lifestyle_hobbies=lifestyle_hobbies,
        study_percent=study_percent,
        work_percent=work_percent,
        sport_percent=sport_percent,
        lifestyle_percent=lifestyle_percent
    )