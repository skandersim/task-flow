from db.connection import get_connection
from datetime import date
from werkzeug.security import generate_password_hash

def add_user(login, email, password):
    conn = get_connection()
    cursor = conn.cursor()
    registered_at = date.today().isoformat()
    hashed_password = generate_password_hash(password)

    cursor.execute(
        'INSERT INTO users (login, email, password, registered_at) VALUES (?, ?, ?, ?)',
        (login, email, hashed_password, registered_at)
    )

    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    return user_id

def add_profile(user_id, avatar, name, age, hobbies, daily_goal, goals):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO profiles (user_id, avatar, name, age, hobbies, daily_goal, goals)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, avatar, name, age, hobbies, daily_goal, goals))

    conn.commit()
    conn.close()

def get_user_data(user_id):
    conn = get_connection(row_factory=True)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT users.*, profiles.* 
        FROM users 
        LEFT JOIN profiles ON users.id = user_id 
        WHERE users.id = ?
    """, (user_id,))

    user = cursor.fetchone()
    conn.close()
    return user

def check_login(login_input):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, login, email, password FROM users 
        WHERE login = ? OR email = ?
    """, (login_input, login_input))
    
    user_data = cursor.fetchone()
    conn.close()
    return user_data

def update_user_field(user_id, field, value):
    users_fields = ['login', 'email', 'password']
    profiles_fields = {
        'name': 'name',
        'age': 'age',
        'hobbies': 'hobbies',
        'daily_goal': 'daily_goal',
        'goal': 'goals',
        'avatar': 'avatar',
    }

    conn = get_connection()
    cursor = conn.cursor()

    try:
        if field in users_fields:
            cursor.execute(f'UPDATE users SET {field} = ? WHERE id = ?', (value, user_id))
        elif field in profiles_fields:
            column = profiles_fields[field]
            cursor.execute(f'UPDATE profiles SET {column} = ? WHERE user_id = ?', (value, user_id))
        else:
            conn.close()
            return False

        conn.commit()
        conn.close()
        return True
    except Exception as e:
        conn.close()
        print("update_user_field error:", e)
        return False

def update_level(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT completed_tasks_total FROM users WHERE id = ?", (user_id,)
    )
    row = cursor.fetchone()

    if row is None:
        conn.close()
        return None

    total = row[0]

    if total >= 100:
        level = 'Мастер'
    elif total >= 50:
        level = 'Профи'
    elif total >= 30:
        level = 'Специалист'
    elif total >= 15:
        level = 'Практик'
    elif total >= 5:
        level = 'Ученик'
    else:
        level = 'Новичок'

    cursor.execute(
        "UPDATE users SET level = ? WHERE id = ?", (level, user_id)
    )

    conn.commit()
    conn.close()
    return level

def delete_user_data(user_id):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT 1 FROM users WHERE id = ?", (user_id, )
        )

        if cursor.fetchone() is None:
            return False

        cursor.execute("DELETE FROM tasks WHERE user_id = ?", (user_id, ))
        cursor.execute("DELETE FROM profiles WHERE user_id = ?", (user_id, ))
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id, ))

        deleted = cursor.rowcount == 1
        conn.commit()
        return deleted
    
    except Exception:
        conn.rollback()
        raise

    finally:
        conn.close()