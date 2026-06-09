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
  "read": "boolean",
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

Query params: read (true|false)

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

---

###### Stage 2

DB: MongoDB

Why MongoDB:
- notification data is document-shaped, matches API JSON
- flexible schema for future fields
- scales horizontally with sharding/replica sets
- good fit for per-userId read queries with indexes

DB schema:

users collection:
{
  _id: ObjectId,
  email: string (unique),
  password: string (hashed),
  rollNo: string
}

notifications collection:
{
  _id: ObjectId,
  userId: ObjectId (ref users._id),
  title: string,
  body: string,
  category: string,
  read: boolean,
  createdAt: Date
}

indexes:
- users: { email: 1 } unique
- notifications: { userId: 1, createdAt: -1 }
- notifications: { userId: 1, read: 1 }

Problems as data grows:
- slow list queries without index on userId
- large result sets for active users
- slow bulk writes when sending to many userIds at once
- memory/disk pressure if notifications collection grows unbounded
- ObjectId string conversion overhead at API layer (minor)

Solutions:
- index on userId + createdAt
- pagination on GET /api/notifications (limit)
- insertMany for batch send instead of multiple inserts
- archive or TTL old notifications if not needed long term
- shard notifications collection by userId at very large scale

Queries (MongoDB):

register:
db.users.insertOne({ email, password, rollNo })

login:
db.users.findOne({ email })

list notifications for logged-in user:
db.notifications.find({ userId: ObjectId(userId) }).sort({ createdAt: -1 })

list notifications by read status:
db.notifications.find({ userId: ObjectId(userId), read: true }).sort({ createdAt: -1 })
db.notifications.find({ userId: ObjectId(userId), read: false }).sort({ createdAt: -1 })

get single notification:
db.notifications.findOne({ _id: ObjectId(id), userId: ObjectId(userId) })

send notification to userIds from frontend:
db.notifications.insertMany(
  userIds.map(uid => ({ userId: ObjectId(uid), title, body, category, read: false, createdAt: new Date() }))
)

---

###### Stage 3

Scenario: 50k students, 5M notifications. slow query to fetch unread notifications for one student.

Query (MongoDB equivalent):
db.notifications.find({ userId: ObjectId(userId), read: false }).sort({ createdAt: 1 })

1. Is the query accurate?
Yes. it filters by userId and read false, sorts oldest first. logic is also correct for unread notifications for one student only.

2. Why is it slow?
At 5M docs MongoDB likely does a collection scan or uses a weak index. without a compound index on userId + read + createdAt, the engine scans too many documents. returning all fields on a large unread list adds I/O. if a student has thousands of unread items, sorting in memory also hurts. avg 100 notifications per student means hot users block longer.

3. What to change and cost?

- add compound index: { userId: 1, read: 1, createdAt: 1 }
  cost: one-time index build on 5M docs (CPU + disk, slower writes after). reads become index scans, much faster.

- use projection, only return needed fields (_id, title, body, createdAt)
  cost: almost free. less data over the wire.

- add pagination with limit 
  cost: free. avoids loading entire unread list at once.

- run explain("executionStats") to confirm IXSCAN not COLLSCAN
  cost: negligible. confirms index is actually used.

4. Index every column?
No. bad advice. each index slows inserts/updates because every write updates all indexes. indexes on low-cardinality fields alone (like read boolean) are weak. index only fields used in filter + sort together. our case: userId, read, createdAt, and maybe category for type queries.

5. Students who got a placement notification in last 7 days:

db.notifications.aggregate([
  {
    $match: {
      category: "placements",
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }
  },
  { $group: { _id: "$userId" } },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "student"
    }
  },
  { $unwind: "$student" },
  { $project: { _id: 0, email: "$student.email", rollNo: "$student.rollNo" } }
])

index to support this: { category: 1, createdAt: -1 }

