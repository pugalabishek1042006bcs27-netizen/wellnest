import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Signup.css'

const GuestProfileSetup = () => {
  const navigate = useNavigate()
  const { updateProfile } = useAuth()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const healthIssuesOptions = [
    'Diabetes',
    'Hypertension',
    'Heart Disease',
    'Asthma',
    'Thyroid Issues',
    'Depression/Anxiety',
    'Obesity',
    'High Cholesterol',
    'Arthritis',
    'Back Pain',
    'Migraine',
    'Sleep Disorder',
    'PCOD/PCOS',
    'Allergies',
    'None'
  ]

  const goalOptions = [
    'Lose Weight',
    'Gain Weight',
    'Maintain Weight',
    'Build Muscle',
    'Improve Stamina',
    'Improve Flexibility',
    'Reduce Stress',
    'Better Sleep'
  ]

  const activityOptions = [
    'Sedentary',
    'Lightly Active',
    'Moderately Active',
    'Very Active',
    'Athlete'
  ]

  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    gender: 'Male',
    goals: [],
    activityLevel: '',
    recentHealthIssues: [],
    pastHealthIssues: []
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'age') {
      if (value === '') {
        setFormData({ ...formData, [name]: '' })
        return
      }
      const age = Number(value)
      if (!Number.isNaN(age) && age >= 0 && age <= 120) {
        setFormData({ ...formData, [name]: age })
      }
    } else if (name === 'height' || name === 'weight') {
      const num = parseFloat(value) || ''
      if (num === '' || num > 0) {
        setFormData({ ...formData, [name]: num })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleHealthIssueChange = (issue, type) => {
    setFormData(prev => {
      const issuesKey = type === 'recent' ? 'recentHealthIssues' : 'pastHealthIssues'
      const currentIssues = prev[issuesKey]
      
      if (currentIssues.includes(issue)) {
        return {
          ...prev,
          [issuesKey]: currentIssues.filter(i => i !== issue)
        }
      } else {
        return {
          ...prev,
          [issuesKey]: [...currentIssues, issue]
        }
      }
    })
  }

  const handleGoalChange = (goal) => {
    setFormData(prev => {
      if (prev.goals.includes(goal)) {
        return { ...prev, goals: prev.goals.filter(g => g !== goal) }
      } else {
        return { ...prev, goals: [...prev.goals, goal] }
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.age || formData.age < 1) {
      setError('Please enter a valid age')
      return
    }

    if (!formData.height || formData.height <= 0) {
      setError('Please enter a valid height (in cm)')
      return
    }

    if (!formData.weight || formData.weight <= 0) {
      setError('Please enter a valid weight (in kg)')
      return
    }

    if (formData.goals.length === 0) {
      setError('Please select at least one goal')
      return
    }

    if (!formData.activityLevel) {
      setError('Please select your activity level')
      return
    }

    try {
      // Store profile in sessionStorage for guest users
      const profileData = {
        age: formData.age,
        height: formData.height,
        weight: formData.weight,
        gender: formData.gender,
        goals: formData.goals,
        activityLevel: formData.activityLevel,
        recentHealthIssues: formData.recentHealthIssues,
        pastHealthIssues: formData.pastHealthIssues,
        profileCompleted: true
      }

      // Save to context (which will store in sessionStorage)
      updateProfile(profileData)
      
      setSuccess('Profile setup complete! Redirecting...')
      setTimeout(() => navigate('/home', { replace: true }), 1000)
    } catch (error) {
      setError('Failed to save profile. Please try again.')
    }
  }

  const handleSkip = () => {
    // Navigate to home without completing profile
    navigate('/home', { replace: true })
  }

  return (
    <div className="signup-container">
      <div className="signup-form">
        <div className="logo">
          <h1>🏥 Welcome Guest!</h1>
          <p>Set up your profile to get started</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age *</label>
              <input
                type="number"
                id="age"
                name="age"
                placeholder="e.g., 25"
                value={formData.age}
                onChange={handleInputChange}
                min="1"
                max="120"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="height">Height (cm) *</label>
              <input
                type="number"
                id="height"
                name="height"
                placeholder="e.g., 170"
                value={formData.height}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="weight">Weight (kg) *</label>
              <input
                type="number"
                id="weight"
                name="weight"
                placeholder="e.g., 70"
                value={formData.weight}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="activityLevel">Activity Level *</label>
            <select
              id="activityLevel"
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleInputChange}
              required
            >
              <option value="">Select your activity level</option>
              {activityOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="form-group-full">
            <label>Fitness Goals *</label>
            <div className="checkbox-grid">
              {goalOptions.map(goal => (
                <label key={goal} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.goals.includes(goal)}
                    onChange={() => handleGoalChange(goal)}
                  />
                  <span>{goal}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group-full">
            <label>Recent Health Issues (Optional)</label>
            <div className="checkbox-grid">
              {healthIssuesOptions.map(issue => (
                <label key={issue} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.recentHealthIssues.includes(issue)}
                    onChange={() => handleHealthIssueChange(issue, 'recent')}
                  />
                  <span>{issue}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group-full">
            <label>Past Health Issues (Optional)</label>
            <div className="checkbox-grid">
              {healthIssuesOptions.map(issue => (
                <label key={issue} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.pastHealthIssues.includes(issue)}
                    onChange={() => handleHealthIssueChange(issue, 'past')}
                  />
                  <span>{issue}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn">
              Complete Profile
            </button>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={handleSkip}
              style={{
                flex: 1,
                padding: '14px',
                background: '#e0e0e0',
                color: '#333',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15.2px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Skip for Now
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GuestProfileSetup
