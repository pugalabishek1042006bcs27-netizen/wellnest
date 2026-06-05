import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/api'
import './Login.css'

const Login = () => {
  const [formData, setFormData] = useState({
    username: localStorage.getItem('rememberedUsername') || '',
    password: ''
  })
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('rememberedUsername'))
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, loginAsGuest } = useAuth()
  const navigate = useNavigate()

  const validateUsername = (username) => {
    return username && username.trim().length >= 3
  }

  const handleGuestLogin = () => {
    loginAsGuest('Guest User')
    navigate('/home')
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Username validation
    if (!validateUsername(formData.username)) {
      setError('Please enter a valid username (min 3 chars)')
      return
    }

    // Password validation
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const data = await authService.login(formData.username, formData.password)
      
      if (data.token) {
        if (rememberMe) {
          localStorage.setItem('rememberedUsername', formData.username)
        } else {
          localStorage.removeItem('rememberedUsername')
        }
        login(data, rememberMe)
        setSuccess('Login successful! Redirecting...')
        setTimeout(() => navigate('/home'), 1000)
      } else {
        setError(data.message || 'Login failed. Please check your credentials.')
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError('Connection error. Please make sure the server is running.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="logo">
          <h1>🏥 WellNest</h1>
          <p>Smart Health & Fitness Companion</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="remember-row">
            <label className="remember-label" htmlFor="rememberMe">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              Remember me
            </label>
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <button 
            type="button" 
            className="btn btn-guest" 
            onClick={handleGuestLogin}
            disabled={loading}
          >
            Continue as Guest
          </button>
        </form>
        <div style={{marginLeft:'145px',marginTop:'10px',color:'#0ea5a6',fontWeight:600}}><Link to="/forgot-password">Forgot password?</Link></div>
        <div className="divider">OR</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
          
          <div className="signup-link">Don't have an account? <Link to="/signup">Sign Up</Link></div>
        </div>
      </div>
    </div>
  )
}

export default Login