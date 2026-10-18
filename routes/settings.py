from flask import Blueprint, redirect, url_for, session, render_template

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/settings')
def settings_page():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('auth.entrance'))
    return render_template('settings.html')