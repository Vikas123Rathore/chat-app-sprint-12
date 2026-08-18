# ChatFlow - Project Development Prompt

## Project Name

ChatFlow - Real-Time Room Chat Application

## Project Type

MERN Stack Full-Stack Chat Application

## Technology Stack

### Frontend
- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Context API
- Socket.IO Client
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- Cookie-based Authentication
- Socket.IO
- Multer
- Cloudinary

---

# Project Objective

Build a beginner/fresher-level real-time room-based chat application.

Users should be able to:

1. Register an account
2. Login
3. Logout
4. View their profile
5. Update their profile
6. Create chat rooms
7. View available chat rooms
8. Join rooms
9. Select a room
10. Send text messages
11. Send image messages
12. Receive messages in real time
13. Delete their own messages
14. Delete rooms created by themselves

The application should use a simple and understandable architecture suitable for a fresher-level MERN project.

---

# Authentication

Use JWT authentication with HTTP-only cookies.

Authentication flow:

Register
    ↓
Hash password with bcrypt
    ↓
Create user
    ↓
Generate JWT
    ↓
Store JWT in HTTP-only cookie

Login
    ↓
Verify email/password
    ↓
Generate JWT
    ↓
Store JWT in HTTP-only cookie

Logout
    ↓
Clear JWT cookie
    ↓
Update user online status

---

# User Model

User should contain:

- name
- email
- password
- bio
- profilePicture
- isOnline
- lastSeen
- createdAt
- updatedAt

Never return the password to the frontend.

---

# Room System

The application must use room-based chat.

A room should contain:

- name
- description
- type
- image
- createdBy
- members
- createdAt
- updatedAt

Room types can be:

- public
- private
- personal

A user should be able to:

- create a room
- view rooms
- join a room
- select a room
- chat inside a room

Only the room creator can delete the room.

---

# Message System

A message should contain:

- room
- sender
- text
- image
- createdAt
- updatedAt

Messages must belong to a room.

Users should be able to send:

- text messages
- image messages

Only the sender should be allowed to delete their own message.

---

# Cloudinary

Use Cloudinary for image uploads.

Required architecture:

Frontend
    ↓
FormData
    ↓
Multer
    ↓
Cloudinary
    ↓
Cloudinary secure_url
    ↓
MongoDB

Do NOT store:

- Base64 images
- binary image data
- uploaded image files permanently in MongoDB

MongoDB should only store the Cloudinary URL.

---

# Real-Time Chat

Use Socket.IO.

When a user sends a message:

Frontend
    ↓
Backend
    ↓
MongoDB
    ↓
Socket.IO
    ↓
Users inside the room receive new message

Users should join the selected room through Socket.IO.

Example:

socket.emit("joinRoom", roomId)

When a message is created:

io.to(roomId).emit("newMessage", message)

---

# Backend API Structure

## Authentication

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

---

## User

GET /api/user/me

GET /api/user/all

PUT /api/user/update-profile

---

## Room

POST /api/room/create

GET /api/room/all

GET /api/room/:roomId

POST /api/room/:roomId/join

DELETE /api/room/:roomId

---

## Message

POST /api/message/send

GET /api/message/room/:roomId

DELETE /api/message/:messageId

---

# Frontend Structure

Use a simple component-based architecture.

frontend/src/

components/
    ChatBox.jsx
    CreateRoom.jsx
    MessageInput.jsx
    MessageList.jsx
    RoomList.jsx
    Sidebar.jsx
    UpdateProfile.jsx

context/
    AppContext.jsx

api/
    axios.js

pages/
    Home.jsx
    Login.jsx
    Register.jsx

---

# State Management

Use React Context API for application state.

State should contain:

- user
- rooms
- selectedRoom
- messages

Provide actions:

- login
- register
- logout
- createRoom
- selectRoom
- fetchMessages
- sendMessage
- updateProfile
- loadMe
- loadRooms

---

# Authentication Persistence

Refreshing the browser must NOT log the user out.

On application startup:

GET /api/user/me

The backend should read the JWT from the HTTP-only cookie.

If the token is valid:

Set the user in frontend state.

If the token is invalid:

Set user to null.

---

# CORS

Local development:

Frontend:
http://localhost:5173

Backend:
http://localhost:8000

Production:

Frontend:
Vercel URL

Backend:
Render URL

Use:

credentials: true

and allow only the frontend origin.

---

# Cookie Configuration

Development:

secure: false
sameSite: "lax"

Production:

secure: true
sameSite: "none"

Cookie should be:

httpOnly: true

The same cookie configuration must be used when:

- creating cookie
- logging in
- clearing cookie during logout

---

# Environment Variables

Backend `.env`:

PORT=8000

FRONTEND_URL=http://localhost:5173

MONGO_URI=your_mongodb_url

JWT_SECRET=your_jwt_secret

NODE_ENV=development

CLOUDINARY_CLOUD_NAME=your_cloudinary_name

CLOUDINARY_API_KEY=your_cloudinary_key

CLOUDINARY_API_SECRET=your_cloudinary_secret

Frontend `.env`:

VITE_API_URL=http://localhost:8000/api

VITE_SOCKET_URL=http://localhost:8000

Never commit `.env` files to GitHub.

---

# Deployment

Backend:

Render

Frontend:

Vercel

Production backend environment variables must be configured in Render.

Production frontend environment variables must be configured in Vercel.

Never hardcode localhost URLs for production.

---

# UI Requirements

Keep the UI modern but simple.

Use:

- dark theme
- Tailwind CSS
- responsive layout
- simple cards
- clean buttons
- loading states
- error messages
- empty states

Do not over-engineer the application.

The project should look like a professional fresher-level MERN project.

---

# Error Handling

Backend should return meaningful HTTP status codes.

400:
Invalid request

401:
Not authenticated

403:
Not authorized

404:
Resource not found

500:
Server error

Frontend should display friendly error messages.

---

# Security Requirements

- Hash passwords using bcrypt
- Never return passwords
- Use HTTP-only JWT cookies
- Use environment variables for secrets
- Never commit `.env`
- Validate uploaded files
- Allow image files only
- Use Cloudinary for image storage

---

# Important Fresher-Level Rule

Keep the code simple.

Avoid unnecessary:

- complex design patterns
- unnecessary abstractions
- complicated state management
- unnecessary dependencies

Every component and API should be easy for a fresher to explain in an interview.

---

# Sprint 11 Objective

This project demonstrates:

1. MERN integration
2. MongoDB database integration
3. Express REST APIs
4. React frontend integration
5. JWT authentication
6. Cookie-based authentication
7. CORS configuration
8. Full CRUD operations
9. Multipart FormData
10. Multer
11. Cloudinary
12. Real-time Socket.IO communication
13. Deployment using Render and Vercel

---

# Final Demo Flow

The final demo should demonstrate:

1. Register a new user
2. Login
3. Refresh browser and remain logged in
4. Create a room
5. Join/select the room
6. Send a text message
7. Send an image message
8. Show real-time message
9. Update profile
10. Logout
11. Login again
12. Show that room and messages remain stored in MongoDB

---

# Project Goal

Create a functional, clean and understandable MERN room-chat application that demonstrates full-stack integration and satisfies the Sprint 11 Fullstack requirements.
