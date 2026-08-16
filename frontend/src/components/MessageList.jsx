import React from 'react'
import { useApp } from '../context/AppContext'

export default function MessageList() {
  const { messages } = useApp()

  return (
    <div>
      {messages.map((m) => (
        <div key={m._id} className="mb-3">
          <div className="text-sm text-gray-300 font-semibold">
            {m.sender?.name}
          </div>
          <div className="text-white">{m.text}</div>
          {m.image && <img src={m.image} alt="msg" className="mt-2 max-w-xs" />}
          <div className="text-xs text-gray-500">
            {new Date(m.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}
