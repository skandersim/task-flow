import os
import sqlite3

DB_NAME = 'database.db'

if os.environ.get('DATABASE_URL'):
    import psycopg2
    from psycopg2.extras import RealDictCursor

    class InterpolatingCursor(psycopg2.extensions.cursor):
        def execute(self, query, vars=None):
            query = query.replace("?", "%s")
            return super().execute(query, vars)

    class InterpolatingDictCursor(RealDictCursor):
        def execute(self, query, vars=None):
            query = query.replace("?", "%s")
            return super().execute(query, vars)

    def get_connection(row_factory=False):
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        if row_factory:
            conn.cursor_factory = InterpolatingDictCursor
        else:
            conn.cursor_factory = InterpolatingCursor
        return conn
else:
    def get_connection(row_factory=False):
        conn = sqlite3.connect(DB_NAME)
        if row_factory:
            conn.row_factory = sqlite3.Row
        return conn