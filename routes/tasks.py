from flask import Blueprint, render_template, request, redirect, url_for, session, jsonify
from db import get_user_tasks, add_task, delete_task, edit_task, update_task_status, update_level

tasks_bp = Blueprint('tasks', __name__)

#страница со списком задач
@tasks_bp.route('/tasks')
def tasks_page():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('auth.entrance'))

    user_tasks = get_user_tasks(user_id=user_id)
    return render_template('new_task.html', tasks=user_tasks)

#создание новой задачи
@tasks_bp.route('/tasks/new', methods=['POST'])
def new_tasks():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('auth.entrance'))

    title = request.form.get('title')
    description = request.form.get('description')
    due_date = request.form.get('due_date')
    due_time = request.form.get('due_time')
    priority = request.form.get('priority')
    hobbies = request.form.get('hobbies')
    status = request.form.get('status') or 'not-started'

    add_task(user_id, title, description, due_date, due_time, priority, hobbies, status)
    return redirect(url_for('tasks.tasks_page'))

#удаление задачи
@tasks_bp.route('/tasks/delete/<int:task_id>', methods=['POST'])
def delete_task_route(task_id):
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('auth.entrance'))

    delete_task(task_id, user_id)
    return redirect(url_for('tasks.tasks_page'))

#редактирование задачи
@tasks_bp.route('/tasks/edit/<int:task_id>', methods=['POST'])
def task_edit(task_id):
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('auth.entrance'))

    title = request.form.get('title')
    description = request.form.get('description')
    due_date = request.form.get('due_date')
    due_time = request.form.get('due_time')
    priority = request.form.get('priority')

    edit_task(task_id, user_id, title, description, due_date, due_time, priority)
    return redirect(url_for('tasks.tasks_page'))

#быстрая смена статуса, вызывается из JS при клике на галочку или статус
@tasks_bp.route('/tasks/<int:task_id>/status', methods=['POST'])
def change_status(task_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}
    new_status = data.get('status')

    if new_status:
        update_task_status(task_id, user_id, new_status)
        if new_status == "done":
            update_level(user_id)
            
        return jsonify({"success": True})

    return jsonify({"error": "Invalid status"}), 400