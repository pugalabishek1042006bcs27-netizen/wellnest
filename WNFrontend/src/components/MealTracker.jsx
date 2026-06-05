import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mealService } from '../services/api'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'
import Navbar from './Navbar'
import './Home.css'
import './TrackerPages.css'

ChartJS.register(CategoryScale, LinearScale, ArcElement, BarElement, Tooltip, Legend)

const MealTracker = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [meals, setMeals] = useState([])
  const [chartData, setChartData] = useState({ calories: [0, 0, 0, 0, 0, 0, 0] })
  const [apiError, setApiError] = useState('')
  const [dataLoaded, setDataLoaded] = useState(false)

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const calorieData = {
    labels,
    datasets: [
      {
        label: 'Calories',
        data: chartData.calories,
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 8,
        maxBarThickness: 32
      }
    ]
  }

  const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0)
  const totalCarbs = meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0)
  const totalFats = meals.reduce((sum, meal) => sum + (meal.fats || 0), 0)
  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0)
  const hasLogs = meals.length > 0

  const macroData = {
    labels: ['Carbs', 'Protein', 'Fats'],
    datasets: [
      {
        data: [totalCarbs, totalProtein, totalFats],
        backgroundColor: ['#10b981', '#0ea5a6', '#f2b94b'],
        borderWidth: 0
      }
    ]
  }

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  }

  const doughnutOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  }

  const getUserInitial = () => user?.fullName?.charAt(0).toUpperCase() || 'U'

  const buildWeeklyCalories = (logs) => {
    const calories = [0, 0, 0, 0, 0, 0, 0]
    logs.forEach((log) => {
      const timestamp = log.timestamp ? new Date(log.timestamp) : new Date()
      const dayIndex = (timestamp.getDay() + 6) % 7
      calories[dayIndex] += parseInt(log.calories || 0, 10)
    })
    return calories
  }

  const refreshFromLogs = (logs) => {
    const normalized = logs.map((log) => ({
      id: log.id,
      mealType: log.mealType,
      foodType: log.foodType,
      mealName: log.mealName || '',
      calories: parseInt(log.calories || 0, 10),
      protein: parseInt(log.protein || 0, 10),
      carbs: parseInt(log.carbs || 0, 10),
      fats: parseInt(log.fats || 0, 10),
      notes: log.notes || '',
      timestamp: log.timestamp
    }))

    setMeals(normalized)
    setChartData({ calories: buildWeeklyCalories(normalized) })
  }

  useEffect(() => {
    if (!user?.email) {
      return
    }

    const loadLogs = async () => {
      setApiError('')
      try {
        const result = await mealService.getMeals(user.email)
        const logs = result?.data ?? result ?? []
        refreshFromLogs(logs)
      } catch (error) {
        setApiError('Unable to load meal logs right now.')
      } finally {
        setDataLoaded(true)
      }
    }

    loadLogs()
  }, [user?.email])

  // Redirect to add log page if no logs exist
  useEffect(() => {
    if (dataLoaded && meals.length === 0 && user?.email) {
      navigate('/add-meal')
    }
  }, [dataLoaded, meals.length, user?.email, navigate])

  const handleDeleteLog = async (index) => {
    if (!window.confirm('Are you sure you want to delete this log?')) {
      return
    }

    const logToDelete = meals[index]
    if (!logToDelete?.id) {
      setApiError('This meal log cannot be deleted because id is missing.')
      return
    }
    
    try {
      await mealService.deleteMeal(user.email, logToDelete.id)
      const updatedMeals = meals.filter((_, i) => i !== index)
      refreshFromLogs(updatedMeals)
    } catch (error) {
      setApiError('Failed to delete log. Please try again.')
    }
  }

  return (
    <div className="home-container">
      <Navbar />

      <div className="container">
        <section className="section-card tracker-hero animate delay-1">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
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
              <h1>Meal Tracker</h1>
              <p>Balance macros, log meals, and watch your daily intake.</p>
            </div>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => navigate('/add-meal')}
              style={{ whiteSpace: 'nowrap', marginLeft: 'auto' }}
            >
              + Add Meal Log
            </button>
          </div>
        </section>

        {hasLogs && (
          <>
            <section className="section-card tracker-grid animate delay-3">
              <div className="stat-tile">
                <div className="stat-title">Today</div>
                <div className="stat-value">{totalCalories} kcal</div>
                <div className="stat-sub">Target 2,000 kcal</div>
              </div>
              <div className="stat-tile">
                <div className="stat-title">Protein</div>
                <div className="stat-value">{totalProtein} g</div>
                <div className="stat-sub">Goal 130 g</div>
              </div>
              <div className="stat-tile">
                <div className="stat-title">Carbs</div>
                <div className="stat-value">{totalCarbs} g</div>
                <div className="stat-sub">Goal 250 g</div>
              </div>
              <div className="stat-tile">
                <div className="stat-title">Fats</div>
                <div className="stat-value">{totalFats} g</div>
                <div className="stat-sub">Goal 65 g</div>
              </div>
            </section>

            <section className="section-card chart-grid animate delay-4">
              <div className="chart-container">
                <h3>Weekly Calories</h3>
                <Bar data={calorieData} options={barOptions} />
              </div>
              <div className="chart-container">
                <h3>Today's Macros</h3>
                <Doughnut data={macroData} options={doughnutOptions} />
              </div>
            </section>

            <section className="section-card animate delay-5">
              <h3>Recent Meals</h3>
              <div className="meals-list">
                {meals.map((meal, index) => (
                  <div key={meal.id || index} className="meal-item">
                    <div className="meal-info">
                      <strong>{meal.mealType}</strong>
                      <span>{meal.mealName || meal.foodType}</span>
                    </div>
                    <div className="meal-stats">
                      <span>{meal.calories} cal</span>
                      <span>P: {meal.protein}g</span>
                      <span>C: {meal.carbs}g</span>
                      <span>F: {meal.fats}g</span>
                      <button
                        onClick={() => handleDeleteLog(index)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          backgroundColor: '#ff6b6b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default MealTracker