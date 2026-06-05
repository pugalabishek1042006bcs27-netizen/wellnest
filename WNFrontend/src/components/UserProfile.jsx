import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { profileService } from '../services/api'
import './Signup.css'

const UserProfile = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, updateProfile: saveProfileToContext } = useAuth()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

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
    } else if (name === 'activityLevel') {
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
      const currentGoals = prev.goals

      if (currentGoals.includes(goal)) {
        return {
          ...prev,
          goals: currentGoals.filter(g => g !== goal)
        }
      }

      return {
        ...prev,
        goals: [...currentGoals, goal]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.age || formData.age < 10 || formData.age > 120) {
      setError('Please enter a valid age between 10 and 120')
      return
    }
    if (!formData.height || formData.height <= 0 || formData.height > 300) {
      setError('Please enter a valid height (in cm, 30-300)')
      return
    }
    if (!formData.weight || formData.weight <= 0 || formData.weight > 300) {
      setError('Please enter a valid weight (in kg, 10-300)')
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
      setLoading(true)
      const email =
        user?.email ||
        location.state?.email ||
        localStorage.getItem('email') ||
        sessionStorage.getItem('email')
      
      if (!email) {
        setError('Email not found. Please sign up again.')
        return
      }

      const profileData = {
        age: formData.age,
        height: formData.height,
        weight: formData.weight,
        goals: formData.goals,
        activityLevel: formData.activityLevel,
        recentHealthIssues: formData.recentHealthIssues,
        pastHealthIssues: formData.pastHealthIssues
      }

      await profileService.updateProfile(email, profileData)
      saveProfileToContext(profileData)
      setSuccess('Profile setup completed successfully!')
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    navigate('/home')
  }

  return (
    <div className="signup-container">
      <div className="signup-form">
        <div className="logo">
          <h1>🏥 WellNest</h1>
          <p>Complete Your Health Profile</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Age */}
          <div className="form-group">
            <label htmlFor="age">Age (years) *</label>
            <input
              type="number"
              id="age"
              name="age"
              placeholder="Enter your age"
              value={formData.age}
              onChange={handleInputChange}
              onWheel={(e) => e.currentTarget.blur()}
              min="10"
              max="120"
              required
            />
          </div>

          {/* Height */}
          <div className="form-group">
            <label htmlFor="height">Height (cm) *</label>
            <input
              type="number"
              id="height"
              name="height"
              placeholder="Enter your height in centimeters"
              value={formData.height}
              onChange={handleInputChange}
              onWheel={(e) => e.currentTarget.blur()}
              step="0.1"
              required
            />
          </div>

          {/* Weight */}
          <div className="form-group">
            <label htmlFor="weight">Weight (kg) *</label>
            <input
              type="number"
              id="weight"
              name="weight"
              placeholder="Enter your weight in kilograms"
              value={formData.weight}
              onChange={handleInputChange}
              onWheel={(e) => e.currentTarget.blur()}
              step="0.1"
              required
            />
          </div>

          {/* Goals */}
          <div className="form-group">
            <label>Goals (Select all that apply) *</label>
            <div className="health-issues-grid">
              {goalOptions.map((goal, index) => (
                <div key={`goal-${goal}`} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`goal-${index}`}
                    checked={formData.goals.includes(goal)}
                    onChange={() => handleGoalChange(goal)}
                  />
                  <label htmlFor={`goal-${index}`}>{goal}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Level */}
          <div className="form-group">
            <label htmlFor="activityLevel">Activity Level *</label>
            <select
              id="activityLevel"
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleInputChange}
              required
            >
              <option value="">Select activity level</option>
              {activityOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Recent Health Issues */}
          <div className="form-group">
            <label>Recent Health Issues (Select all that apply)</label>
            <div className="health-issues-grid">
              {healthIssuesOptions.map(issue => (
                <div key={`recent-${issue}`} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`recent-${issue}`}
                    checked={formData.recentHealthIssues.includes(issue)}
                    onChange={() => handleHealthIssueChange(issue, 'recent')}
                  />
                  <label htmlFor={`recent-${issue}`}>{issue}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Past Health Issues */}
          <div className="form-group">
            <label>Past Health Issues (Select all that apply)</label>
            <div className="health-issues-grid">
              {healthIssuesOptions.map(issue => (
                <div key={`past-${issue}`} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`past-${issue}`}
                    checked={formData.pastHealthIssues.includes(issue)}
                    onChange={() => handleHealthIssueChange(issue, 'past')}
                  />
                  <label htmlFor={`past-${issue}`}>{issue}</label>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button 
              type="submit" 
              className="btn" 
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Completing...' : 'Complete Profile'}
            </button>
            <button 
              type="button" 
              className="btn"
              onClick={handleSkip}
              style={{ flex: 1, backgroundColor: '#6c757d' }}
            >
              Skip for Now
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserProfile
