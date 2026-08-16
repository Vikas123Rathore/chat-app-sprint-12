import React from 'react'
import Sidebar from '../components/Sidebar'
import ChatBox from '../components/ChatBox'
import { useApp } from '../context/AppContext'

export default function Home() {
  const { selectedRoom } = useApp()

  return (
    <div className="chat-container">
      <Sidebar />
      {selectedRoom ? (
        <ChatBox />
      ) : (
        <div className="flex-1 p-6">Select a room to start chatting</div>
      )}
    </div>
  )
}
