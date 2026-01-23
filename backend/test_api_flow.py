import requests
import json
import os

BASE_URL = "http://localhost:8000/api/v1"
AUTH_URL = f"{BASE_URL}/auth/login"
UPLOAD_URL = f"{BASE_URL}/upload"
AI_CALORIE_URL = f"{BASE_URL}/ai/image-to-calorie"

# Test Credentials (ensure these match seed.py)
USERNAME = "testuser"
PASSWORD = "password123"

def get_token():
    print("Getting token...")
    response = requests.post(AUTH_URL, json={
        "username": USERNAME,
        "password": PASSWORD
    })
    if response.status_code == 200:
        token = response.json()["access_token"]
        print("Token obtained.")
        return token
    else:
        print(f"Failed to get token: {response.text}")
        return None

def create_dummy_image():
    # Create a small red square dummy image
    from PIL import Image
    img = Image.new('RGB', (100, 100), color = 'red')
    img.save('test_image.jpg')
    return 'test_image.jpg'

def upload_image(token, file_path):
    print("Uploading image...")
    headers = {"Authorization": f"Bearer {token}"}
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(UPLOAD_URL, headers=headers, files=files)
    
    if response.status_code == 200:
        url = response.json()["url"]
        print(f"Image uploaded. URL: {url}")
        return url
    else:
        print(f"Upload failed: {response.text}")
        return None

def test_ai_calorie(token, image_url):
    print("Testing AI calorie estimation...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    # Prepend base url if relative
    full_url = image_url
    if image_url.startswith("/"):
        full_url = f"http://localhost:8000{image_url}"
    
    data = {"image_url": full_url}
    response = requests.post(AI_CALORIE_URL, headers=headers, json=data)
    
    if response.status_code == 200:
        print("AI Response:")
        print(response.json())
    else:
        print(f"AI request failed: {response.text}")

def main():
    try:
        import PIL
    except ImportError:
        print("Pillow is required for this test script. Installing...")
        os.system("pip install Pillow requests")
        import PIL

    token = get_token()
    if not token:
        return

    img_path = create_dummy_image()
    try:
        uploaded_url = upload_image(token, img_path)
        if uploaded_url:
            test_ai_calorie(token, uploaded_url)
    finally:
        if os.path.exists(img_path):
            os.remove(img_path)

if __name__ == "__main__":
    main()
