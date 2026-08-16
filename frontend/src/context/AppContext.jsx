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

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const socketRef = useRef(null)

  useEffect(() => {
    loadMe()
    loadRooms()
    // connect socket to same origin so Vite proxy forwards to backend
    const s = io(undefined, {
      withCredentials: true,
    })
    socketRef.current = s

    s.on('connect', () => {
      // console.log('socket connected', s.id)
    })

    s.on('newMessage', (msg) => {
      // append if current room
      setMessages((prev) => {
        if (!selectedRoom) return prev
        if (msg.room.toString() === selectedRoom._id.toString()) {
          return [...prev, msg]
        }
        return prev
      })
    })

    s.on('roomCreated', (room) => {
      setRooms((prev) => [...prev, room])
    })

    return () => {
      s.disconnect()
    }
  }, [])

  async function loadMe() {
    const attempt = async () => {
      try {
        const res = await api.get('/user/me')
        setUser(res.data.user)
        return true
      } catch (e) {
        return false
      }
    }

    const ok = await attempt()
    if (!ok) {
      // retry once after short delay to allow cookie propagation between proxied responses
      await new Promise((r) => setTimeout(r, 500))
      const ok2 = await attempt()
      if (!ok2) {
        // fallback: if user exists in localStorage, restore UI state (dev-friendly)
        try {
          const raw = localStorage.getItem('chatflow_user')
          if (raw) {
            setUser(JSON.parse(raw))
            return
          }
        } catch (err) {}
        setUser(null)
      }
    }
  }

  async function loadRooms() {
    try {
      const res = await api.get('/room/all')
      setRooms(res.data.rooms)
    } catch (e) {
      setRooms([])
    }
  }

  async function login(creds) {
    const res = await api.post('/auth/login', creds)
    setUser(res.data.user)
    try {
      localStorage.setItem('chatflow_user', JSON.stringify(res.data.user))
    } catch (e) {}
    await loadRooms()
    return res
  }

  async function register(data) {
    const res = await api.post('/auth/register', data)
    setUser(res.data.user)
    try {
      localStorage.setItem('chatflow_user', JSON.stringify(res.data.user))
    } catch (e) {}
    await loadRooms()
    return res
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch (e) {}
    setUser(null)
    try {
      localStorage.removeItem('chatflow_user')
    } catch (e) {}
    setRooms([])
    setSelectedRoom(null)
    setMessages([])
  }

  async function createRoom(formData) {
    const res = await api.post('/room/create', formData)
    setRooms((prev) => [...prev, res.data.room])
    return res
  }

  async function selectRoom(room) {
    try {
      await api.post(`/room/${room._id}/join`)
      // notify socket
      if (socketRef.current) socketRef.current.emit('joinRoom', room._id)
    } catch (e) {}
    setSelectedRoom(room)
    fetchMessages(room._id)
  }

  async function fetchMessages(roomId) {
    try {
      const res = await api.get(`/message/room/${roomId}`)
      setMessages(res.data.messages)
    } catch (e) {
      setMessages([])
    }
  }

  async function sendMessage(formData) {
    const res = await api.post('/message/send', formData)
    setMessages((prev) => [...prev, res.data.message])

    return res
  }

  async function updateProfile(formData) {
    const res = await api.put('/user/update-profile', formData)
    setUser(res.data.user)
    return res
  }

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

export function useApp() {
  return useContext(AppContext)
}

export default AppContext
