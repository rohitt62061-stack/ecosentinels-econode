from supabase import create_client

url='https://erjbxuhdcjrptxwzzzer.supabase.co'
key='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyamJ4dWhkY2pycHR4d3p6emVyIiwicm9sIjoibm9uZSIsImlhdCI6MTc3NDA4NzU5MiwiZXhwIjoyMDg5NjYzNTkyfQ.rQTJyIQdLcOi0EcDeljSYmwm-OL9cUtDqILVsWmzQV8'
client=create_client(url,key)

r=client.table('iot_sensor_readings').select('*').limit(5).execute()
print('iot:', r.error, r.data)
w=client.table('wards').select('*').limit(5).execute()
print('wards:', w.error, w.data)
