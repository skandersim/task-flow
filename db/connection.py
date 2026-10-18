import sqlite3

DB_NAME = 'database.db'

def get_connection(row_factory=False):
    conn = sqlite3.connect(DB_NAME)
    if row_factory:
        conn.row_factory = sqlite3.Row
    return conn