import urllib.request, json, jwt, time, traceback

payload = {'user_id': 'test123', 'email': 'test@test.com', 'name': 'Test', 'exp': int(time.time()) + 3600}
token = jwt.encode(payload, 'energyiq_secret_key_2025', algorithm='HS256')

req = urllib.request.Request('http://localhost:5000/predict', data=json.dumps({'month': 'August'}).encode(), method='POST')
req.add_header('Authorization', f'Bearer {token}')
req.add_header('Content-Type', 'application/json')
try:
    r = urllib.request.urlopen(req)
    print(json.dumps(json.loads(r.read()), indent=2))
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f'HTTP {e.code}:')
    print(body)
except Exception as e:
    traceback.print_exc()
