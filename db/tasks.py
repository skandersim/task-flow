from db.connection import get_connection, InterpolatingDictCursor


def get_user_tasks(user_id):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=InterpolatingDictCursor)

    cursor.execute(
        'SELECT * FROM tasks WHERE user_id = %s AND is_deleted = 0',
        (user_id,)
    )
    tasks = cursor.fetchall()

    conn.close()
    return tasks


def add_task(user_id, title, description, due_date, due_time, priority, hobbies, status):
    if title == '':
        title = None
    if description == '':
        description = None
    if due_date == '':
        due_date = None
    if due_time == '':
        due_time = None
    if priority == '':
        priority = None
    if hobbies == '':
        hobbies = None
    if status == '':
        status = None
    
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO tasks (user_id, title, description, due_date, due_time, priority, hobbies, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
    ''', (user_id, title, description, due_date, due_time, priority, hobbies, status))

    conn.commit()
    conn.close()


def delete_task(task_id, user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        'UPDATE tasks SET is_deleted = 1 WHERE id = %s AND user_id = %s',
        (task_id, user_id)
    )

    conn.commit()
    conn.close()


def edit_task(task_id, user_id, title, due_date, priority):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE tasks
        SET title = %s, due_date = %s, priority = %s
        WHERE id = %s AND user_id = %s
    ''', (title, due_date, priority, task_id, user_id))

    conn.commit()
    conn.close()


def update_task_status(task_id, user_id, status):
    allowed_statuses = {"not-started", "process", "done"}
    if status not in allowed_statuses:
        return False

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE tasks SET status = %s
        WHERE id = %s AND user_id = %s AND is_deleted = 0
    """, (status, task_id, user_id))

    if cursor.rowcount == 0:
        conn.close()
        return False

    if status == "done":
        cursor.execute("""
            UPDATE tasks SET level_rewarded = 1
            WHERE id = %s AND user_id = %s
            AND is_deleted = 0 AND level_rewarded = 0
        """, (task_id, user_id))

        if cursor.rowcount == 1:
            cursor.execute("""
                UPDATE users
                SET completed_tasks_total = completed_tasks_total + 1
                WHERE id = %s
            """, (user_id,))

    conn.commit()
    conn.close()
    return True


def get_user_tasks_history(user_id):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=InterpolatingDictCursor)
    cursor.execute('SELECT * FROM tasks WHERE user_id = %s', (user_id,))
    tasks = cursor.fetchall()
    conn.close()
    return tasks