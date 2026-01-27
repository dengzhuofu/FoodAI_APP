import pymysql
import os
from dotenv import load_dotenv

# Try to load .env
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

db_url = os.getenv("DATABASE_URL", "")
print(f"Testing DB URL: {db_url}")

# Parse URL simply
try:
    # mysql://user:pass@host:port/db
    # Handle password containing '@'
    part1 = db_url.split("://")[1]
    last_at_index = part1.rfind("@")
    user_pass = part1[:last_at_index]
    host_port_db = part1[last_at_index+1:]
    
    user, password = user_pass.split(":", 1)
    host_port, db = host_port_db.split("/")
    host, port = host_port.split(":")
    
    print(f"Parsed: User={user}, Host={host}, Port={port}, DB={db}")
    
    conn = pymysql.connect(
        host=host,
        user=user,
        password=password,
        port=int(port),
        database=db,
        charset='utf8mb4'
    )
    print("SUCCESS! Connected to database.")
    conn.close()
    
except Exception as e:
    print(f"Connection Failed: {e}")
    exit(1)
