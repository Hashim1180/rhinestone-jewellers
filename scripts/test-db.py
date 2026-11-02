import os, sys
from urllib.parse import urlparse

env_path = "/home/z/my-project/.env.local"
env = {}
with open(env_path) as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith("#"): continue
        if "=" not in line: continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip()

db_url = env.get("DATABASE_URL", "")
print(f"DB host: {urlparse(db_url).hostname}")
print(f"DB port: {urlparse(db_url).port}")
print(f"DB name: {urlparse(db_url).path.lstrip('/')}")

try:
    import psycopg2
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "psycopg2-binary"])
    import psycopg2

try:
    conn = psycopg2.connect(db_url, connect_timeout=15)
    cur = conn.cursor()
    cur.execute("SELECT version();")
    ver = cur.fetchone()[0]
    print(f"OK Connected. Server: {ver[:80]}...")
    cur.execute("SELECT current_database(), current_user;")
    db, user = cur.fetchone()
    print(f"   Database: {db}, User: {user}")
    cur.execute("SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")
    print(f"   Existing tables in public schema: {cur.fetchone()[0]}")
    cur.close(); conn.close()
    print("\nOK Database is ready for Prisma migrations.")
except Exception as e:
    print(f"FAIL Connection failed: {type(e).__name__}: {str(e)[:200]}")
    sys.exit(1)
