import sys
import os
from datetime import date
from dotenv import load_dotenv

# Ensure we can import app
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
load_dotenv()

from app.database.client import get_supabase_client

db = get_supabase_client()
goal_id = "00000000-0000-0000-0000-000000000002"
user_id = "00000000-0000-0000-0000-000000000001"

try:
    db.table("goals").upsert({
        "id": goal_id,
        "user_id": user_id,
        "title": "Master DSA (Striver A-Z)",
        "category": "DSA",
        "type": "dsa",
        "start_date": str(date.today()),
        "end_date": str(date.today()),
        "status": "active"
    }).execute()
    print("Test Goal successfully seeded!")
except Exception as e:
    print(f"Error seeding goal: {e}")
