import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()

# Securely load the Supabase URL and Service Key
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_SERVICE_KEY")

if not url or not key:
    raise ValueError("SUPABASE_URL or SUPABASE_SERVICE_KEY not found in environment variables.")

# Initialize the Supabase client
supabase: Client = create_client(url, key)
