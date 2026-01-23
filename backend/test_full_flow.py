import requests
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"
USERNAME = "testuser"
PASSWORD = "password123"

def print_pass(msg):
    print(f"✅ PASS: {msg}")

def print_fail(msg, error=None):
    print(f"❌ FAIL: {msg}")
    if error:
        print(f"   Error: {error}")

def login():
    url = f"{BASE_URL}/auth/login"
    try:
        response = requests.post(url, json={"username": USERNAME, "password": PASSWORD})
        if response.status_code == 200:
            token = response.json()["access_token"]
            print_pass("Login successful")
            return token
        else:
            print_fail("Login failed", response.text)
            return None
    except Exception as e:
        print_fail("Login exception", e)
        return None

def test_inventory(token):
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Get Inventory
    try:
        res = requests.get(f"{BASE_URL}/fridge", headers=headers)
        if res.status_code == 200:
            print_pass(f"Get Inventory ({len(res.json())} items)")
        else:
            print_fail("Get Inventory", res.text)
    except Exception as e:
        print_fail("Get Inventory exception", e)

    # 2. Add Item
    item_id = None
    try:
        new_item = {
            "name": "Integration Test Apple",
            "category": "水果",
            "quantity": "5",
            "expiry_date": "2025-12-31",
            "icon": "🍎"
        }
        res = requests.post(f"{BASE_URL}/fridge", headers=headers, json=new_item)
        if res.status_code == 200:
            item = res.json()
            item_id = item["id"]
            print_pass("Add Fridge Item")
        else:
            print_fail("Add Fridge Item", res.text)
    except Exception as e:
        print_fail("Add Fridge Item exception", e)

    # 3. Update Item (New Feature)
    if item_id:
        try:
            update_data = {
                "name": "Updated Test Apple",
                "category": "水果",
                "quantity": "10",
                "expiry_date": "2025-12-31",
                "icon": "🍏"
            }
            res = requests.put(f"{BASE_URL}/fridge/{item_id}", headers=headers, json=update_data)
            if res.status_code == 200:
                print_pass("Update Fridge Item")
                if res.json()["name"] == "Updated Test Apple":
                    print_pass("Update Verification")
                else:
                    print_fail("Update Verification (Name mismatch)")
            else:
                print_fail("Update Fridge Item", res.text)
        except Exception as e:
            print_fail("Update Fridge Item exception", e)

    # 4. Delete Item
    if item_id:
        try:
            res = requests.delete(f"{BASE_URL}/fridge/{item_id}", headers=headers)
            if res.status_code == 200:
                print_pass("Delete Fridge Item")
            else:
                print_fail("Delete Fridge Item", res.text)
        except Exception as e:
            print_fail("Delete Fridge Item exception", e)

def test_explore(token):
    headers = {"Authorization": f"Bearer {token}"}
    try:
        res = requests.get(f"{BASE_URL}/feed/recommend", headers=headers)
        if res.status_code == 200:
            data = res.json()
            print_pass(f"Get Recommendations ({len(data)} items)")
            if len(data) > 0:
                print(f"   Sample item: {data[0]['title']} ({data[0]['type']})")
        else:
            print_fail("Get Recommendations", res.text)
    except Exception as e:
        print_fail("Get Recommendations exception", e)

def main():
    print("🚀 Starting Integration Test...")
    token = login()
    if token:
        print("\n--- Testing Inventory ---")
        test_inventory(token)
        
        print("\n--- Testing Explore ---")
        test_explore(token)
    
    print("\n🏁 Test Finished.")

if __name__ == "__main__":
    main()
