import urllib.request
import json
import ssl

url = 'http://127.0.0.1:8000/api/v1/auth/login'
data = json.dumps({"email": "test@test.com", "password": "password"}).encode('utf-8')
headers = {'Content-Type': 'application/json'}

req = urllib.request.Request(url, data=data, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=5) as response:
        print("Status:", response.status)
        print("Body:", response.read().decode())
except Exception as e:
    print("Error:", e)
