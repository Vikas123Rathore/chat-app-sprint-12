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

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [messages, setMessages] = useState([])

  const socketRef = useRef(null)

  // ==========================================
  // LOAD CURRENT USER
  // ==========================================

  async function loadMe() {
    try {
      const res = await api.get('/user/me')

      if (res.data?.user) {
        setUser(res.data.user)

        // Keep user in localStorage
        localStorage.setItem('chatflow_user', JSON.stringify(res.data.user))

        return true
      }

      return false
    } catch (error) {
      console.log(
        'Current user error:',
        error.response?.data?.message || error.message,
      )

      /*
       * If backend request fails temporarily,
       * restore user from localStorage.
       *
       * This is only for keeping UI state.
       * Actual authentication is still handled
       * by the HTTP-only cookie.
       */
      try {
        const savedUser = localStorage.getItem('chatflow_user')

        if (savedUser) {
          setUser(JSON.parse(savedUser))
          return true
        }
      } catch (storageError) {
        console.log('Local storage error:', storageError)
      }

      setUser(null)
      return false
    }
  }

  // ==========================================
  // LOAD ROOMS
  // ==========================================

  async function loadRooms() {
    try {
      const res = await api.get('/room/all')

      setRooms(res.data?.rooms || [])

      return true
    } catch (error) {
      console.log(
        'Load rooms error:',
        error.response?.data?.message || error.message,
      )

      setRooms([])

      return false
    }
  }

  // ==========================================
  // INITIAL APP LOAD
  // ==========================================

  useEffect(() => {
    let mounted = true

    const initializeApp = async () => {
      const loggedIn = await loadMe()

      if (mounted && loggedIn) {
        await loadRooms()
      }
    }

    initializeApp()

    // ========================================
    // SOCKET.IO CONNECTION
    // ========================================

    const socket = io(SOCKET_URL, {
      withCredentials: true,

      // Try websocket first, fallback to polling
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    // Socket connected
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
    })

    // Socket connection error
    socket.on('connect_error', (error) => {
      console.log('Socket connection error:', error.message)
    })

    // ========================================
    // NEW MESSAGE
    // ========================================

    socket.on('newMessage', (message) => {
      setMessages((prev) => {
        /*
         * If no room is selected,
         * don't add message.
         */
        if (!selectedRoom) {
          return prev
        }

        /*
         * Check whether message belongs
         * to currently selected room.
         */
        if (message.room?.toString() === selectedRoom._id?.toString()) {
          /*
           * Prevent duplicate message
           */
          const alreadyExists = prev.some((item) => item._id === message._id)

          if (alreadyExists) {
            return prev
          }

          return [...prev, message]
        }

        return prev
      })
    })

    // ========================================
    // NEW ROOM
    // ========================================

    socket.on('roomCreated', (room) => {
      setRooms((prev) => {
        const alreadyExists = prev.some((item) => item._id === room._id)

        if (alreadyExists) {
          return prev
        }

        return [...prev, room]
      })
    })

    // ========================================
    // CLEANUP
    // ========================================

    return () => {
      mounted = false

      socket.off('connect')
      socket.off('connect_error')
      socket.off('newMessage')
      socket.off('roomCreated')

      socket.disconnect()

      socketRef.current = null
    }
  }, [])

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

    // Clear React state
    setUser(null)
    setRooms([])
    setSelectedRoom(null)
    setMessages([])

    // Clear local user
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
        setRooms((prev) => {
          const exists = prev.some((room) => room._id === res.data.room._id)

          if (exists) {
            return prev
          }

          return [...prev, res.data.room]
        })
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
      // Join room through API
      await api.post(`/room/${room._id}/join`)

      // Join Socket.IO room
      if (socketRef.current) {
        socketRef.current.emit('joinRoom', room._id)
      }

      setSelectedRoom(room)

      // Fetch old messages
      await fetchMessages(room._id)
    } catch (error) {
      console.log(
        'Select room error:',
        error.response?.data?.message || error.message,
      )
    }
  }

  // ==========================================
  // FETCH MESSAGES
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

      /*
       * Backend already emits the message
       * through Socket.IO.
       *
       * Therefore don't add it here,
       * otherwise duplicate messages
       * can appear.
       */

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
