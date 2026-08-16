import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useApp } from '../context/AppContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLocalLoading] = useState(false)
  const { actions } = useApp()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      setLocalLoading(true)
      await actions.login({ email, password })
      navigate('/')
    } catch (err) {
      console.error(err)
    } finally {
      setLocalLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={submit} className="bg-gray-800 p-6 rounded shadow w-96">
        <h2 className="text-2xl mb-4">Login to ChatFlow</h2>
        <input
          className="w-full mb-2 p-2 rounded bg-gray-700"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full mb-4 p-2 rounded bg-gray-700"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full py-2 bg-indigo-600 rounded"
          disabled={loading}
        >
          {loading ? 'Logging...' : 'Login'}
        </button>
        <p className="mt-3 text-sm">
          No account?{' '}
          <Link to="/register" className="text-indigo-400">
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}
