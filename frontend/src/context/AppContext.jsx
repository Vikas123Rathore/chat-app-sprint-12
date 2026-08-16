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
    // connect socket
    const url = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const s = io(url, { withCredentials: true, transports: ['websocket'] })
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
    try {
      const res = await api.get('/user/me')
      setUser(res.data.user)
    } catch (e) {
      setUser(null)
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
    await loadRooms()
    return res
  }

  async function register(data) {
    const res = await api.post('/auth/register', data)
    setUser(res.data.user)
    await loadRooms()
    return res
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch (e) {}
    setUser(null)
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
    // server will also emit 'newMessage' — optional emit from client if needed
    // if (socketRef.current) socketRef.current.emit('message', res.data.message)
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
