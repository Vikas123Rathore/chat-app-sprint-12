# ChatFlow — MERN Room Chat Application

A beginner-friendly real-time chat application built using the **MERN Stack**. Users can register, log in, create and join chat rooms, exchange messages, and update their profiles.

This project was developed as part of **Prodesk Sprint 12 / Fullstack System Integration**.

## 🚀 Features

* User Registration & Login
* Cookie-based JWT Authentication
* User Logout
* Update Profile
* Create Chat Rooms
* Join Chat Rooms
* Room-based Chat
* Send and receive messages
* Real-time messaging with Socket.IO
* MongoDB data persistence
* Image upload using Cloudinary
* Responsive React UI
* Axios API integration
* Vite development server
* Express REST APIs
* CORS configuration

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* React Router
* Socket.IO Client
* Lucide React

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* Cookie Parser
* CORS
* Socket.IO
* Multer
* Cloudinary

## 📁 Project Structure

```text
sprint12/
│
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── messageController.js
│   │   ├── roomController.js
│   │   └── userController.js
│   │
│   ├── middlewares/
│   │
│   ├── models/
│   │
│   ├── routes/
│   │
│   ├── uploads/
│   │
│   ├── .env
│   ├── .env.example
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   │
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── ChatBox.jsx
│   │   │   ├── CreateRoom.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── RoomList.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── UpdateProfile.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AppContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── .gitignore
```

## 🔐 Authentication

ChatFlow uses **JWT authentication with HTTP-only cookies**.

The authentication flow is:

```text
Register
   ↓
Backend validates user
   ↓
Password is hashed
   ↓
JWT token generated
   ↓
Token stored in HTTP-only cookie
   ↓
User can access protected APIs
```

The same authentication mechanism is used for login and protected user/room/message APIs.

## 💬 Room Chat Flow

```text
User Login
    ↓
View Available Rooms
    ↓
Create / Join Room
    ↓
Select Room
    ↓
Load Room Messages
    ↓
Send Message
    ↓
Backend stores message
    ↓
Socket.IO sends real-time update
    ↓
Other room members receive message
```

## ⚙️ Environment Variables

Create:

```text
backend/.env
```

Example:

```env
PORT=8000
FRONTEND_URL=http://localhost:5173

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

NODE_ENV=development
```

**Never commit the actual `.env` file to GitHub.**

Use `.env.example` as a template.

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Vikas123Rathore/chat-app-sprint-1
```

```bash
cd sprint12
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Backend Environment

Create:

```text
backend/.env
```

and add your MongoDB, JWT, and Cloudinary configuration.

### 4. Start Backend

```bash
npm run dev
```

Backend will run on:

```text
http://localhost:8000
```

### 5. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### 6. Start Frontend

```bash
npm run dev
```

Frontend will normally run on:

```text
http://localhost:5173
```

## 🔗 API Structure

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

### User

```text
GET  /api/user/me
PUT  /api/user/update-profile
```

### Rooms

```text
POST /api/room/create
GET  /api/room/all
POST /api/room/:roomId/join
```

### Messages

```text
GET  /api/message/room/:roomId
POST /api/message/send
```

## 🌐 Frontend API Configuration

The frontend uses Axios:

```js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export default api;
```

During development, Vite proxies `/api` requests to the backend server.

## 🔌 Real-Time Communication

Socket.IO is used for real-time room messaging.

The application handles events such as:

```text
joinRoom
newMessage
roomCreated
```

When a user sends a message, it is stored in MongoDB and then delivered to connected users in the selected room.

## ☁️ Cloudinary

Images are uploaded using:

```text
Frontend
   ↓
FormData
   ↓
Express
   ↓
Multer
   ↓
Cloudinary
   ↓
Cloudinary URL
   ↓
MongoDB
```

The application does **not** store image binary data directly in MongoDB.

## 🧪 Error Handling

The application includes handling for common errors such as:

* Invalid login credentials
* Duplicate registration
* Unauthorized requests
* Backend connection errors
* Invalid room requests
* Failed message requests
* Failed image uploads

## 🔒 Security

Sensitive configuration is stored in environment variables.

The following files/folders should not be committed:

```text
.env
node_modules/
backend/uploads/*
dist/
```

The root `.gitignore` handles these files.

## 📱 UI

The application contains:

* Login page
* Registration page
* Sidebar
* Room list
* Create room interface
* Chat box
* Message list
* Message input
* Profile update modal

The interface is designed to be simple and beginner-friendly while providing the core functionality of a modern room-based chat application.

## 🎯 Sprint Objective

This project demonstrates the **Fullstack System Integration** workflow:

```text
React
  ↓
Axios
  ↓
Express REST API
  ↓
MongoDB
```

and real-time communication:

```text
React
  ↕
Socket.IO
  ↕
Node.js / Express
```

The project integrates frontend and backend functionality into a single working MERN application.

## 👨‍💻 Author

**Vikas Rathore**

B.Tech — Information Technology
Rajshree Institute of Management and Technology

## 📌 Future Improvements

* Private rooms
* Room passwords
* Message deletion
* Message editing
* Typing indicator
* Read receipts
* Online/offline notifications
* Search rooms
* Better mobile UI
* Notifications
* Production deployment

## 📄 License

This project is created for educational and internship purposes.
