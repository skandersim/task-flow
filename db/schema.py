from db.connection import get_connection


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            login VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            registered_at DATE NOT NULL DEFAULT CURRENT_DATE,
            completed_tasks_total INTEGER DEFAULT 0,
            level VARCHAR(20) DEFAULT 'Новичок'
        )       
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS profiles (
            user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            avatar VARCHAR(255),
            name VARCHAR(100),
            age VARCHAR(10),
            hobbies TEXT,
            daily_goal VARCHAR(50),
            goals TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            due_date DATE,
            due_time TIME,
            priority VARCHAR(20),
            hobbies VARCHAR(100),
            status VARCHAR(20) NOT NULL DEFAULT 'not-started',
            is_deleted INTEGER DEFAULT 0,
            level_rewarded INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()