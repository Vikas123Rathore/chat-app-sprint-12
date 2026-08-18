import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import api from '../api/axios'
import { io } from 'socket.io-client'

const AppContext = createContext(null)

const SERVER_URL = 'https://chat-app-sprint-12-backend.onrender.com'

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [messages, setMessages] = useState([])

  const socketRef = useRef(null)

  // ==========================================
  // LOAD USER + ROOMS + SOCKET
  // ==========================================

  useEffect(() => {
    loadMe()
    loadRooms()

    // Socket.IO - Render backend
    const socket = io(SERVER_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    // Socket connected
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
    })

    // Socket connection error
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
    })

    // New message
    socket.on('newMessage', (message) => {
      setMessages((prev) => {
        if (!selectedRoom) {
          return prev
        }

        if (message.room?.toString() === selectedRoom._id?.toString()) {
          return [...prev, message]
        }

        return prev
      })
    })

    // New room
    socket.on('roomCreated', (room) => {
      setRooms((prev) => {
        const alreadyExists = prev.some((item) => item._id === room._id)

        if (alreadyExists) {
          return prev
        }

        return [...prev, room]
      })
    })

    // Cleanup
    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  // ==========================================
  // GET CURRENT USER
  // ==========================================

  async function loadMe() {
    try {
      const res = await api.get('/user/me')

      if (res.data?.user) {
        setUser(res.data.user)

        localStorage.setItem('chatflow_user', JSON.stringify(res.data.user))
      }
    } catch (error) {
      console.log(
        'Current user error:',
        error.response?.data?.message || error.message,
      )

      setUser(null)
    }
  }

  // ==========================================
  // GET ALL ROOMS
  // ==========================================

  async function loadRooms() {
    try {
      const res = await api.get('/room/all')

      setRooms(res.data?.rooms || [])
    } catch (error) {
      console.log(
        'Load rooms error:',
        error.response?.data?.message || error.message,
      )

      setRooms([])
    }
  }

  // ==========================================
  // LOGIN
  // ==========================================

  async function login(credentials) {
    try {
      const res = await api.post('/auth/login', credentials)

      if (res.data?.user) {
        setUser(res.data.user)

        localStorage.setItem('chatflow_user', JSON.stringify(res.data.user))
      }

      await loadRooms()

      return res
    } catch (error) {
      console.log(
        'Login error:',
        error.response?.data?.message || error.message,
      )

      throw error
    }
  }

  // ==========================================
  // REGISTER
  // ==========================================

  async function register(data) {
    try {
      const res = await api.post('/auth/register', data)

      if (res.data?.user) {
        setUser(res.data.user)

        localStorage.setItem('chatflow_user', JSON.stringify(res.data.user))
      }

      await loadRooms()

      return res
    } catch (error) {
      console.log(
        'Register error:',
        error.response?.data?.message || error.message,
      )

      throw error
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.log(
        'Logout error:',
        error.response?.data?.message || error.message,
      )
    }

    // Clear frontend state
    setUser(null)
    setRooms([])
    setSelectedRoom(null)
    setMessages([])

    // Remove local user
    localStorage.removeItem('chatflow_user')

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }

  // ==========================================
  // CREATE ROOM
  // ==========================================

  async function createRoom(formData) {
    try {
      const res = await api.post('/room/create', formData)

      if (res.data?.room) {
        setRooms((prev) => [...prev, res.data.room])
      }

      return res
    } catch (error) {
      console.log(
        'Create room error:',
        error.response?.data?.message || error.message,
      )

      throw error
    }
  }

  // ==========================================
  // SELECT ROOM
  // ==========================================

  async function selectRoom(room) {
    try {
      // Join room in backend
      await api.post(`/room/${room._id}/join`)

      // Join Socket.IO room
      if (socketRef.current) {
        socketRef.current.emit('joinRoom', room._id)
      }

      setSelectedRoom(room)

      // Get messages
      await fetchMessages(room._id)
    } catch (error) {
      console.log(
        'Select room error:',
        error.response?.data?.message || error.message,
      )
    }
  }

  // ==========================================
  // GET ROOM MESSAGES
  // ==========================================

  async function fetchMessages(roomId) {
    try {
      const res = await api.get(`/message/room/${roomId}`)

      setMessages(res.data?.messages || [])
    } catch (error) {
      console.log(
        'Fetch messages error:',
        error.response?.data?.message || error.message,
      )

      setMessages([])
    }
  }

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  async function sendMessage(formData) {
    try {
      const res = await api.post('/message/send', formData)

      // Message is also emitted by Socket.IO.
      // We don't append here to avoid duplicate messages.

      return res
    } catch (error) {
      console.log(
        'Send message error:',
        error.response?.data?.message || error.message,
      )

      throw error
    }
  }

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  async function updateProfile(formData) {
    try {
      const res = await api.put('/user/update-profile', formData)

      if (res.data?.user) {
        setUser(res.data.user)

        localStorage.setItem('chatflow_user', JSON.stringify(res.data.user))
      }

      return res
    } catch (error) {
      console.log(
        'Update profile error:',
        error.response?.data?.message || error.message,
      )

      throw error
    }
  }

  // ==========================================
  // CONTEXT
  // ==========================================

  return (
    <AppContext.Provider
      value={{
        user,
        rooms,
        selectedRoom,
        messages,

        actions: {
          login,
          register,
          logout,
          createRoom,
          selectRoom,
          fetchMessages,
          sendMessage,
          updateProfile,
          loadMe,
          loadRooms,
        },
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

// ==========================================
// CUSTOM HOOK
// ==========================================

export function useApp() {
  return useContext(AppContext)
}

export default AppContext
