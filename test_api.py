import http.client
import json

conn = http.client.HTTPConnection("localhost", 3000)
payload = {
    "owner": "6778f2e20000000000000001",
    "templateId": "leadboost-funnel",
    "websiteName": "Test Website Python",
    "brandName": "Test Brand Python",
    "goal": "leads"
}
headers = {'Content-type': 'application/json'}
conn.request("POST", "/api/websites", json.dumps(payload), headers)
response = conn.getresponse()
print(f"Status: {response.status}")
print(f"Reason: {response.reason}")
print(f"Body: {response.read().decode()}")
