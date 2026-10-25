import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")


def get_connection():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL не найден в переменных окружения! Проверь файл .env")
    return psycopg2.connect(DATABASE_URL)


class InterpolatingDictCursor(RealDictCursor):
    def execute(self, query, params=None):
        query = query.replace("?", "%s")
        return super().execute(query, params)