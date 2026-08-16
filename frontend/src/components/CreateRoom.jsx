import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function CreateRoom({ onClose }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('personal')
  const [loading, setLoading] = useState(false)
  const { actions } = useApp()

  const submit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const fd = new FormData()
      fd.append('name', name)
      fd.append('description', description)
      fd.append('type', type)
      await actions.createRoom(fd)
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <form
        onSubmit={submit}
        className="bg-gray-900 p-4 rounded w-96 shadow-lg"
      >
        <h3 className="mb-3 text-lg font-semibold">Create Room</h3>
        <input
          className="w-full mb-2 p-2 bg-gray-700 rounded"
          placeholder="Room name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full mb-2 p-2 bg-gray-700 rounded"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="mb-3">
          <label className="block text-sm text-gray-300 mb-1">Room Type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('tech')}
              className={`px-3 py-1 rounded ${type === 'tech' ? 'bg-indigo-600' : 'bg-gray-700'}`}
            >
              Tech
            </button>
            <button
              type="button"
              onClick={() => setType('personal')}
              className={`px-3 py-1 rounded ${type === 'personal' ? 'bg-indigo-600' : 'bg-gray-700'}`}
            >
              Personal
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            className="mr-2 px-3 py-1 bg-gray-600 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-indigo-600 rounded"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}
