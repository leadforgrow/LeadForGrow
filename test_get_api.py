import http.client
import json

conn = http.client.HTTPConnection("localhost", 3000)
conn.request("GET", "/api/websites?userId=6778f2e20000000000000001")
response = conn.getresponse()
print(f"Status: {response.status}")
print(f"Body: {response.read().decode()}")
