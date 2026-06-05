import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { waterService } from '../services/api'
import Navbar from './Navbar'
import './Home.css'
import './TrackerPages.css'

const AddWaterLog = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    liters: '',
    cups: ''
  })
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const getUserInitial = () => user?.fullName?.charAt(0).toUpperCase() || 'U'

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?.email) {
      setApiError('Please log in to save water intake logs.')
      return
    }
    setApiError('')
    setIsLoading(true)

    const newLog = {
      liters: parseFloat(formData.liters) || 0,
      cups: parseFloat(formData.cups) || 0,
      timestamp: new Date()
    }

    try {
      await waterService.logWaterIntake({
        email: user.email,
        liters: newLog.liters,
        cups: newLog.cups,
        timestamp: newLog.timestamp.toISOString()
      })

      setFormData({ liters: '', cups: '' })
      navigate('/water-intake')
    } catch (error) {
      setApiError('Failed to log water intake. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/water-intake')
  }

  return (
    <div className="home-container">
      <Navbar />

      <div className="container">
        <section className="section-card tracker-hero animate delay-1">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: '0.5rem 1rem',
                background: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              ← Back
            </button>
            <div>
              <h1>Log Your Water Intake</h1>
              <p>Stay hydrated and track your daily water consumption.</p>
            </div>
          </div>
        </section>

        <section
          className="section-card animate delay-2"
          style={{
            padding: '2.5rem',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            maxWidth: '700px',
            margin: '0 auto 2rem auto',
            border: '1px solid rgba(10, 61, 61, 0.08)'
          }}
        >
          {apiError && <div className="error-message">{apiError}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Liters</label>
                <input
                  type="number"
                  name="liters"
                  value={formData.liters}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  placeholder="e.g., 0.5"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Cups</label>
                <input
                  type="number"
                  name="cups"
                  value={formData.cups}
                  onChange={handleInputChange}
                  min="0"
                  step="0.5"
                  placeholder="e.g., 2"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: isLoading ? '#ccc' : 'linear-gradient(90deg, #1aa260 0%, #10b981 60%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.2s'
                }}
              >
                {isLoading ? 'Logging...' : 'Log Water'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#f0f0f0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}

export default AddWaterLog
