import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { workoutService, waterService, sleepService, mealService } from '../services/api'
import { Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js'
import Navbar from './Navbar'
import './Home.css'
import './TrackerPages.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend)

const METRIC_CONFIG = {
  workout: { label: 'Workout (min)', color: '#0ea5a6', background: 'rgba(14, 165, 166, 0.32)' },
  water: { label: 'Water (L)', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.32)' },
  sleep: { label: 'Sleep (hrs)', color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.32)' },
  calories: { label: 'Calories', color: '#10b981', background: 'rgba(16, 185, 129, 0.32)' }
}

const PERIOD_OPTIONS = ['day', 'week', 'month', 'year']

const CombinedGraph = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [allLogs, setAllLogs] = useState({
    workouts: [],
    water: [],
    sleep: [],
    meals: []
  })
  const [period, setPeriod] = useState('week')
  const [selectedMetric, setSelectedMetric] = useState('calories')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const selectedDateObject = new Date(`${selectedDate}T00:00:00`)

  const toNumber = (value) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  const isSameDay = (dateA, dateB) =>
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()

  const getDaySeriesMeta = () => {
    const labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
    return {
      labels,
      getBucketIndex: (date) => date.getHours()
    }
  }

  const getWeekSeriesMeta = () => {
    const labels = []
    const dates = []
    const anchor = new Date(selectedDateObject)

    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(anchor)
      d.setDate(anchor.getDate() - i)
      labels.push(d.toLocaleDateString(undefined, { weekday: 'short' }))
      dates.push(d)
    }

    return {
      labels,
      getBucketIndex: (date) => dates.findIndex((d) => isSameDay(d, date))
    }
  }

  const getMonthSeriesMeta = () => {
    const year = selectedDateObject.getFullYear()
    const month = selectedDateObject.getMonth()
    const lastDay = new Date(year, month + 1, 0).getDate()
    const labels = Array.from({ length: lastDay }, (_, i) => String(i + 1))

    return {
      labels,
      getBucketIndex: (date) => (date.getFullYear() === year && date.getMonth() === month ? date.getDate() - 1 : -1)
    }
  }

  const getYearSeriesMeta = () => {
    const year = selectedDateObject.getFullYear()
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    return {
      labels,
      getBucketIndex: (date) => (date.getFullYear() === year ? date.getMonth() : -1)
    }
  }

  const getSeriesMeta = () => {
    if (period === 'day') return getDaySeriesMeta()
    if (period === 'week') return getWeekSeriesMeta()
    if (period === 'month') return getMonthSeriesMeta()
    return getYearSeriesMeta()
  }

  const getMetricSeries = () => {
    const { labels, getBucketIndex } = getSeriesMeta()

    const workout = Array(labels.length).fill(0)
    const water = Array(labels.length).fill(0)
    const sleep = Array(labels.length).fill(0)
    const calories = Array(labels.length).fill(0)

    allLogs.workouts.forEach((log) => {
      const timestamp = new Date(log.timestamp || Date.now())
      const idx = getBucketIndex(timestamp)
      if (idx >= 0) workout[idx] += toNumber(log.durationMinutes)
    })

    allLogs.water.forEach((log) => {
      const timestamp = new Date(log.timestamp || Date.now())
      const idx = getBucketIndex(timestamp)
      if (idx >= 0) water[idx] += toNumber(log.liters)
    })

    allLogs.sleep.forEach((log) => {
      const timestamp = new Date(log.timestamp || Date.now())
      const idx = getBucketIndex(timestamp)
      if (idx >= 0) sleep[idx] += toNumber(log.durationHours)
    })

    allLogs.meals.forEach((log) => {
      const timestamp = new Date(log.timestamp || Date.now())
      const idx = getBucketIndex(timestamp)
      if (idx >= 0) calories[idx] += toNumber(log.calories)
    })

    return {
      labels,
      workout,
      water,
      sleep,
      calories
    }
  }

  const series = getMetricSeries()

  const lineData = {
    labels: series.labels,
    datasets: [
      {
        label: METRIC_CONFIG.workout.label,
        data: series.workout,
        borderColor: METRIC_CONFIG.workout.color,
        backgroundColor: METRIC_CONFIG.workout.background,
        tension: 0.4
      },
      {
        label: METRIC_CONFIG.water.label,
        data: series.water,
        borderColor: METRIC_CONFIG.water.color,
        backgroundColor: METRIC_CONFIG.water.background,
        tension: 0.4
      },
      {
        label: METRIC_CONFIG.sleep.label,
        data: series.sleep,
        borderColor: METRIC_CONFIG.sleep.color,
        backgroundColor: METRIC_CONFIG.sleep.background,
        tension: 0.4
      },
      {
        label: METRIC_CONFIG.calories.label,
        data: series.calories,
        borderColor: METRIC_CONFIG.calories.color,
        backgroundColor: METRIC_CONFIG.calories.background,
        tension: 0.4
      }
    ]
  }

  const selectedMetricConfig = METRIC_CONFIG[selectedMetric]
  const selectedMetricSeries = series[selectedMetric]

  const barData = {
    labels: series.labels,
    datasets: [
      {
        label: selectedMetricConfig.label,
        data: selectedMetricSeries,
        backgroundColor: selectedMetricConfig.background,
        borderColor: selectedMetricConfig.color,
        borderWidth: 1,
        borderRadius: 8,
        maxBarThickness: 32
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.7,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  const barChartOptions = {
    ...chartOptions,
    aspectRatio: 3.2
  }

  useEffect(() => {
    if (!user?.email) return

    const loadAllLogs = async () => {
      try {
        const [workoutRes, waterRes, sleepRes, mealRes] = await Promise.all([
          workoutService.getWorkouts(user.email),
          waterService.getWaterIntake(user.email),
          sleepService.getSleepLogs(user.email),
          mealService.getMeals(user.email)
        ])

        const workouts = workoutRes?.data ?? []
        const water = waterRes?.data ?? []
        const sleep = sleepRes?.data ?? []
        const meals = mealRes?.data ?? []

        setAllLogs({ workouts, water, sleep, meals })
      } catch (error) {
        console.error('Failed to load logs:', error)
      }
    }

    loadAllLogs()
  }, [user?.email])

  const daySnapshot = (() => {
    const target = selectedDateObject
    let workout = 0
    let water = 0
    let sleep = 0
    let calories = 0

    allLogs.workouts.forEach((log) => {
      const date = new Date(log.timestamp || Date.now())
      if (isSameDay(date, target)) workout += toNumber(log.durationMinutes)
    })

    allLogs.water.forEach((log) => {
      const date = new Date(log.timestamp || Date.now())
      if (isSameDay(date, target)) water += toNumber(log.liters)
    })

    allLogs.sleep.forEach((log) => {
      const date = new Date(log.timestamp || Date.now())
      if (isSameDay(date, target)) sleep += toNumber(log.durationHours)
    })

    allLogs.meals.forEach((log) => {
      const date = new Date(log.timestamp || Date.now())
      if (isSameDay(date, target)) calories += toNumber(log.calories)
    })

    return {
      workout,
      water,
      sleep,
      calories
    }
  })()

  const totals = {
    workoutMinutes: series.workout.reduce((a, b) => a + b, 0),
    waterLiters: series.water.reduce((a, b) => a + b, 0).toFixed(1),
    sleepHours: series.sleep.reduce((a, b) => a + b, 0).toFixed(1),
    calories: series.calories.reduce((a, b) => a + b, 0)
  }

  const periodTitle = {
    day: 'Day',
    week: 'Week',
    month: 'Month',
    year: 'Year'
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
              <h1>Combined Health Overview</h1>
              <p>Line and bar report with day, week, month, year filters and date-wise view.</p>
            </div>
          </div>
        </section>
        <section className="section-card animate delay-2" style={{ marginBottom: '1rem', padding: '18px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.95rem' }}>View Basis</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                style={{ width: '100%', padding: '0.58rem 0.7rem', borderRadius: '8px', border: '1px solid #d6d6d6' }}
              >
                {PERIOD_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.95rem' }}>Bar Metric</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                style={{ width: '100%', padding: '0.58rem 0.7rem', borderRadius: '8px', border: '1px solid #d6d6d6' }}
              >
                <option value="sleep">Sleep</option>
                <option value="calories">Calories</option>
                <option value="water">Water</option>
                <option value="workout">Workout</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.95rem' }}>Calendar Day</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ width: '100%', padding: '0.58rem 0.7rem', borderRadius: '8px', border: '1px solid #d6d6d6' }}
              />
            </div>
          </div>
        </section>
        

        <section className="section-card tracker-grid animate delay-2">
          <div className="stat-tile">
            <div className="stat-title">Workout ({periodTitle[period]})</div>
            <div className="stat-value">{totals.workoutMinutes} min</div>
            <div className="stat-sub">Selected period total</div>
          </div>
          <div className="stat-tile">
            <div className="stat-title">Water ({periodTitle[period]})</div>
            <div className="stat-value">{totals.waterLiters} L</div>
            <div className="stat-sub">Selected period total</div>
          </div>
          <div className="stat-tile">
            <div className="stat-title">Sleep ({periodTitle[period]})</div>
            <div className="stat-value">{totals.sleepHours} hrs</div>
            <div className="stat-sub">Selected period total</div>
          </div>
          <div className="stat-tile">
            <div className="stat-title">Calories ({periodTitle[period]})</div>
            <div className="stat-value">{totals.calories}</div>
            <div className="stat-sub">Selected period total</div>
          </div>
        </section>
       
        <section className="section-card animate delay-4">
          <div className="chart-card" style={{ maxWidth: '920px', margin: '0 auto' }}>
            <div className="chart-title">{periodTitle[period]} Health Trends (Line)</div>
            <div className="chart-subtitle">Tracks sleep, calories, water, and workout together.</div>
            <Line data={lineData} options={chartOptions} />
          </div>
        </section>

        

        <section className="section-card tracker-grid animate delay-3">
          <div className="stat-tile">
            <div className="stat-title">Day Snapshot</div>
            <div className="stat-value">{new Date(`${selectedDate}T00:00:00`).toLocaleDateString()}</div>
            <div className="stat-sub">Calendar-selected date</div>
          </div>
          <div className="stat-tile">
            <div className="stat-title">Workout (Day)</div>
            <div className="stat-value">{daySnapshot.workout} min</div>
            <div className="stat-sub">Specific day data</div>
          </div>
          <div className="stat-tile">
            <div className="stat-title">Water (Day)</div>
            <div className="stat-value">{daySnapshot.water.toFixed(1)} L</div>
            <div className="stat-sub">Specific day data</div>
          </div>
          <div className="stat-tile">
            <div className="stat-title">Sleep / Calories (Day)</div>
            <div className="stat-value">{daySnapshot.sleep.toFixed(1)}h / {daySnapshot.calories}</div>
            <div className="stat-sub">Specific day data</div>
          </div>
        </section>

        
        <section className="section-card animate delay-5">
          <div className="chart-card" style={{ maxWidth: '920px', margin: '0 auto' }}>
            <div className="chart-title">{selectedMetricConfig.label} ({periodTitle[period]}) (Bar)</div>
            <div className="chart-subtitle">Switch metric from the dropdown to focus on one chart.</div>
            <Bar data={barData} options={barChartOptions} />
          </div>
        </section>
      </div>
    </div>
  )
}

export default CombinedGraph
