import os
from flask import (
    Blueprint,
    render_template,
    request, redirect,
    url_for, session, current_app)
from werkzeug.utils import secure_filename
from db import check_login, add_user, add_profile, delete_user_data
from werkzeug.security import check_password_hash
from db.connection import get_connection

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/')
def home():
    return render_template('index.html')


@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        login = request.form.get("login")
        email = request.form.get("email")
        password = request.form.get("password")
        confirm_password = request.form.get("confirm_password")

        login_db = "@" + login.lstrip("@") if login else ""

        if confirm_password != password:
            return render_template(
                "registration.html",
                error="Пароли не совпадают",
                login=login,
                email=email
            )

        if check_login(login_db):
            return render_template(
                "registration.html",
                error="Имя пользователя занято",
                login=login,
                email=email
            )

        if check_login(email):
            return render_template(
                "registration.html",
                error="Пользователь с такой почтой уже зарегистрирован",
                login=login,
                email=email
            )

        add_user(login_db, email, password)
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users ORDER BY id DESC LIMIT 1")
        new_user_id = cursor.fetchone()[0]
        conn.close()
        session["user_id"] = new_user_id

        return redirect(url_for("auth.profile_setup"))

    return render_template("registration.html")

@auth_bp.route('/entrance', methods=['GET', 'POST'])
def entrance():
    if request.method == "POST":
        login = request.form.get('login')
        password = request.form.get('password')

        user = check_login(login)

        if user and check_password_hash(user[3], password):
            session['user_id'] = user[0]
            return redirect(url_for('main.main_page'))
        else:
            return render_template("entrance.html", error="Неверный логин или пароль")

    return render_template("entrance.html")

@auth_bp.route('/profile-setup', methods=['GET', 'POST'])
def profile_setup():
    if request.method == "POST":
        current_user_id = session.get('user_id')
        if not current_user_id:
            return redirect(url_for('auth.register'))

        avatar = request.files.get('avatar')
        name = request.form.get('name')
        age = request.form.get('age')
        hobbies = request.form.get('hobbies')
        daily_goal = request.form.get('daily_goal')
        goals = request.form.get('goals')
        avatar_filename = None

        if avatar and avatar.filename:
            upload_folder = os.path.join(
                current_app.root_path,
                'static',
                'uploads',
                'avatars'
            )
            os.makedirs(upload_folder, exist_ok=True)

            avatar_filename = secure_filename(avatar.filename)
            avatar_path = os.path.join(upload_folder, avatar_filename)
            avatar.save(avatar_path)

        add_profile(current_user_id, avatar_filename, name, age, hobbies, daily_goal, goals)

        return redirect(url_for('main.main_page'))

    return render_template("profile_setup.html")

@auth_bp.route('/logout', methods=['GET', 'POST'])
def logout():

    session.clear()
    return redirect(url_for('auth.entrance'))

@auth_bp.route('/delete_account', methods=['POST'])
def delete_account():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('auth.entrance'))

    delete_user_data(user_id)
    session.clear()

    return redirect(url_for('auth.entrance'))