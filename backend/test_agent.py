import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"
AUTH_URL = f"{BASE_URL}/auth/login"
AGENT_URL = f"{BASE_URL}/ai/agent/chat"

# Test Credentials
USERNAME = "testuser"
PASSWORD = "password123"

def get_token():
    print("Getting token...")
    try:
        response = requests.post(AUTH_URL, json={
            "username": USERNAME,
            "password": PASSWORD
        })
        print(f"Login Status: {response.status_code}")
        print(f"Login Response: {response.text}")
        if response.status_code == 200:
            json_resp = response.json()
            if "data" in json_resp:
                token = json_resp["data"]["access_token"]
            else:
                token = json_resp["access_token"]
            print("Token obtained.")
            return token
        else:
            print(f"Failed to get token: {response.text}")
            # Try registering if login fails
            print("Trying to register...")
            reg_url = f"{BASE_URL}/auth/register"
            reg_resp = requests.post(reg_url, json={
                "username": USERNAME,
                "password": PASSWORD,
                "email": "test@example.com"
            })
            if reg_resp.status_code == 200:
                print("Registered. Logging in...")
                return get_token()
            else:
                print(f"Registration failed: {reg_resp.text}")
                return None
    except Exception as e:
        print(f"Connection failed: {e}")
        return None

def chat_with_agent(token, message, history=[]):
    print(f"\nUser: {message}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    data = {
        "message": message,
        "history": history
    }
    
    start_time = time.time()
    try:
        response = requests.post(AGENT_URL, headers=headers, json=data)
        elapsed = time.time() - start_time
        
        if response.status_code == 200:
            json_resp = response.json()
            if "data" in json_resp:
                ai_resp = json_resp["data"]["response"]
            else:
                ai_resp = json_resp["response"]
            print(f"Agent ({elapsed:.2f}s): {ai_resp}")
            return ai_resp
        else:
            print(f"Request failed: {response.text}")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    token = get_token()
    if not token:
        print("Cannot proceed without token.")
        return

    history = []
    
    # 1. Check Fridge
    resp1 = chat_with_agent(token, "看看我冰箱里有什么？", history)
    if resp1:
        history.append({"role": "user", "content": "看看我冰箱里有什么？"})
        history.append({"role": "assistant", "content": resp1})
    
    # 2. Add Item
    resp2 = chat_with_agent(token, "帮我把牛奶加入购物清单", history)
    if resp2:
        history.append({"role": "user", "content": "帮我把牛奶加入购物清单"})
        history.append({"role": "assistant", "content": resp2})
        
    # 3. Check Shopping List
    resp3 = chat_with_agent(token, "现在购物清单里有什么？", history)

if __name__ == "__main__":
    main()
