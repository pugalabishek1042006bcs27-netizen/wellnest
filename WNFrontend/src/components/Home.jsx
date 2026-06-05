import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { mealService, profileService, sleepService, waterService, workoutService, healthTipService, goalService } from '../services/api'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import Navbar from './Navbar'
import './Home.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const Home = () => {
  const { user, isGuest } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [profile, setProfile] = useState(null)

  const [waterIntake, setWaterIntake] = useState(0)
  const [workoutMinutes, setWorkoutMinutes] = useState(0)
  const [sleepHours, setSleepHours] = useState(0)
  const [mealSummary, setMealSummary] = useState({
    Breakfast: 'Not logged',
    Lunch: 'Not logged',
    Dinner: 'Not logged'
  })
  const [weeklyData, setWeeklyData] = useState({
    meals: [0, 0, 0, 0, 0, 0, 0],
    sleep: [0, 0, 0, 0, 0, 0, 0],
    water: [0, 0, 0, 0, 0, 0, 0],
    workouts: [0, 0, 0, 0, 0, 0, 0]
  })

  const [goals, setGoals] = useState([])
  const [goalStreaks, setGoalStreaks] = useState({})
  const [weeklyStreakDays, setWeeklyStreakDays] = useState(Array(7).fill(false))
  const [showAddGoalModal, setShowAddGoalModal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    type: 'fitness',
    exercise: '',
    duration: '',
    calories: '',
    fats: '',
    carbs: '',
    proteins: '',
    waterLiters: '',
    sleepHours: ''
  })

  const categoryDefaults = {
    fitness: { icon: '🏃', unit: 'per day' },
    nutrition: { icon: '🥗', unit: 'per day' },
    hydration: { icon: '💧', unit: 'per day' },
    sleep: { icon: '😴', unit: 'per day' }
  }

  // Welcome banner tip
  const [bannerTip, setBannerTip] = useState(null)
  const bannerIntervalRef = useRef(null)

  const exercises = ['Cardio', 'Strength', 'Yoga', 'HIIT', 'Cycling', 'Running', 'Swimming', 'Other']

  const toSafeNumber = (value, fallback = 0) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  const parseTimestamp = (value) => {
    if (!value) {
      return null
    }
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const toDateKey = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getCurrentWeekDateKeys = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const monday = new Date(today)
    const dayOfWeek = monday.getDay()
    const daysSinceMonday = (dayOfWeek + 6) % 7
    monday.setDate(monday.getDate() - daysSinceMonday)

    return Array.from({ length: 7 }, (_, index) => {
      const current = new Date(monday)
      current.setDate(monday.getDate() + index)
      return toDateKey(current)
    })
  }

  const aggregateDailyValues = (logs, valueGetter) => {
    return logs.reduce((acc, log) => {
      const timestamp = parseTimestamp(log.timestamp)
      if (!timestamp) {
        return acc
      }

      const value = toSafeNumber(valueGetter(log), 0)
      if (value <= 0) {
        return acc
      }

      const key = toDateKey(timestamp)
      acc[key] = (acc[key] || 0) + value
      return acc
    }, {})
  }

  const calculateWeeklyCompletionDays = (dailyTotals, target) => {
    const safeTarget = toSafeNumber(target, 0)
    if (safeTarget <= 0) {
      return Array(7).fill(false)
    }

    const weekKeys = getCurrentWeekDateKeys()
    return weekKeys.map((dayKey) => {
      const dayTotal = toSafeNumber(dailyTotals[dayKey], 0)
      return dayTotal >= safeTarget
    })
  }

  const calculateWeeklyDaysMet = (dailyTotals, target) => {
    return calculateWeeklyCompletionDays(dailyTotals, target).filter(Boolean).length
  }

  const getGoalKey = (goal) => {
    return goal?.id ?? `${goal?.type || 'goal'}-${goal?.name || 'unknown'}`
  }

  const getIconByCategory = (category) => {
    return categoryDefaults[category]?.icon || '🎯'
  }

  // Load goals from database on mount and when navigating to this page
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        if (isGuest) {
          // For guests, load goals from sessionStorage
          const storedGoals = sessionStorage.getItem('guestGoals')
          if (storedGoals) {
            const parsedGoals = JSON.parse(storedGoals)
            const normalizedGoals = Array.isArray(parsedGoals)
              ? parsedGoals.map((goal) => ({
                  ...goal,
                  target: toSafeNumber(goal.target, 0),
                  actual: toSafeNumber(goal.actual, 0)
                }))
              : []
            setGoals(normalizedGoals)
          } else {
            // Set empty goals for guest users
            setGoals([])
          }
        } else if (user?.email) {
          const goalsResponse = await goalService.getGoals(user.email)
          const fetchedGoals = goalsResponse.data || goalsResponse || []
          const normalizedGoals = Array.isArray(fetchedGoals)
            ? fetchedGoals.map((goal) => ({
                ...goal,
                target: toSafeNumber(goal.target, 0),
                actual: toSafeNumber(goal.actual, 0)
              }))
            : []
          setGoals(normalizedGoals)
        }
      } catch (error) {
        console.error('Error fetching goals:', error)
        // Fallback to default goals if there's an error
        const defaultGoals = [
          { id: 1, name: 'Fitness Goal', target: 5, unit: 'workouts/week', icon: '🏃', type: 'fitness', actual: 0 },
          { id: 2, name: 'Nutrition Goal', target: 5, unit: 'servings/day', icon: '🥗', type: 'nutrition', actual: 0 },
          { id: 3, name: 'Hydration Goal', target: 8, unit: 'glasses/day', icon: '💧', type: 'hydration', actual: 0 },
          { id: 4, name: 'Sleep Goal', target: 8, unit: 'hours/night', icon: '😴', type: 'sleep', actual: 0 }
        ]
        setGoals(defaultGoals)
      }
    }
    fetchGoals()
  }, [user, isGuest, location.pathname])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (isGuest) {
          // For guests, load profile from sessionStorage
          const storedProfile = sessionStorage.getItem('guestProfile')
          if (storedProfile) {
            setProfile(JSON.parse(storedProfile))
          }
        } else if (user?.email) {
          const response = await profileService.getProfile(user.email)
          // Backend returns { data: profileResponse, message: "..." }
          const profileData = response.data || response
          setProfile(profileData)
        }
      } catch (err) {
        console.log('Profile not yet set up')
      }
    }
    fetchProfile()
  }, [user, isGuest])

  useEffect(() => {
    const isSameDay = (date, target) => {
      return date.getFullYear() === target.getFullYear()
        && date.getMonth() === target.getMonth()
        && date.getDate() === target.getDate()
    }

    const getTodayLogs = (logs) => {
      const today = new Date()
      return logs.filter(log => {
        const loggedAt = parseTimestamp(log.timestamp)
        return loggedAt ? isSameDay(loggedAt, today) : false
      })
    }

    const fetchLogs = async () => {
      if (!user?.email) {
        return
      }

      try {
        const [waterResponse, workoutResponse, sleepResponse, mealResponse] = await Promise.all([
          waterService.getWaterIntake(user.email),
          workoutService.getWorkouts(user.email),
          sleepService.getSleepLogs(user.email),
          mealService.getMeals(user.email)
        ])

        const waterLogs = getTodayLogs(waterResponse.data || [])
        const workoutLogs = getTodayLogs(workoutResponse.data || [])
        const sleepLogs = (sleepResponse.data || []).slice()
        const mealLogs = getTodayLogs(mealResponse.data || [])

        // Build weekly data for graph
        const buildWeeklyData = (logs, type) => {
          const data = [0, 0, 0, 0, 0, 0, 0]
          logs.forEach((log) => {
            const timestamp = parseTimestamp(log.timestamp)
            if (!timestamp) return
            const dayIndex = (timestamp.getDay() + 6) % 7

            if (type === 'meals') {
              data[dayIndex] += parseInt(log.calories || 0, 10)
            } else if (type === 'sleep') {
              data[dayIndex] = parseFloat(log.durationHours || 0)
            } else if (type === 'water') {
              data[dayIndex] += parseFloat(log.liters || 0)
            } else if (type === 'workouts') {
              data[dayIndex] += parseInt(log.durationMinutes || 0, 10)
            }
          })
          return data
        }

        setWeeklyData({
          meals: buildWeeklyData(mealResponse.data || [], 'meals'),
          sleep: buildWeeklyData(sleepResponse.data || [], 'sleep'),
          water: buildWeeklyData(waterResponse.data || [], 'water'),
          workouts: buildWeeklyData(workoutResponse.data || [], 'workouts')
        })

        const totalCups = waterLogs.reduce((sum, log) => {
          const liters = Number(log.liters)
          if (!Number.isNaN(liters) && liters > 0) {
            return sum + liters
          }
          return sum
        }, 0)
        setWaterIntake(Math.round(totalCups))

        const totalWorkoutMinutes = workoutLogs.reduce((sum, log) => {
          const minutes = Number(log.durationMinutes)
          return !Number.isNaN(minutes) && minutes > 0 ? sum + minutes : sum
        }, 0)
        setWorkoutMinutes(Math.round(totalWorkoutMinutes))

        sleepLogs.sort((a, b) => {
          const first = parseTimestamp(a.timestamp)
          const second = parseTimestamp(b.timestamp)
          return (second?.getTime() || 0) - (first?.getTime() || 0)
        })
        const latestSleep = sleepLogs[0]
        const latestSleepHours = latestSleep ? Number(latestSleep.durationHours) : 0
        setSleepHours(!Number.isNaN(latestSleepHours) ? latestSleepHours : 0)

        const latestMealsByType = mealLogs.reduce((acc, log) => {
          const type = log.mealType || ''
          const timestamp = parseTimestamp(log.timestamp)?.getTime() || 0
          if (!type) {
            return acc
          }
          if (!acc[type] || timestamp > acc[type].timestamp) {
            acc[type] = { log, timestamp }
          }
          return acc
        }, {})

        setMealSummary({
          Breakfast: latestMealsByType.Breakfast?.log?.foodType || 'Not logged',
          Lunch: latestMealsByType.Lunch?.log?.foodType || 'Not logged',
          Dinner: latestMealsByType.Dinner?.log?.foodType || 'Not logged'
        })

        const totalMealCalories = mealLogs.reduce((sum, log) => {
          const calories = Number(log.calories)
          return !Number.isNaN(calories) && calories > 0 ? sum + calories : sum
        }, 0)

        const hydrationByDay = aggregateDailyValues(waterResponse.data || [], (log) => log.liters)
        const fitnessByDay = aggregateDailyValues(workoutResponse.data || [], (log) => log.durationMinutes)
        const sleepByDay = aggregateDailyValues(sleepResponse.data || [], (log) => log.durationHours)
        const nutritionByDay = aggregateDailyValues(mealResponse.data || [], (log) => log.calories)

        // Update goals with actual data
        if (goals.length > 0) {
          const streaks = {}
          const completionByGoal = []
          const updatedGoals = goals.map(goal => {
            let actual = 0
            let completionDays = Array(7).fill(false)
            switch (goal.type) {
              case 'hydration':
                actual = Math.round(totalCups)
                streaks[getGoalKey(goal)] = calculateWeeklyDaysMet(hydrationByDay, goal.target)
                completionDays = calculateWeeklyCompletionDays(hydrationByDay, goal.target)
                break
              case 'fitness':
                actual = totalWorkoutMinutes
                streaks[getGoalKey(goal)] = calculateWeeklyDaysMet(fitnessByDay, goal.target)
                completionDays = calculateWeeklyCompletionDays(fitnessByDay, goal.target)
                break
              case 'sleep':
                actual = !Number.isNaN(latestSleepHours) ? latestSleepHours : 0
                streaks[getGoalKey(goal)] = calculateWeeklyDaysMet(sleepByDay, goal.target)
                completionDays = calculateWeeklyCompletionDays(sleepByDay, goal.target)
                break
              case 'nutrition':
                actual = totalMealCalories
                streaks[getGoalKey(goal)] = calculateWeeklyDaysMet(nutritionByDay, goal.target)
                completionDays = calculateWeeklyCompletionDays(nutritionByDay, goal.target)
                break
              default:
                actual = 0
                streaks[getGoalKey(goal)] = 0
                completionDays = Array(7).fill(false)
            }

            completionByGoal.push(completionDays)
            return { ...goal, actual }
          })

          const combinedCompletion = Array.from({ length: 7 }, (_, dayIndex) => (
            completionByGoal.some((days) => days[dayIndex])
          ))

          setGoals(updatedGoals)
          setGoalStreaks(streaks)
          setWeeklyStreakDays(combinedCompletion)
          // Save updated goals to database
          if (user?.email) {
            try {
              await goalService.saveGoals(user.email, updatedGoals)
            } catch (saveError) {
              console.error('Error saving goals:', saveError)
            }
          }
        } else {
          setGoalStreaks({})
          setWeeklyStreakDays(Array(7).fill(false))
        }
      } catch (err) {
        console.log('Unable to load tracker data')
      }
    }

    fetchLogs()

    // Set up interval to refetch logs every 30 seconds
    const interval = setInterval(fetchLogs, 60000)
    return () => clearInterval(interval)
  }, [user, goals.length])

  // Welcome banner tip – fetch on mount, auto-refresh every 1 hour
  useEffect(() => {
    const fetchBannerTip = async () => {
      try {
        const res = await healthTipService.getRandomHealthTip('general')
        if (res && res.success && res.data) setBannerTip(res.data)
      } catch (_) { }
    }
    fetchBannerTip()
    bannerIntervalRef.current = setInterval(fetchBannerTip, 3600000)
    return () => clearInterval(bannerIntervalRef.current)
  }, [])

  const handleTrackerNavigation = (path) => {
    navigate(path)
  }

  const handleAddGoal = () => {
    setShowAddGoalModal(true)
  }

  const handleCloseModal = () => {
    setShowAddGoalModal(false)
    setNewGoal({
      type: 'fitness',
      exercise: '',
      duration: '',
      calories: '',
      fats: '',
      carbs: '',
      proteins: '',
      waterLiters: '',
      sleepHours: ''
    })
  }

  const handleGoalInputChange = (e) => {
    const { name, value } = e.target
    setNewGoal(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveGoal = async () => {
    const { type, exercise, duration, calories, fats, carbs, proteins, waterLiters, sleepHours } = newGoal

    let goalToAdd = {
      id: Date.now(),
      type,
      icon: getIconByCategory(type),
      unit: 'per day',
      actual: 0
    }

    // Validate and create goal based on type
    if (type === 'fitness') {
      if (!exercise || !duration) {
        alert('Please select exercise and enter duration')
        return
      }
      goalToAdd = {
        ...goalToAdd,
        name: `${exercise} Goal`,
        target: parseInt(duration),
        exercise: exercise
      }
    } else if (type === 'nutrition') {
      if (!calories || !fats || !carbs || !proteins) {
        alert('Please fill in all nutrition fields')
        return
      }
      goalToAdd = {
        ...goalToAdd,
        name: 'Nutrition Goal',
        target: parseInt(calories),
        calories: parseInt(calories),
        fats: parseInt(fats),
        carbs: parseInt(carbs),
        proteins: parseInt(proteins)
      }
    } else if (type === 'hydration') {
      if (!waterLiters) {
        alert('Please enter water intake in liters')
        return
      }
      goalToAdd = {
        ...goalToAdd,
        name: 'Hydration Goal',
        target: parseFloat(waterLiters),
        waterLiters: parseFloat(waterLiters)
      }
    } else if (type === 'sleep') {
      if (!sleepHours) {
        alert('Please enter sleep hours')
        return
      }
      goalToAdd = {
        ...goalToAdd,
        name: 'Sleep Goal',
        target: parseFloat(sleepHours),
        sleepHours: parseFloat(sleepHours)
      }
    }

    const updatedGoals = [...goals, goalToAdd]
    setGoals(updatedGoals)

    // Save to database or sessionStorage based on user type
    if (isGuest) {
      // For guests, store in sessionStorage
      sessionStorage.setItem('guestGoals', JSON.stringify(updatedGoals))
    } else if (user?.email) {
      // For authenticated users, save to backend
      try {
        await goalService.saveGoals(user.email, updatedGoals)
      } catch (error) {
        console.error('Error saving goal:', error)
        alert('Failed to save goal. Please try again.')
        return
      }
    }

    handleCloseModal()
  }

  const handleDeleteGoal = async (goalId) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId)
    setGoals(updatedGoals)

    if (isGuest) {
      // For guests, update sessionStorage
      sessionStorage.setItem('guestGoals', JSON.stringify(updatedGoals))
    } else if (user?.email) {
      // For authenticated users, delete from backend
      try {
        await goalService.saveGoals(user.email, updatedGoals)
      } catch (error) {
        console.error('Error deleting goal:', error)
        alert('Failed to delete goal. Please try again.')
      }
    }
  }

  const calculateGoalProgress = (goal) => {
    if (!goal?.target) return 0
    const progress = Math.min(100, Math.round((toSafeNumber(goal.actual, 0) / toSafeNumber(goal.target, 1)) * 100))
    return progress
  }

  // Calculate percentages for tracker cards
  const getWorkoutTarget = () => {
    const fitnessGoal = goals.find(g => g.type === 'fitness')
    return fitnessGoal?.target || 30
  }

  const getWaterTarget = () => {
    const hydrationGoal = goals.find(g => g.type === 'hydration')
    return hydrationGoal?.target || 8
  }

  const workoutPercent = Math.min(100, Math.round((workoutMinutes / (getWorkoutTarget() * 60)) * 100))
  const waterPercent = Math.min(100, Math.round((waterIntake / getWaterTarget()) * 100))

  const getFirstName = () => {
    return user?.fullName?.split(' ')[0] || 'User'
  }

  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const combinedChartData = {
    labels: weekLabels,
    datasets: [
      {
        label: 'Calories',
        data: weeklyData.meals,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Sleep (hrs)',
        data: weeklyData.sleep,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        yAxisID: 'y1'
      },
      {
        label: 'Water (L)',
        data: weeklyData.water,
        borderColor: '#0ea5a6',
        backgroundColor: 'rgba(14, 165, 166, 0.1)',
        tension: 0.4,
        yAxisID: 'y1'
      },
      {
        label: 'Workout (min)',
        data: weeklyData.workouts,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        yAxisID: 'y2'
      }
    ]
  }

  const combinedChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Calories'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Sleep (hrs) / Water (L)'
        },
        grid: {
          drawOnChartArea: false
        }
      },
      y2: {
        type: 'linear',
        display: false,
        position: 'right'
      }
    }
  }

  // Health Calculators
  const calculateBMI = () => {
    if (profile?.height && profile?.weight) {
      const heightInMeters = profile.height / 100
      const bmi = profile.weight / (heightInMeters * heightInMeters)
      return bmi.toFixed(1)
    }
    return null
  }

  const getBMICategory = (bmi) => {
    if (!bmi) return 'Not Available'
    const bmiValue = parseFloat(bmi)
    if (bmiValue < 18.5) return 'Underweight'
    if (bmiValue < 25) return 'Normal'
    if (bmiValue < 30) return 'Overweight'
    return 'Obese'
  }

  const calculateBMR = () => {
    if (profile?.weight && profile?.height && profile?.age && profile?.gender) {
      let bmr
      if (profile.gender?.toLowerCase() === 'male') {
        bmr = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age)
      } else {
        bmr = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age)
      }
      return Math.round(bmr)
    }
    return null
  }

  const calculateIdealWeight = () => {
    if (profile?.height && profile?.gender) {
      const heightInCm = profile.height
      let idealWeight
      if (profile.gender?.toLowerCase() === 'male') {
        idealWeight = 50 + 0.91 * (heightInCm - 152.4)
      } else {
        idealWeight = 45.5 + 0.91 * (heightInCm - 152.4)
      }
      return `${Math.round(idealWeight - 5)}-${Math.round(idealWeight + 5)} kg`
    }
    return 'N/A'
  }

  const calculateWaterIntakeGoal = () => {
    if (profile?.weight) {
      const waterInLiters = (profile.weight * 0.033).toFixed(1)
      return `${waterInLiters} L`
    }
    return '2-3 L'
  }

  const bmi = calculateBMI()
  const bmr = calculateBMR()
  const idealWeight = calculateIdealWeight()
  const waterGoal = calculateWaterIntakeGoal()

  return (
    <div className="home-container">
      <Navbar />

      <div className="container">
        <div className="welcome-section section-card animate delay-1">
          <h1>Welcome back, {getFirstName()}!</h1>
          <p>Ready to continue your wellness journey? Let's make today count.</p>
          {bannerTip && (
            <div className="banner-tip">
              <img src={bannerTip.imageUrl} alt="Health tip" className="banner-tip-img" loading="lazy" />
              <div className="banner-tip-overlay">
                <p className="banner-tip-text">{bannerTip.text}</p>
              </div>
            </div>
          )}
        </div>

        <div className="goal-tracker-section section-card animate delay-2">
          <div className="goal-header">
            <div>
              <h2>Goal Tracker</h2>
              <p>Set and track your wellness goals for sustainable progress.</p>
              <div className="weekly-streak-strip" aria-label="Weekly streak overview">
                {weekLabels.map((day, index) => (
                  <label key={day} className={`week-day-item ${weeklyStreakDays[index] ? 'checked' : ''}`}>
                    <span className="week-day-label">{day}</span>
                    <input
                      type="checkbox"
                      checked={weeklyStreakDays[index]}
                      readOnly
                      aria-label={`${day} completed`}
                    />
                  </label>
                ))}
              </div>
            </div>
            <button className="ghost-btn" onClick={handleAddGoal}>Add Goal</button>
          </div>
          <div className="goals-grid">
            {goals.map((goal) => (
              <div key={goal.id} className="goal-card">
                <div className="goal-card-header">
                  <div className="goal-icon">{goal.icon}</div>
                  <button
                    className="goal-delete-btn"
                    onClick={() => handleDeleteGoal(goal.id)}
                    title="Delete goal"
                  >
                    ✕
                  </button>
                </div>
                <div className="goal-title">{goal.name}</div>
                <div className="goal-target">{goal.target} {goal.unit}</div>
                <div className="goal-progress">
                  <div className="progress-bar" style={{ width: `${calculateGoalProgress(goal)}%` }} />
                </div>
                <div className="goal-meta">{toSafeNumber(goal.actual, 0).toFixed(1)}/{toSafeNumber(goal.target, 0)} - {calculateGoalProgress(goal)}%</div>
                <div className="goal-streak">
                  🔥 {goalStreaks[getGoalKey(goal)] || 0}/7 days this week
                </div>
              </div>
            ))}
          </div>
        </div>

        {showAddGoalModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Goal</h2>
                <button className="modal-close" onClick={handleCloseModal}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="type"
                    value={newGoal.type}
                    onChange={handleGoalInputChange}
                  >
                    <option value="fitness">🏃 Fitness</option>
                    <option value="nutrition">🥗 Nutrition</option>
                    <option value="hydration">💧 Hydration</option>
                    <option value="sleep">😴 Sleep</option>
                  </select>
                </div>

                {newGoal.type === 'fitness' && (
                  <>
                    <div className="form-group">
                      <label>Exercise</label>
                      <select
                        name="exercise"
                        value={newGoal.exercise}
                        onChange={handleGoalInputChange}
                      >
                        <option value="">Select exercise</option>
                        {exercises.map(ex => (
                          <option key={ex} value={ex}>{ex}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Time Duration (minutes)</label>
                      <input
                        type="number"
                        name="duration"
                        value={newGoal.duration}
                        onChange={handleGoalInputChange}
                        placeholder="e.g., 30"
                        min="1"
                      />
                    </div>
                  </>
                )}

                {newGoal.type === 'nutrition' && (
                  <>
                    <div className="form-group">
                      <label>Calories</label>
                      <input
                        type="number"
                        name="calories"
                        value={newGoal.calories}
                        onChange={handleGoalInputChange}
                        placeholder="e.g., 2000"
                        min="1"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Fats (g)</label>
                        <input
                          type="number"
                          name="fats"
                          value={newGoal.fats}
                          onChange={handleGoalInputChange}
                          placeholder="e.g., 65"
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>Carbs (g)</label>
                        <input
                          type="number"
                          name="carbs"
                          value={newGoal.carbs}
                          onChange={handleGoalInputChange}
                          placeholder="e.g., 300"
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>Proteins (g)</label>
                        <input
                          type="number"
                          name="proteins"
                          value={newGoal.proteins}
                          onChange={handleGoalInputChange}
                          placeholder="e.g., 50"
                          min="0"
                        />
                      </div>
                    </div>
                  </>
                )}

                {newGoal.type === 'hydration' && (
                  <div className="form-group">
                    <label>Water Per Day (Liters)</label>
                    <input
                      type="number"
                      name="waterLiters"
                      value={newGoal.waterLiters}
                      onChange={handleGoalInputChange}
                      placeholder="e.g., 2.5"
                      step="0.1"
                      min="0.1"
                    />
                  </div>
                )}

                {newGoal.type === 'sleep' && (
                  <div className="form-group">
                    <label>Sleep Hours Per Night</label>
                    <input
                      type="number"
                      name="sleepHours"
                      value={newGoal.sleepHours}
                      onChange={handleGoalInputChange}
                      placeholder="e.g., 8"
                      step="0.5"
                      min="1"
                      max="24"
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button className="btn-primary" onClick={handleSaveGoal}>Save Goal</button>
              </div>
            </div>
          </div>
        )}

        {(profile?.currentDietPlan || profile?.currentWorkoutPlan) && (
          <div className="current-plans-section section-card animate delay-3">
            <div className="current-plans-header">
              <div>
                <h2>Your Current Plans</h2>
                <p>{profile?.currentDietPlan && profile?.currentWorkoutPlan ? 'View your saved diet and workout plans' : profile?.currentDietPlan ? 'View your saved diet plan' : 'View your saved workout plan'}</p>
              </div>
              <button className="ghost-btn" onClick={() => navigate('/current-plans')}>
                Current Plan
              </button>
            </div>
          </div>
        )}

        <div className="trackers-section section-card animate delay-3">
          <div className="section-title-row">
            <div>
              <h2>Daily Trackers</h2>
              <span className="section-note">Log small wins to build big habits.</span>
            </div>
            <button className="ghost-btn" onClick={() => handleTrackerNavigation('/combined-graph')}>📊 Generate Report</button>
          </div>
          <div className="trackers-grid">
            <div className="tracker-card">
              <div className="tracker-head">
                <div>
                  <div className="tracker-title">Workout Tracker</div>
                  <div className="tracker-meta">Today's target: {getWorkoutTarget()} min</div>
                </div>
                <div className="tracker-icon">💪</div>
              </div>
              <div className="progress">
                <div className="progress-bar" style={{ width: `${workoutPercent}%` }} />
              </div>
              <div className="tracker-meta">{workoutMinutes} min logged</div>
              <button className="ghost-btn" onClick={() => handleTrackerNavigation('/workout-tracker')}>Log Workout</button>
            </div>

            <div className="tracker-card">
              <div className="tracker-head">
                <div>
                  <div className="tracker-title">Meal Tracker</div>
                  <div className="tracker-meta">Plan your day in three bites</div>
                </div>
                <div className="tracker-icon">🍽️</div>
              </div>
              <ul className="meal-list">
                <li><span>Breakfast</span><strong>{mealSummary.Breakfast}</strong></li>
                <li><span>Lunch</span><strong>{mealSummary.Lunch}</strong></li>
                <li><span>Dinner</span><strong>{mealSummary.Dinner}</strong></li>
              </ul>
              <button className="ghost-btn" onClick={() => handleTrackerNavigation('/meal-tracker')}>Add Meal</button>
            </div>

            <div className="tracker-card">
              <div className="tracker-head">
                <div>
                  <div className="tracker-title">Water Intake</div>
                  <div className="tracker-meta">Stay hydrated</div>
                </div>
                <div className="tracker-icon">💧</div>
              </div>
              <div className="progress">
                <div className="progress-bar" style={{ width: `${waterPercent}%` }} />
              </div>
              <div className="tracker-meta">{waterIntake} / {getWaterTarget()} glasses</div>
              <button className="ghost-btn" onClick={() => handleTrackerNavigation('/water-intake')}>Add Glass</button>
            </div>

            <div className="tracker-card">
              <div className="tracker-head">
                <div>
                  <div className="tracker-title">Sleep Log</div>
                  <div className="tracker-meta">Last night</div>
                </div>
                <div className="tracker-icon">🌙</div>
              </div>
              <div className="sleep-hours">{sleepHours.toFixed(1)} hrs</div>
              <div className="tracker-meta">Aim for 7-9 hours</div>
              <button className="ghost-btn" onClick={() => handleTrackerNavigation('/sleep-logs')}>Log Sleep</button>
            </div>
          </div>
        </div>

        {!isGuest && (
          <div className="stats-section section-card animate delay-6">
            <div className="stat-card health-calc">
              <div className="stat-icon">⚖️</div>
              <div className="stat-number">{bmi || '--'}</div>
              <div className="stat-label">BMI</div>
              <div className="stat-category">{getBMICategory(bmi)}</div>
            </div>
            <div className="stat-card health-calc">
              <div className="stat-icon">🔥</div>
              <div className="stat-number">{bmr || '--'}</div>
              <div className="stat-label">BMR (cal/day)</div>
              <div className="stat-sublabel">Basal Metabolic Rate</div>
            </div>
            <div className="stat-card health-calc">
              <div className="stat-icon">🎯</div>
              <div className="stat-number">{idealWeight}</div>
              <div className="stat-label">Ideal Weight</div>
              <div className="stat-sublabel">Recommended Range</div>
            </div>
            <div className="stat-card health-calc">
              <div className="stat-icon">💧</div>
              <div className="stat-number">{waterGoal}</div>
              <div className="stat-label">Daily Water Goal</div>
              <div className="stat-sublabel">Based on Body Weight</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home