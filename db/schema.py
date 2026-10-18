from db.connection import get_connection

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            login TEXT,
            email TEXT,
            password TEXT,
            registered_at TEXT NOT NULL,
            level TEXT NOT NULL DEFAULT 'Новичок',
            completed_tasks_total INTEGER NOT NULL DEFAULT 0
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            avatar VARCHAR(255),
            name TEXT,
            age TEXT,
            hobbies TEXT,
            daily_goal TEXT,
            goals TEXT
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT,
            description TEXT,
            due_date TEXT,
            due_time TEXT,
            priority TEXT,
            hobbies TEXT,
            status TEXT DEFAULT 'not-started',
            is_deleted INTEGER DEFAULT 0,
            level_rewarded INTEGER NOT NULL DEFAULT 0
        )
    ''')

    conn.commit()
    conn.close()