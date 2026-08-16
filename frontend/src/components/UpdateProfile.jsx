import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function UpdateProfile({ onClose }) {
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const { actions } = useApp()

  const submit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const fd = new FormData()
      if (name) fd.append('name', name)
      if (bio) fd.append('bio', bio)
      await actions.updateProfile(fd)
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <form onSubmit={submit} className="bg-gray-800 p-4 rounded w-96">
        <h3 className="mb-2">Update Profile</h3>
        <input
          className="w-full mb-2 p-2 bg-gray-700 rounded"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="w-full mb-2 p-2 bg-gray-700 rounded"
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
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
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
