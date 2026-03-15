import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { profileService, workoutPlanService, goalService } from '../services/api'
import Navbar from './Navbar'
import './Home.css'
import './TrackerPages.css'
import './WorkoutPlanner.css'

const WorkoutPlanner = () => {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [workoutPlanResult, setWorkoutPlanResult] = useState('')
  const [planError, setPlanError] = useState('')
  const [savingPlan, setSavingPlan] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [formData, setFormData] = useState({
    equipment: '',
    healthConditions: '',
    sessionTime: '',
    planPeriod: 'week',
    muscleGroup: ''
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (user?.email) {
          const response = await profileService.getProfile(user.email)
          // Backend returns { data: profileResponse, message: "..." }
          const profileData = response.data || response
          setUserProfile(profileData)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const parseWorkoutPlan = (rawPlan) => {
    const sections = rawPlan.split(/\n(?=(?:[A-Za-z\d\s]*(?:Day|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Week|Exercise|Warm|Cool|Rest|Warm-up|Cool-down))|[A-Z][^:\n]*:|^\d+\.|^-\s)/).filter(s => s.trim())
    const parsed = []

    sections.forEach((section) => {
      const trimmed = section.trim()
      if (trimmed) {
        const lines = trimmed.split('\n').filter(l => l.trim())
        if (lines.length > 0) {
          parsed.push({
            title: lines[0].replace(/^\*\*|\*\*$/g, '').replace(/^[-•]\s/, '').trim(),
            details: lines.slice(1).join(' ').trim() || lines[0]
          })
        }
      }
    })

    return parsed
  }

  const cleanText = (value) => {
    if (!value) return ''
    return value
      .replace(/\*\*|__|~~|`/g, '')
      .replace(/^\s*[-•#>]+\s*/gm, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const extractExerciseDetails = (line, nextLines = []) => {
    if (!line) return { exercise: 'N/A', sets: 'N/A', reps: 'N/A', rest: 'N/A', form: 'N/A', muscles: 'N/A' }
    
    const cleaned = cleanText(line)
    console.log('Exercise extraction from:', cleaned)
    
    // Try to match pattern: Exercise: [Name] (Sets: X, Reps: Y, Rest: Zs)
    const exerciseMatch = cleaned.match(/[Ee]xercise\s*:\s*([^(]+)/i)
    const setsMatch = cleaned.match(/[Ss]ets?\s*:\s*(\d+)/i)
    const repsMatch = cleaned.match(/[Rr]eps?\s*:\s*(\d+)/i)
    const restMatch = cleaned.match(/[Rr]est?\s*:\s*(\d+[a-z]?)/i)
    
    // Extract Form from next lines
    let form = 'N/A'
    let muscles = 'N/A'
    
    nextLines.forEach(nextLine => {
      const cleanedNext = cleanText(nextLine)
      const formMatch = cleanedNext.match(/[Ff]orm\s*:\s*(.+)/i)
      const musclesMatch = cleanedNext.match(/[Mm]uscles?\s*:\s*(.+)/i)
      
      if (formMatch) form = formMatch[1].trim()
      if (musclesMatch) muscles = musclesMatch[1].trim()
    })
    
    const result = {
      exercise: exerciseMatch ? exerciseMatch[1].trim() : 'N/A',
      sets: setsMatch ? setsMatch[1] : 'N/A',
      reps: repsMatch ? repsMatch[1] : 'N/A',
      rest: restMatch ? restMatch[1] : 'N/A',
      form: form,
      muscles: muscles
    }
    
    console.log('Extracted exercise details:', result)
    return result
  }

  const formatWorkoutPlanTemplate = (rawPlan, planPeriod) => {
    console.log('Raw workout plan input:', rawPlan)
    console.log('Workout plan period:', planPeriod)
    
    if (!rawPlan || !rawPlan.trim()) {
      if (planPeriod === 'week') {
        return `Weekly Workout Plan\n\n${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => 
          `${day}:\n  Exercise: N/A (Sets: N/A, Reps: N/A, Rest: N/A)`
        ).join('\n\n')}`
      }
      return 'Your Workout Plan\nWarm-up:\n  Exercise: N/A (Sets: N/A, Reps: N/A, Rest: N/A)\nMain Workout:\n  Exercise: N/A (Sets: N/A, Reps: N/A, Rest: N/A)'
    }

    if (planPeriod === 'week') {
      const lines = rawPlan.split('\n')
      console.log('All lines:', lines)
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      
      const weekPlan = days.map((day) => {
        // Find all exercises for this day
        const dayStartIdx = lines.findIndex(line => new RegExp(`^${day}`, 'i').test(line.trim()))
        const nextDayIdx = lines.findIndex((line, idx) => 
          idx > dayStartIdx && 
          days.some(d => new RegExp(`^${d}`, 'i').test(line.trim()))
        )
        
        const dayEndIdx = nextDayIdx > dayStartIdx ? nextDayIdx : lines.length
        const dayLines = lines.slice(dayStartIdx + 1, dayEndIdx)
        
        // Find all Exercise lines and their following Form/Muscles lines
        const exercises = []
        for (let i = 0; i < dayLines.length; i++) {
          if (/exercise/i.test(dayLines[i])) {
            const nextLines = dayLines.slice(i + 1, i + 5).filter(l => /form|muscles/i.test(l))
            const details = extractExerciseDetails(dayLines[i], nextLines)
            exercises.push(details)
          }
        }
        
        console.log(`${day} exercises:`, exercises)
        
        const exercisesText = exercises.length > 0 
          ? exercises.map(ex => 
              `  Exercise: ${ex.exercise} (Sets: ${ex.sets}, Reps: ${ex.reps}, Rest: ${ex.rest})\n` +
              `    Form: ${ex.form}\n` +
              `    Muscles: ${ex.muscles}`
            ).join('\n')
          : '  Exercise: Rest Day'
        
        return `${day}:\n${exercisesText}`
      }).join('\n\n')

      return `Weekly Workout Plan\n\n${weekPlan}\n\nDuration: 1 Week`
    }

    // Daily plan format
    const lines = rawPlan.split('\n')
    
    // Find Warm-up section exercises
    const warmupStartIdx = lines.findIndex(line => /warm.?up/i.test(line))
    const mainStartIdx = lines.findIndex((line, idx) => idx > warmupStartIdx && /main|workout/i.test(line))
    const warmupEndIdx = mainStartIdx > warmupStartIdx ? mainStartIdx : lines.length
    
    const warmupLines = lines.slice(warmupStartIdx + 1, warmupEndIdx)
    const warmupExercises = []
    
    for (let i = 0; i < warmupLines.length; i++) {
      if (/exercise/i.test(warmupLines[i])) {
        const nextLines = warmupLines.slice(i + 1, i + 5).filter(l => /form|muscles/i.test(l))
        const details = extractExerciseDetails(warmupLines[i], nextLines)
        warmupExercises.push(details)
      }
    }
    
    // Find Main Workout section exercises
    const mainExercises = []
    const mainLines = lines.slice(mainStartIdx + 1)
    
    for (let i = 0; i < mainLines.length; i++) {
      if (/exercise/i.test(mainLines[i])) {
        const nextLines = mainLines.slice(i + 1, i + 5).filter(l => /form|muscles/i.test(l))
        const details = extractExerciseDetails(mainLines[i], nextLines)
        mainExercises.push(details)
      }
    }
    
    const warmupText = warmupExercises.length > 0
      ? warmupExercises.map(ex => 
          `  Exercise: ${ex.exercise} (Sets: ${ex.sets}, Reps: ${ex.reps}, Rest: ${ex.rest})\n` +
          `    Form: ${ex.form}\n` +
          `    Muscles: ${ex.muscles}`
        ).join('\n')
      : '  Exercise: N/A (Sets: N/A, Reps: N/A, Rest: N/A)'
    
    const mainText = mainExercises.length > 0
      ? mainExercises.map(ex => 
          `  Exercise: ${ex.exercise} (Sets: ${ex.sets}, Reps: ${ex.reps}, Rest: ${ex.rest})\n` +
          `    Form: ${ex.form}\n` +
          `    Muscles: ${ex.muscles}`
        ).join('\n')
      : '  Exercise: N/A (Sets: N/A, Reps: N/A, Rest: N/A)'

    return [
      'Your Workout Plan',
      `Warm-up:\n${warmupText}`,
      `Main Workout:\n${mainText}`,
      'Duration: 1 Day'
    ].join('\n\n')
  }

  const handleAddToGoals = async () => {
    try {
      setSavingPlan(true)
      setSaveMessage('')

      const formattedPlan = formatWorkoutPlanTemplate(workoutPlanResult, formData.planPeriod)
      
      const updatedProfile = {
        currentWorkoutPlan: {
          plan: formattedPlan,
          rawPlan: workoutPlanResult,
          parsedPlan: parseWorkoutPlan(workoutPlanResult),
          period: formData.planPeriod,
          createdAt: new Date().toISOString(),
          preferences: {
            equipment: formData.equipment,
            sessionTime: formData.sessionTime,
            healthConditions: formData.healthConditions,
            fitnessLevel: userProfile?.activityLevel,
            workoutFocus: userProfile?.goals?.[0]
          }
        }
      }
      
      await profileService.updateProfile(user.email, updatedProfile)
      
      // Add workout plan as a goal to database
      const workoutGoal = {
        id: Date.now(),
        type: 'fitness',
        icon: '💪',
        name: 'Workout Plan - Active',
        target: 1,
        unit: 'active',
        actual: 1
      }
      
      // Get existing goals from database
      const goalsResponse = await goalService.getGoals(user.email)
      const currentGoals = goalsResponse.data || goalsResponse || []
      
      // Remove any existing workout plan goals
      const filteredGoals = currentGoals.filter(g => !g.name.startsWith('Workout Plan'))
      
      // Add new workout goal
      const updatedGoals = [...filteredGoals, workoutGoal]
      await goalService.saveGoals(user.email, updatedGoals)
      
      setSaveMessage('✓ Workout plan saved to your goals!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Error saving plan:', error)
      setSaveMessage('✗ Failed to save plan. Please try again.')
    } finally {
      setSavingPlan(false)
    }
  }

  const handleGeneratePlan = async () => {
    if (!formData.sessionTime) {
      setPlanError('Please enter session time')
      return
    }

    const planData = {
      age: userProfile?.age,
      fitnessLevel: userProfile?.activityLevel,
      height: userProfile?.height,
      gender: userProfile?.gender,
      weight: userProfile?.weight,
      workoutFocus: userProfile?.goals?.[0] || '',
      equipment: formData.equipment,
      healthConditions: formData.healthConditions,
      sessionTime: parseInt(formData.sessionTime),
      planPeriod: formData.planPeriod,
      muscleGroup: formData.muscleGroup
    }

    try {
      setPlanError('')
      setWorkoutPlanResult('')
      setIsGenerating(true)

      const response = await workoutPlanService.generateWorkoutPlan(planData)
      
      if (response.success) {
        setWorkoutPlanResult(response.plan)
      } else {
        setPlanError(response.message || 'Failed to generate workout plan')
      }
    } catch (error) {
      console.error('Error generating plan:', error)
      setPlanError(error.response?.data?.message || 'Error generating workout plan')
    } finally {
      setIsGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="home-container">
        <Navbar />
        <div className="container">
          <div className="section-card animate">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="home-container">
      <Navbar />

      <div className="container">
        <div className="section-card animate">
          <h2 className="workout-planner-title">Workout Plan Generator</h2>

          {userProfile && (userProfile.age || userProfile.activityLevel || userProfile.height || userProfile.gender || userProfile.weight || userProfile.goals?.[0]) && (
            <div className="user-info-display">
              {userProfile.age && (
                <div className="info-box">
                  <span className="info-label">Age</span>
                  <span className="info-value">{userProfile.age}</span>
                </div>
              )}
              {userProfile.activityLevel && (
                <div className="info-box">
                  <span className="info-label">Fitness Level</span>
                  <span className="info-value">{userProfile.activityLevel}</span>
                </div>
              )}
              {userProfile.height != null && (
                <div className="info-box">
                  <span className="info-label">Height</span>
                  <span className="info-value">{userProfile.height} cm</span>
                </div>
              )}
              {userProfile.gender && (
                <div className="info-box">
                  <span className="info-label">Gender</span>
                  <span className="info-value">{userProfile.gender}</span>
                </div>
              )}
              {userProfile.weight != null && (
                <div className="info-box">
                  <span className="info-label">Weight</span>
                  <span className="info-value">{userProfile.weight} kg</span>
                </div>
              )}
              {userProfile.goals?.[0] && (
                <div className="info-box">
                  <span className="info-label">Workout Focus</span>
                  <span className="info-value">{userProfile.goals?.[0]}</span>
                </div>
              )}
            </div>
          )}

          <div className="workout-form-grid">
            <div>
              <div className="form-group">
                <label className="form-label">Available Equipment</label>
                <select 
                  name="equipment"
                  value={formData.equipment}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">Select Equipment</option>
                  <option value="none">No Equipment (Bodyweight)</option>
                  <option value="basic">Basic (Dumbbells, Resistance Bands)</option>
                  <option value="home-gym">Home Gym Setup</option>
                  <option value="full-gym">Full Gym Access</option>
                </select>
              </div>
            </div>
            <div>
              <div className="form-group">
                <label className="form-label">Muscle Group Focus</label>
                <select 
                  name="muscleGroup"
                  value={formData.muscleGroup}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">Select Muscle Group</option>
                  <option value="full-body">Full Body</option>
                  <option value="chest">Chest</option>
                  <option value="back">Back</option>
                  <option value="legs">Legs</option>
                  <option value="arms">Arms</option>
                  <option value="shoulders">Shoulders</option>
                  <option value="core">Core</option>
                </select>
              </div>
            </div>
            <div>
              <div className="form-group">
                <label className="form-label">Plan Duration</label>
                <select 
                  name="planPeriod"
                  value={formData.planPeriod}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="day">1 Day</option>
                  <option value="week">1 Week</option>
                </select>
              </div>
            </div>
          </div>
          <div className="session-time-group">
            <label className="form-label">Time per session (minutes)</label>
            <input 
              type="number" 
              name="sessionTime"
              value={formData.sessionTime}
              onChange={handleInputChange}
              className="session-time-input"
              placeholder="e.g., 30, 45, 60"
            />
          </div>
          <div className="button-container">
            <button 
              type="button" 
              className="ghost-btn"
              onClick={handleGeneratePlan}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Workout Plan'}
            </button>
          </div>

          {planError && (
            <div className="diet-plan-error">
              {planError}
            </div>
          )}

          {workoutPlanResult && (
            <div className="diet-plan-result section-card animate">
              <h3 className="diet-plan-result-title">Your Workout Plan</h3>
              <div className="diet-plan-container">
                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'inherit' }}>
                  {formatWorkoutPlanTemplate(workoutPlanResult, formData.planPeriod)}
                </pre>
              </div>
              
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  className="ghost-btn"
                  onClick={handleAddToGoals}
                  disabled={savingPlan}
                >
                  {savingPlan ? 'Saving...' : 'Add to Goals'}
                </button>
                {saveMessage && (
                  <span className={`save-message ${saveMessage.includes('✓') ? 'success' : 'error'}`}>
                    {saveMessage}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkoutPlanner
