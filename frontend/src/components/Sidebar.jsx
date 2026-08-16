import React, { useState } from 'react'
import RoomList from './RoomList'
import CreateRoom from './CreateRoom'
import UpdateProfile from './UpdateProfile'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

export default function Sidebar() {
  const { user, actions } = useApp()
  const [showCreate, setShowCreate] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const navigate = useNavigate()

  const logout = async () => {
    await actions.logout()
    navigate('/login')
  }

  return (
    <div className="w-80 bg-gray-800 p-4 flex flex-col">
      <div className="mb-4">
        <h1 className="text-xl font-bold">ChatFlow</h1>
        {user && (
          <div className="mt-3 flex items-center">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center mr-2">
              {user.name?.[0]}
            </div>
            <div>
              <div>{user.name}</div>
              <div className="text-sm text-gray-400">
                {user.isOnline ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>
        )}
        <div className="mt-3">
          <button
            className="mr-2 px-3 py-1 bg-indigo-600 rounded"
            onClick={() => setShowProfile(true)}
          >
            Profile
          </button>
          <button
            className="mr-2 px-3 py-1 bg-gray-700 rounded"
            onClick={() => setShowCreate(true)}
          >
            Create Room
          </button>
          <button className="px-3 py-1 bg-red-600 rounded" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <h2 className="text-gray-300 mb-2">Rooms</h2>
        <RoomList />
      </div>

      {showCreate && <CreateRoom onClose={() => setShowCreate(false)} />}
      {showProfile && <UpdateProfile onClose={() => setShowProfile(false)} />}
    </div>
  )
}
