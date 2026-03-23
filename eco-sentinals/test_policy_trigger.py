import requests
import json

url = "https://erjbxuhdcjrptxwzzzer.functions.supabase.co/generate-policy"
headers = {"Content-Type": "application/json"}
payload = {
  "record": {
    "id": "78f730ba-a121-4a80-bbb3-db5f142b29ca", 
    "ward_id": "662ae969-067a-4b6b-a0b3-ac28cc665fe9",
    "source_type": "industrial",
    "confidence_score": 0.88,
    "detected_at": "2026-03-21T21:00:00Z"
  }
}

try:
    res = requests.post(url, json=payload, headers=headers)
    print("Status:", res.status_code)
    print("Response:", res.text)
except Exception as e:
    print("Error:", str(e))
