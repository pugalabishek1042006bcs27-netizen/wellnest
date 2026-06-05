import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mealService } from '../services/api'
import Navbar from './Navbar'
import './Home.css'
import './TrackerPages.css'

const AddMealLog = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    mealType: '',
    foodType: '',
    mealName: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    notes: ''
  })
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEstimating, setIsEstimating] = useState(false)

  const getUserInitial = () => user?.fullName?.charAt(0).toUpperCase() || 'U'

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const applyEstimate = (estimate) => {
    setFormData((prev) => ({
      ...prev,
      calories: String(estimate.calories ?? 0),
      protein: String(estimate.protein ?? 0),
      carbs: String(estimate.carbs ?? 0),
      fats: String(estimate.fats ?? 0)
    }))
  }

  const estimateNutrition = async (showError = true) => {
    if (!formData.mealName.trim()) {
      if (showError) {
        setApiError('Enter a meal name to estimate nutrition.')
      }
      return null
    }

    if (!user?.email) {
      if (showError) {
        setApiError('Please log in to estimate nutrition.')
      }
      return null
    }

    if (showError) {
      setApiError('')
    }
    setIsEstimating(true)

    try {
      const result = await mealService.estimateMealNutrition({
        mealName: formData.mealName,
        foodType: formData.foodType
      })
      const estimate = result?.data ?? result
      applyEstimate(estimate)
      return estimate
    } catch (error) {
      if (showError) {
        setApiError('Failed to estimate nutrition. Please try again.')
      }
      return null
    } finally {
      setIsEstimating(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?.email) {
      setApiError('Please log in to save meals.')
      return
    }
    setApiError('')
    setIsLoading(true)

    try {
      let calories = parseInt(formData.calories || 0, 10)
      let protein = parseInt(formData.protein || 0, 10)
      let carbs = parseInt(formData.carbs || 0, 10)
      let fats = parseInt(formData.fats || 0, 10)

      if (!calories || calories <= 0 || Number.isNaN(protein) || Number.isNaN(carbs) || Number.isNaN(fats)) {
        const estimate = await estimateNutrition(false)
        if (!estimate) {
          throw new Error('Nutrition estimate failed')
        }

        calories = parseInt(estimate.calories || 0, 10)
        protein = parseInt(estimate.protein || 0, 10)
        carbs = parseInt(estimate.carbs || 0, 10)
        fats = parseInt(estimate.fats || 0, 10)
      }

      await mealService.logMeal({
        email: user.email,
        mealType: formData.mealType,
        foodType: formData.foodType,
        mealName: formData.mealName,
        calories,
        protein,
        carbs,
        fats,
        notes: '',
        timestamp: new Date().toISOString()
      })

      setFormData({ mealType: '', foodType: '', mealName: '', calories: '', protein: '', carbs: '', fats: '', notes: '' })
      navigate('/meal-tracker')
    } catch (error) {
      setApiError('Failed to log meal. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/meal-tracker')
  }

  useEffect(() => {
    if (!formData.mealName.trim() || !user?.email) {
      return
    }

    const timer = setTimeout(() => {
      estimateNutrition(false)
    }, 650)

    return () => clearTimeout(timer)
  }, [formData.mealName, formData.foodType, user?.email])

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
              <h1>Log Your Meal</h1>
              <p>Track your nutrition and maintain a healthy diet.</p>
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Meal Type</label>
                <select
                  name="mealType"
                  value={formData.mealType}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                >
                  <option value="">Select meal type</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Food Type</label>
                <select
                  name="foodType"
                  value={formData.foodType}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                >
                  <option value="">Select food type</option>
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Meal Name</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  name="mealName"
                  value={formData.mealName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Chicken Biryani"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                />
                <button
                  type="button"
                  onClick={() => estimateNutrition(true)}
                  disabled={isEstimating || !formData.mealName.trim()}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    background: '#f9fafb',
                    cursor: isEstimating || !formData.mealName.trim() ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isEstimating ? 'Estimating...' : 'Estimate'}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Calories</label>
              <input
                type="number"
                name="calories"
                value={formData.calories}
                readOnly
                min="1"
                placeholder="Auto-calculated"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', background: '#f9fafb' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Protein (g)</label>
                <input
                  type="number"
                  name="protein"
                  value={formData.protein}
                  readOnly
                  min="0"
                  placeholder="Auto"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', background: '#f9fafb' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Carbs (g)</label>
                <input
                  type="number"
                  name="carbs"
                  value={formData.carbs}
                  readOnly
                  min="0"
                  placeholder="Auto"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', background: '#f9fafb' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Fats (g)</label>
                <input
                  type="number"
                  name="fats"
                  value={formData.fats}
                  readOnly
                  min="0"
                  placeholder="Auto"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', background: '#f9fafb' }}
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
                {isLoading ? 'Logging...' : 'Log Meal'}
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

export default AddMealLog
