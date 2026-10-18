import os
from flask import Blueprint, render_template, request, session, jsonify, redirect, url_for, current_app
from db import update_user_field
from utils import is_valid_email, get_current_user
from werkzeug.utils import secure_filename

# создаем блюпринт для профиля
profile_bp = Blueprint('profile', __name__)

# страница профиля
@profile_bp.route('/profile')
def profile():
    user = get_current_user()
    if not user:
        return redirect(url_for('auth.entrance'))
    return render_template('profile.html', user=user)

# обновление конкретного поля профиля, вызывается из profile.js
@profile_bp.route('/update_profile', methods=['POST'])
def update_profile():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data"}), 400

    field = data.get('field')
    value = data.get('value')

    # разрешенные для редактирования поля
    allowed = ['name', 'login', 'email', 'password', 'age', 'hobbies', 'daily_goal', 'goal']
    if field not in allowed or value is None:
        return jsonify({"error": "Invalid data"}), 400

    value = str(value).strip() if field != 'password' else str(value)

    # проверки для почты
    if field == 'email' and not is_valid_email(value):
        return jsonify({"error": "Введите корректный email"}), 400

    # проверки для цели
    if field == 'goal':
        if not value:
            return jsonify({"error": "Цель не может быть пустой"}), 400
        if len(value) > 500:
            return jsonify({"error": "Максимум 500 символов"}), 400

    # форматирование логина, добавляем @ если забыл
    if field == 'login' and value and not value.startswith('@'):
        value = '@' + value

    # сохраняем в базу через функцию из database.py
    ok = update_user_field(user_id, field, value)
    if ok:
        return jsonify({"success": True}), 200

    return jsonify({"error": "Update failed"}), 500

@profile_bp.route('/upload_avatar', methods=['POST'])
def upload_avatar():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    if 'avatar' not in request.files:
        return jsonify({"error": "Файл не найден"}), 400

    file = request.files['avatar']
    if file.filename == '':
        return jsonify({"error": "Файл не выбран"}), 400

    if file:
        filename = secure_filename(file.filename)
        upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', 'avatars')
        os.makedirs(upload_folder, exist_ok=True)

        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)

        # сохраняем имя файла в базу данных
        ok = update_user_field(user_id, 'avatar', filename)
        if ok:
            avatar_url = url_for('static', filename=f'uploads/avatars/{filename}')
            return jsonify({"success": True, "avatar_url": avatar_url})

    return jsonify({"error": "Ошибка при загрузке"}), 500