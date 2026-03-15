import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { dietPlanService, profileService, goalService } from '../services/api'
import Navbar from './Navbar'
import './Home.css'
import './TrackerPages.css'
import './DietPlanner.css'

const DietPlanner = () => {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [dietPlanResult, setDietPlanResult] = useState('')
  const [planError, setPlanError] = useState('')
  const [savingPlan, setSavingPlan] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [formData, setFormData] = useState({
    dietaryPreference: '',
    weightGoal: '',
    allergies: '',
    mealFrequency: '',
    cuisinePreference: '',
    mealPrepTime: '',
    planPeriod: 'week'
  })

  const profileWeightGoal = userProfile?.goals?.[0] || userProfile?.weightGoal || ''

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (user?.email) {
          const response = await profileService.getProfile(user.email)
          // Backend returns { data: profileResponse, message: "..." }
          const profileData = response.data || response
          setUserProfile(profileData)
          const defaultWeightGoal = profileData?.goals?.[0] || profileData?.weightGoal || ''
          setFormData(prev => ({
            ...prev,
            weightGoal: defaultWeightGoal
          }))
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUserProfile()
  }, [user])

  useEffect(() => {
    return () => {
      setDietPlanResult('')
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const parseDietPlan = (rawPlan) => {
    const sections = rawPlan.split(/\n\n+/).filter(s => s.trim())
    const parsed = []
    let currentMeal = null

    sections.forEach((section) => {
      const trimmed = section.trim()
      if (trimmed.match(/breakfast|lunch|dinner|snack/i)) {
        if (currentMeal) parsed.push(currentMeal)
        const mealMatch = trimmed.match(/^(\*\*)?([^:\n]+)(\*\*)?\s*:\s*(.+)/i)
        currentMeal = {
          name: mealMatch ? mealMatch[2].trim() : trimmed,
          details: mealMatch ? mealMatch[4].trim() : ""
        }
      } else if (currentMeal) {
        currentMeal.details += (currentMeal.details ? " " : "") + trimmed
      } else if (trimmed) {
        parsed.push({ name: 'Tips', details: trimmed })
      }
    })

    if (currentMeal) parsed.push(currentMeal)
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

  const extractNutritionFromLine = (line) => {
    if (!line) return { calories: 'N/A', fats: 'N/A', carbs: 'N/A' }
    
    const cleaned = cleanText(line)
    console.log('Nutrition extraction from:', cleaned)
    
    // Try to match pattern: (Calories: NUMBER, Fats: NUMBER, Carbs: NUMBER)
    const calorieMatch = cleaned.match(/[Cc]alories?\s*:\s*(\d+(?:\.\d+)?)/i)
    const fatMatch = cleaned.match(/[Ff]ats?\s*:\s*(\d+(?:\.\d+)?)/i)
    const carbMatch = cleaned.match(/[Cc]arbs?\s*:\s*(\d+(?:\.\d+)?)/i)
    
    const result = {
      calories: calorieMatch ? calorieMatch[1] : 'N/A',
      fats: fatMatch ? fatMatch[1] : 'N/A',
      carbs: carbMatch ? carbMatch[1] : 'N/A'
    }
    
    console.log('Extracted nutrition:', result)
    return result
  }

  const formatDietPlanTemplate = (rawPlan, planPeriod) => {
    console.log('Raw plan input:', rawPlan)
    console.log('Plan period:', planPeriod)
    
    if (!rawPlan || !rawPlan.trim()) {
      if (planPeriod === 'week') {
        return `Weekly Diet Plan\n\n${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => 
          `${day}:\n  Breakfast: N/A (Calories: N/A, Fats: N/A, Carbs: N/A)\n  Lunch: N/A (Calories: N/A, Fats: N/A, Carbs: N/A)\n  Dinner: N/A (Calories: N/A, Fats: N/A, Carbs: N/A)`
        ).join('\n\n')}`
      }
      return 'Your Diet Plan\nBreakfast: N/A (calories: N/A, fats: N/A, carbs: N/A)\nLunch: N/A (calories: N/A, fats: N/A, carbs: N/A)\nDinner: N/A (calories: N/A, fats: N/A, carbs: N/A)\nduration: N/A'
    }

    if (planPeriod === 'week') {
      const lines = rawPlan.split('\n')
      console.log('All lines:', lines)
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

      const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

      const getDayBlockLines = (day) => {
        const dayRegex = new RegExp(`^\\s*${escapeRegExp(day)}\\s*:`, 'i')
        const startIndex = lines.findIndex((line) => dayRegex.test(line))

        if (startIndex === -1) {
          return []
        }

        let endIndex = lines.length
        for (let i = startIndex + 1; i < lines.length; i += 1) {
          const isAnotherDayHeader = days.some((candidateDay) => {
            const candidateRegex = new RegExp(`^\\s*${escapeRegExp(candidateDay)}\\s*:`, 'i')
            return candidateRegex.test(lines[i])
          })

          if (isAnotherDayHeader) {
            endIndex = i
            break
          }
        }

        return lines.slice(startIndex + 1, endIndex)
      }

      const findMealLineInBlock = (blockLines, mealType) =>
        blockLines.find((line) => new RegExp(`^\\s*${mealType}\\s*:`, 'i').test(line))
      
      const weekPlan = days.map((day) => {
        const dayBlockLines = getDayBlockLines(day)
        const breakfastLine = findMealLineInBlock(dayBlockLines, 'breakfast')
        const lunchLine = findMealLineInBlock(dayBlockLines, 'lunch')
        const dinnerLine = findMealLineInBlock(dayBlockLines, 'dinner')
        
        console.log(`${day} - Breakfast:`, breakfastLine)
        console.log(`${day} - Lunch:`, lunchLine)
        console.log(`${day} - Dinner:`, dinnerLine)

        const breakfastNutrition = extractNutritionFromLine(breakfastLine)
        const lunchNutrition = extractNutritionFromLine(lunchLine)
        const dinnerNutrition = extractNutritionFromLine(dinnerLine)

        const extractMealFood = (line) => {
          if (!line) return 'N/A'
          const cleaned = cleanText(line)
          console.log('Meal extraction from:', cleaned)
          
          // Try multiple patterns to extract meal name
          
          // Pattern 1: Remove meal type prefix and extract before parenthesis
          let mealName = cleaned.replace(/^(?:breakfast|lunch|dinner|snack)\s*:\s*/i, '').trim()
          mealName = mealName.split(/\s*\(/i)[0].trim()
          
          if (mealName && mealName.length > 2) {
            console.log('Extracted meal:', mealName)
            return mealName
          }
          
          return 'N/A'
        }

        const breakfastFood = extractMealFood(breakfastLine)
        const lunchFood = extractMealFood(lunchLine)
        const dinnerFood = extractMealFood(dinnerLine)

        return `${day}:\n  Breakfast: ${breakfastFood} (Calories: ${breakfastNutrition.calories}, Fats: ${breakfastNutrition.fats}g, Carbs: ${breakfastNutrition.carbs}g)\n  Lunch: ${lunchFood} (Calories: ${lunchNutrition.calories}, Fats: ${lunchNutrition.fats}g, Carbs: ${lunchNutrition.carbs}g)\n  Dinner: ${dinnerFood} (Calories: ${dinnerNutrition.calories}, Fats: ${dinnerNutrition.fats}g, Carbs: ${dinnerNutrition.carbs}g)`
      }).join('\n\n')

      return `Weekly Diet Plan\n\n${weekPlan}\n\nDuration: 1 Week`
    }

    // Daily plan format
    const lines = rawPlan.split('\n')
    const breakfastLine = lines.find(line => /breakfast/i.test(line))
    const lunchLine = lines.find(line => /lunch/i.test(line))
    const dinnerLine = lines.find(line => /dinner/i.test(line))

    const breakfastNutrition = extractNutritionFromLine(breakfastLine)
    const lunchNutrition = extractNutritionFromLine(lunchLine)
    const dinnerNutrition = extractNutritionFromLine(dinnerLine)

    const extractMealFood = (line) => {
      if (!line) return 'N/A'
      const cleaned = cleanText(line)
      console.log('Daily meal extraction from:', cleaned)
      
      // Try multiple patterns to extract meal name
      
      // Pattern 1: Remove meal type prefix and extract before parenthesis
      let mealName = cleaned.replace(/^(?:breakfast|lunch|dinner|snack)\s*:\s*/i, '').trim()
      mealName = mealName.split(/\s*\(/i)[0].trim()
      
      if (mealName && mealName.length > 2) {
        console.log('Extracted daily meal:', mealName)
        return mealName
      }
      
      return 'N/A'
    }

    const breakfastFood = extractMealFood(breakfastLine)
    const lunchFood = extractMealFood(lunchLine)
    const dinnerFood = extractMealFood(dinnerLine)

    const durationMatch = rawPlan.match(/duration[:\s]+([^\n]+)/i)
    const duration = durationMatch ? cleanText(durationMatch[1]) : '1 Day'

    return [
      'your Diet Plan',
      `Breakfast: ${breakfastFood} (calories: ${breakfastNutrition.calories}, fats: ${breakfastNutrition.fats}, carbs: ${breakfastNutrition.carbs})`,
      `Lunch: ${lunchFood} (calories: ${lunchNutrition.calories}, fats: ${lunchNutrition.fats}, carbs: ${lunchNutrition.carbs})`,
      `Dinner: ${dinnerFood} (calories: ${dinnerNutrition.calories}, fats: ${dinnerNutrition.fats}, carbs: ${dinnerNutrition.carbs})`,
      `duration: ${duration}`
    ].join('\n')
  }

  const handleAddToGoals = async () => {
    try {
      setSavingPlan(true)
      setSaveMessage('')

      const formattedPlan = formatDietPlanTemplate(dietPlanResult, formData.planPeriod)
      
      const updatedProfile = {
        currentDietPlan: {
          plan: formattedPlan,
          rawPlan: dietPlanResult,
          parsedPlan: parseDietPlan(dietPlanResult),
          period: formData.planPeriod,
          createdAt: new Date().toISOString(),
          preferences: {
            dietaryPreference: formData.dietaryPreference,
            weightGoal: formData.weightGoal,
            cuisinePreference: formData.cuisinePreference,
            mealFrequency: formData.mealFrequency,
            mealPrepTime: formData.mealPrepTime
          }
        }
      }
      
      await profileService.updateProfile(user.email, updatedProfile)
      
      // Add diet plan as a goal to database
      const dietGoal = {
        id: Date.now(),
        type: 'nutrition',
        icon: '🥗',
        name: `Diet Plan - ${formData.planPeriod === 'day' ? 'Daily' : formData.planPeriod === 'week' ? 'Weekly' : 'Monthly'}`,
        target: 1,
        unit: 'active',
        actual: 1
      }
      
      // Get existing goals from database
      const goalsResponse = await goalService.getGoals(user.email)
      const currentGoals = goalsResponse.data || goalsResponse || []
      
      // Remove any existing diet plan goals
      const filteredGoals = currentGoals.filter(g => !g.name.startsWith('Diet Plan'))
      
      // Add new diet goal
      const updatedGoals = [...filteredGoals, dietGoal]
      await goalService.saveGoals(user.email, updatedGoals)
      
      setSaveMessage('✓ Diet plan saved to your goals!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Error saving plan:', error)
      setSaveMessage('✗ Failed to save plan. Please try again.')
    } finally {
      setSavingPlan(false)
    }
  }

  const handleGeneratePlan = async () => {
    const weightGoalForPlan = formData.weightGoal || profileWeightGoal

    const planData = {
      ...formData,
      age: userProfile?.age,
      gender: userProfile?.gender,
      height: userProfile?.height,
      weight: userProfile?.weight,
      weightGoal: weightGoalForPlan
    }

    try {
      setPlanError('')
      setDietPlanResult('')
      setIsGenerating(true)

      const response = await dietPlanService.generateDietPlan(planData)
      console.log('API Response:', response)

      if (response?.success && response?.plan) {
        console.log('Plan received:', response.plan)
        const formatted = formatDietPlanTemplate(response.plan, formData.planPeriod)
        console.log('Formatted plan:', formatted)
        setDietPlanResult(response.plan)
      } else if (response?.plan) {
        console.log('Plan received (no success flag):', response.plan)
        const formatted = formatDietPlanTemplate(response.plan, formData.planPeriod)
        console.log('Formatted plan:', formatted)
        setDietPlanResult(response.plan)
      } else {
        setPlanError(response?.message || 'Failed to generate diet plan. Please try again.')
      }
    } catch (error) {
      console.error('API Error:', error)
      setPlanError(error.response?.data?.message || 'Failed to generate diet plan. Please try again.')
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

  const formattedDietPlan = dietPlanResult
    ? formatDietPlanTemplate(dietPlanResult, formData.planPeriod)
    : ''

  return (
    <div className="home-container">
      <Navbar />

      <div className="container">
        <div className="section-card animate">
          <h2 className="diet-planner-title">Diet Plan Generator</h2>

          {/* User Info Display */}
          {userProfile && (userProfile.age || userProfile.gender || userProfile.height || userProfile.weight) && (
            <div className="user-info-display">
              {userProfile.age && (
                <div className="info-box">
                  <span className="info-label">Age:</span>
                  <span className="info-value">{userProfile.age} years</span>
                </div>
              )}
              {userProfile.gender && (
                <div className="info-box">
                  <span className="info-label">Gender:</span>
                  <span className="info-value">{userProfile.gender}</span>
                </div>
              )}
              {userProfile.height && (
                <div className="info-box">
                  <span className="info-label">Height:</span>
                  <span className="info-value">{userProfile.height} cm</span>
                </div>
              )}
              {userProfile.weight && (
                <div className="info-box">
                  <span className="info-label">Weight:</span>
                  <span className="info-value">{userProfile.weight} kg</span>
                </div>
              )}
              {(userProfile.goals?.[0] || userProfile.weightGoal) && (
                <div className="info-box">
                  <span className="info-label">Weight Goal:</span>
                  <span className="info-value">{userProfile.goals?.[0] || userProfile.weightGoal}</span>
                </div>
              )}
            </div>
          )}

          <div className="diet-form-grid">
            <div>
              <div className="form-group">
                <label className="form-label">Dietary Preference</label>
                <select 
                  name="dietaryPreference"
                  value={formData.dietaryPreference}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">Select Dietary Preference</option>
                  <option value="omnivore">Omnivore</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="keto">Keto</option>
                  <option value="paleo">Paleo</option>
                  <option value="gluten-free">Gluten-Free</option>
                  <option value="low-carb">Low-Carb</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Weight Goal</label>
                <select
                  name="weightGoal"
                  value={formData.weightGoal}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {profileWeightGoal && !['weight-loss', 'weight-gain', 'maintenance', 'muscle-building'].includes(profileWeightGoal) && (
                    <option value={profileWeightGoal}>{profileWeightGoal}</option>
                  )}
                  <option value="">Select Weight Goal</option>
                  <option value="weight-loss">Weight Loss</option>
                  <option value="weight-gain">Weight Gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="muscle-building">Muscle Building</option>
                </select>
              </div>
            </div>
            <div>
              <div className="form-group">
                <label className="form-label">Allergies & Restrictions</label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  rows="3" 
                  className="form-textarea"
                  placeholder="e.g., peanuts, shellfish, dairy..."
                />
              </div>
            </div>
          </div>
          <div className="diet-options-group">
            <div className="diet-option-field">
              <div className="form-group">
                <label className="form-label">Meals per Day</label>
                <select 
                  name="mealFrequency"
                  value={formData.mealFrequency}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">Select Meal Frequency</option>
                  <option value="2">2 Meals</option>
                  <option value="3">3 Meals</option>
                  <option value="4">4 Meals</option>
                  <option value="5">5 Meals</option>
                  <option value="6">6 Meals</option>
                </select>
              </div>
            </div>
            <div className="diet-option-field">
              <div className="form-group">
                <label className="form-label">Cuisine Preference</label>
                <select 
                  name="cuisinePreference"
                  value={formData.cuisinePreference}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">Select Cuisine Preference</option>
                  <option value="indian">Indian</option>
                  <option value="italian">Italian</option>
                  <option value="asian">Asian</option>
                  <option value="mediterranean">Mediterranean</option>
                  <option value="mexican">Mexican</option>
                  <option value="mixed">Mixed Cuisine</option>
                </select>
              </div>
            </div>
          </div>
          <div className="meal-prep-group">
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">Available Time for Meal Prep (minutes)</label>
                <input 
                  type="number" 
                  name="mealPrepTime"
                  value={formData.mealPrepTime}
                  onChange={handleInputChange}
                  className="meal-prep-input"
                  placeholder="e.g., 15, 30, 60"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label">Plan Period</label>
                <select
                  name="planPeriod"
                  value={formData.planPeriod}
                  onChange={handleInputChange}
                  className="form-select"
                  style={{ width: '100%' }}
                >
                  <option value="day">1 Day</option>
                  <option value="week">1 Week (7 Days)</option>
                </select>
              </div>
            </div>
          </div>
          <div className="button-container">
            <button 
              type="button" 
              className="ghost-btn"
              onClick={handleGeneratePlan}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Diet Plan'}
            </button>
          </div>

          {planError && (
            <div className="diet-plan-error">
              {planError}
            </div>
          )}

          {dietPlanResult && (
            <div className="diet-plan-result section-card animate">
              <h3 className="diet-plan-result-title">your Diet Plan</h3>
              {formattedDietPlan ? (
                <pre className="diet-plan-result-text">{formattedDietPlan}</pre>
              ) : (
                <pre className="diet-plan-result-text">{dietPlanResult}</pre>
              )}
              
              {(formData.planPeriod === 'day' || formData.planPeriod === 'week') && (
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DietPlanner
