import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { workoutService } from '../services/api'
import Navbar from './Navbar'
import './Home.css'
import './TrackerPages.css'

const AddWorkoutLog = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    exerciseType: '',
    duration: '',
    calories: ''
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
      setApiError('Please log in to save workouts.')
      return
    }
    setApiError('')
    setIsLoading(true)

    const newWorkout = {
      exerciseType: formData.exerciseType,
      durationMinutes: parseInt(formData.duration, 10),
      calories: parseInt(formData.calories || 0, 10),
      timestamp: new Date()
    }

    try {
      await workoutService.logWorkout({
        email: user.email,
        exerciseType: newWorkout.exerciseType,
        durationMinutes: newWorkout.durationMinutes,
        calories: newWorkout.calories,
        timestamp: newWorkout.timestamp.toISOString()
      })

      setFormData({ exerciseType: '', duration: '', calories: '' })
      navigate('/workout-tracker')
    } catch (error) {
      setApiError('Failed to log workout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/workout-tracker')
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
              <h1>Log Your Workout</h1>
              <p>Track your exercise and stay motivated.</p>
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
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Exercise Type</label>
              <select
                name="exerciseType"
                value={formData.exerciseType}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
              >
                <option value="">Select exercise type</option>
                <option value="Cardio">Cardio</option>
                <option value="Strength">Strength</option>
                <option value="Yoga">Yoga</option>
                <option value="HIIT">HIIT</option>
                <option value="Cycling">Cycling</option>
                <option value="Running">Running</option>
                <option value="Swimming">Swimming</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="e.g., 30"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Calories Burned (optional)</label>
              <input
                type="number"
                name="calories"
                value={formData.calories}
                onChange={handleInputChange}
                min="0"
                placeholder="e.g., 250"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
              />
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
                {isLoading ? 'Logging...' : 'Log Workout'}
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

export default AddWorkoutLog
