import urllib.request, json, jwt, time

payload = {'user_id': 'test123', 'email': 'test@test.com', 'name': 'Test', 'exp': int(time.time()) + 3600}
token = jwt.encode(payload, 'energyiq_secret_key_2025', algorithm='HS256')
print(f'Token: {token[:30]}...')

# Test dashboard
req = urllib.request.Request('http://localhost:5000/dashboard')
req.add_header('Authorization', f'Bearer {token}')
try:
    r = urllib.request.urlopen(req)
    data = json.loads(r.read())
    print(f'Dashboard OK: {len(data.get("monthly", []))} monthly entries')
except urllib.error.HTTPError as e:
    print(f'Dashboard error: {e.code} - {e.read().decode()}')
except Exception as e:
    print(f'Dashboard error: {e}')

# Test predict
req3 = urllib.request.Request('http://localhost:5000/predict', data=json.dumps({'month': 'August'}).encode(), method='POST')
req3.add_header('Authorization', f'Bearer {token}')
req3.add_header('Content-Type', 'application/json')
try:
    r3 = urllib.request.urlopen(req3)
    data3 = json.loads(r3.read())
    print(f'Predict OK: {json.dumps(data3, indent=2)}')
except urllib.error.HTTPError as e:
    print(f'Predict error: {e.code} - {e.read().decode()}')
except Exception as e:
    print(f'Predict error: {e}')
