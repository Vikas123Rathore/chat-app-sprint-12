import React from 'react'
import { useApp } from '../context/AppContext'

export default function RoomList() {
  const { rooms, actions } = useApp()

  const selectRoom = (room) => {
    actions.selectRoom(room)
  }

  return (
    <div>
      {rooms.map((r) => (
        <div
          key={r._id}
          className="p-3 mb-2 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg cursor-pointer hover:scale-[1.01] transition-transform"
          onClick={() => selectRoom(r)}
        >
          <div className="flex items-center justify-between">
            <div className="font-semibold text-white">{r.name}</div>
            <div>
              {r.type === 'tech' ? (
                <span className="text-xs px-2 py-1 rounded bg-blue-600 text-white">
                  Tech
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded bg-purple-600 text-white">
                  Personal
                </span>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-300 mt-1">{r.description}</div>
          <div className="text-xs text-gray-400 mt-2">
            Members: {r.memberCount || (r.members && r.members.length) || 0}
          </div>
        </div>
      ))}
    </div>
  )
}
