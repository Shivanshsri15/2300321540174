Core actions / API CONTRACTS:
1. register
2. login
3. list notifications for logged-in user
4. get single notification
5. send notification to userIds provided from frontend

Dev Note:
MongoDB for storage . API endpoints use string for all ids. routes/, controllers/, services/, repositories/. uses logging_middleware package for Log() and expressLoggingMiddleware().

JSON schemas (API):

Notification:
{
  "_id": "string",
  "userId": "string",
  "title": "string",
  "body": "string",
  "createdAt": "Date"
}

User:
{
  "_id": "string",
  "email": "string",
  "rollNo": "string"
}

---
API CONTRACTS:

POST /api/auth/register

Headers:
Content-Type: application/json

Request:
{
  "email": "string",
  "password": "string",
  "rollNo": "string"
}

Response 201:
{
  "token": "string",
  "user": { "_id": "string", "email": "string", "rollNo": "string" }
}

Response 400: invalid request body or email already exists

---

POST /api/auth/login

Headers:
Content-Type: application/json

Request:
{
  "email": "shivansh.23b1541031@abes.ac.in",
  "password": "string"
}

Response 200:
{
  "token": "string",
  "user": { "_id": "string", "email": "string", "rollNo": "string" }
}

Response 401: invalid credentials

---

GET /api/notifications

Headers:
Authorization: Bearer <token>

Returns notifications for userId from token.

Response 200:
{
  "notifications": [ Notification ]
}

Response 401: unauthorized

---

GET /api/notifications/:id (id is string)

Headers:
Authorization: Bearer <token>

Response 200: Notification

Response 401: unauthorized
Response 404: notification not found

---

POST /api/notifications

Headers:
Content-Type: application/json
Authorization: Bearer <token>

Creates notification for each userId in request.

Request:
{
  "userIds": ["string"],
  "title": "string",
  "body": "string",
  "category": "placements | events | results"
}

Response 201:
{
  "notifications": [ Notification ]
}

Response 400: invalid request body
Response 401: unauthorized

