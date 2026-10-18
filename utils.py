import re
from flask import url_for, session
from db import get_user_data
from datetime import datetime

#задаем шаблон для email
EMAIL_RE = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@"
    r"[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?"
    r"(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$"
)

def is_valid_email(email):
    if not email or not EMAIL_RE.match(email) or len(email) > 254:
        return False
    domain = email.split('@')[-1]
    tld = domain.split('.')[-1] if '.' in domain else ''
    return len(tld) >= 2

def format_user_dict(user_row):
    if not user_row:
        return None
    user_dict = dict(user_row)
    avatar_file = user_dict.get('avatar')
    if avatar_file:
        if str(avatar_file).startswith('/static') or str(avatar_file).startswith('http'):
            user_dict['avatar'] = avatar_file
        else:
            user_dict['avatar'] = url_for('static', filename=f'uploads/avatars/{avatar_file}')
    else:
        user_dict['avatar'] = None

    user_dict['goal'] = user_dict.get('goals') or ''
    return user_dict

def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return None
    user = get_user_data(user_id)
    return format_user_dict(user)

def format_date_dmy(value):
    if not value:
        return "—"

    try:
        return datetime.fromisoformat(value).strftime("%d.%m.%Y")
    except (TypeError, ValueError):
        return value