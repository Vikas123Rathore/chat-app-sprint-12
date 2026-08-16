import React from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { useApp } from '../context/AppContext'

export default function ChatBox() {
  const { selectedRoom } = useApp()

  if (!selectedRoom) return null

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg">{selectedRoom.name}</h2>
        <div className="text-sm text-gray-400">{selectedRoom.description}</div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <MessageList />
      </div>
      <div className="p-4 border-t border-gray-700">
        <MessageInput />
      </div>
    </div>
  )
}
