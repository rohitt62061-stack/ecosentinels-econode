import requests

url = "https://erjbxuhdcjrptxwzzzer.supabase.co/functions/v1/generate-advisories"
headers = {"Content-Type": "application/json"}

try:
    res = requests.post(url, headers=headers)
    print("Status:", res.status_code)
    print("Response:", res.text)
except Exception as e:
    print("Error:", str(e))
