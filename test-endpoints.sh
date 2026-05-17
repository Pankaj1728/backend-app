#!/bin/bash

# Get admin credentials from first admin in DB
EMAIL=$(mongosh crm --quiet --eval 'db.users.findOne({role: "admin"}).email' | grep -v "^test" | tr -d '"')
echo "Testing with email: $EMAIL"

# Try to login (you'll need to update password if different)
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"admin123\"}" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed. Trying different password..."
  TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"password123\"}" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
  echo "Could not get token. Please check credentials."
  exit 1
fi

echo "Got token: ${TOKEN:0:20}..."
echo ""
echo "=== Testing Recently Joined Endpoint ==="
curl -s http://localhost:3000/api/users/recently-joined \
  -H "Authorization: Bearer $TOKEN" | head -100

echo ""
echo ""
echo "=== Testing Upcoming Birthdays Endpoint ==="
curl -s http://localhost:3000/api/users/upcoming-birthdays \
  -H "Authorization: Bearer $TOKEN" | head -100
