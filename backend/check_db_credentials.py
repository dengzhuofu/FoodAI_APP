import pymysql
import os
from dotenv import load_dotenv

# Try to load .env
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

current_password = os.getenv("DATABASE_URL", "").split(":")[2].split("@")[0] if "://" in os.getenv("DATABASE_URL", "") else ""

passwords_to_try = [
    current_password,
    "",
    "root",
    "123456",
    "password",
    "admin"
]

# Remove duplicates and empty strings if any (unless empty string is a valid password check)
passwords_to_try = list(dict.fromkeys(passwords_to_try))

print(f"Testing connection to MySQL on localhost:3306...")

connected = False
correct_password = None

for pwd in passwords_to_try:
    print(f"Trying password: '{pwd}' ...")
    try:
        conn = pymysql.connect(
            host='localhost',
            user='root',
            password=pwd,
            port=3306,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        print(f"SUCCESS! Connected with password: '{pwd}'")
        connected = True
        correct_password = pwd
        
        # Check if database exists, if not create it
        try:
            with conn.cursor() as cursor:
                cursor.execute("CREATE DATABASE IF NOT EXISTS foodai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
                print("Database 'foodai' checked/created successfully.")
        except Exception as e:
            print(f"Error creating database: {e}")
        finally:
            conn.close()
        
        break
    except pymysql.err.OperationalError as e:
        if e.args[0] == 1045: # Access denied
            print("Access denied.")
        else:
            print(f"Other error: {e}")
    except Exception as e:
        print(f"Connection failed: {e}")

if connected:
    print(f"\nFOUND VALID CREDENTIALS!")
    print(f"User: root")
    print(f"Password: {correct_password}")
    
    # Update .env file
    if correct_password != current_password:
        print("Updating .env file with correct password...")
        with open(env_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        new_lines = []
        for line in lines:
            if line.strip().startswith("DATABASE_URL="):
                # Construct new URL
                # Assuming standard format: mysql://root:PASSWORD@localhost:3306/foodai
                new_url = f"DATABASE_URL=mysql://root:{correct_password}@localhost:3306/foodai\n"
                new_lines.append(new_url)
            else:
                new_lines.append(line)
        
        with open(env_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(".env file updated.")
    else:
        print(".env file is already correct.")

else:
    print("\nFAILED TO CONNECT with common passwords.")
    print("Please manually update the DATABASE_URL in backend/.env with the correct MySQL root password.")
