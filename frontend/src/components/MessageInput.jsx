import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function MessageInput() {
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const { selectedRoom, actions } = useApp()

  const submit = async (e) => {
    e.preventDefault()
    if (!selectedRoom) return
    try {
      const fd = new FormData()
      fd.append('room', selectedRoom._id)
      fd.append('text', text)
      if (file) fd.append('image', file)
      await actions.sendMessage(fd)
      setText('')
      setFile(null)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <form onSubmit={submit} className="flex items-center">
      <input
        className="flex-1 p-2 mr-2 rounded bg-gray-700"
        placeholder="Message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mr-2 text-sm"
      />
      <button className="px-3 py-2 bg-indigo-600 rounded">Send</button>
    </form>
  )
}
