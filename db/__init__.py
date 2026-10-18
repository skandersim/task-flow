from db.schema import init_db
from db.users import add_user, add_profile, get_user_data, check_login, update_user_field, update_level, delete_user_data
from db.tasks import get_user_tasks, add_task, delete_task, edit_task, update_task_status, get_user_tasks_history