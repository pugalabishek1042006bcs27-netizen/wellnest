import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { profileService, dietPlanService, workoutPlanService } from '../services/api'
import Navbar from './Navbar'
import './Home.css'
import './TrackerPages.css'

const CurrentPlans = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user?.email) {
          const response = await profileService.getProfile(user.email)
          const profileData = response.data || response
          setProfile(profileData)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user])

  const handleDeleteDietPlan = async () => {
    if (!window.confirm('Are you sure you want to delete your diet plan? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting('diet')
      setError(null)
      await dietPlanService.deleteDietPlan(user.email)
      
      // Update profile state to reflect deletion
      setProfile(prev => ({
        ...prev,
        currentDietPlan: null
      }))
    } catch (err) {
      console.error('Error deleting diet plan:', err)
      setError('Failed to delete diet plan. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleDeleteWorkoutPlan = async () => {
    if (!window.confirm('Are you sure you want to delete your workout plan? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting('workout')
      setError(null)
      await workoutPlanService.deleteWorkoutPlan(user.email)
      
      // Update profile state to reflect deletion
      setProfile(prev => ({
        ...prev,
        currentWorkoutPlan: null
      }))
    } catch (err) {
      console.error('Error deleting workout plan:', err)
      setError('Failed to delete workout plan. Please try again.')
    } finally {
      setDeleting(null)
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

  const hasDietPlan = profile?.currentDietPlan
  const hasWorkoutPlan = profile?.currentWorkoutPlan

  return (
    <div className="home-container">
      <Navbar />

      <div className="container">
        <div className="section-card animate">
          <h1 style={{ marginBottom: '2rem', textAlign: 'center', fontSize: '32px', fontWeight: '600' }}>
            Your Current Plans
          </h1>

          {error && (
            <div style={{
              padding: '1rem',
              marginBottom: '1rem',
              backgroundColor: '#fee2e2',
              borderRadius: '8px',
              border: '1px solid #fca5a5',
              color: '#dc2626'
            }}>
              {error}
            </div>
          )}

          {!hasDietPlan && !hasWorkoutPlan ? (
            <div style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              backgroundColor: 'rgba(14, 165, 166, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(14, 165, 166, 0.2)'
            }}>
              <p style={{ fontSize: '18px', color: '#334155', marginBottom: '1rem' }}>
                No plans saved yet
              </p>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                Generate a diet or workout plan to see your saved plans here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '2rem' }}>
              {hasDietPlan && (
                <div className="section-card animate" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{
                      margin: 0,
                      fontSize: '24px',
                      fontWeight: '600',
                      color: '#0a3d3d'
                    }}>
                      📋 Diet Plan
                    </h2>
                    <button
                      onClick={handleDeleteDietPlan}
                      disabled={deleting === 'diet'}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: deleting === 'diet' ? 'not-allowed' : 'pointer',
                        opacity: deleting === 'diet' ? 0.6 : 1,
                        transition: 'background-color 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (deleting !== 'diet') {
                          e.target.style.backgroundColor = '#b91c1c'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#dc2626'
                      }}
                    >
                      {deleting === 'diet' ? 'Deleting...' : 'Delete Plan'}
                    </button>
                  </div>
                  <div style={{
                    padding: '1.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '12px',
                    border: '1px solid rgba(14, 165, 166, 0.2)',
                    marginBottom: '1.5rem'
                  }}>
                    <pre style={{
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '14px',
                      lineHeight: '1.8',
                      color: '#1e293b'
                    }}>
                      {profile.currentDietPlan.plan || profile.currentDietPlan.rawPlan}
                    </pre>
                  </div>

                  <div style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(14, 165, 166, 0.08)',
                    borderRadius: '8px',
                    borderLeft: '4px solid #0ea5a6',
                    marginTop: '1rem'
                  }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '14px', fontWeight: '600', color: '#0a3d3d' }}>
                      Plan Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '13px' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Period:</span>
                        <span style={{ marginLeft: '0.5rem', fontWeight: '600', color: '#0a3d3d' }}>
                          {profile.currentDietPlan.period === 'day' ? 'Daily' : 
                           profile.currentDietPlan.period === 'week' ? 'Weekly' : 'Monthly'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Dietary Preference:</span>
                        <span style={{ marginLeft: '0.5rem', fontWeight: '600', color: '#0a3d3d' }}>
                          {profile.currentDietPlan.preferences?.dietaryPreference || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Cuisine:</span>
                        <span style={{ marginLeft: '0.5rem', fontWeight: '600', color: '#0a3d3d' }}>
                          {profile.currentDietPlan.preferences?.cuisinePreference || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Created:</span>
                        <span style={{ marginLeft: '0.5rem', fontWeight: '600', color: '#0a3d3d' }}>
                          {new Date(profile.currentDietPlan.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {hasWorkoutPlan && (
                <div className="section-card animate" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{
                      margin: 0,
                      fontSize: '24px',
                      fontWeight: '600',
                      color: '#0a3d3d'
                    }}>
                      💪 Workout Plan
                    </h2>
                    <button
                      onClick={handleDeleteWorkoutPlan}
                      disabled={deleting === 'workout'}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: deleting === 'workout' ? 'not-allowed' : 'pointer',
                        opacity: deleting === 'workout' ? 0.6 : 1,
                        transition: 'background-color 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (deleting !== 'workout') {
                          e.target.style.backgroundColor = '#b91c1c'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#dc2626'
                      }}
                    >
                      {deleting === 'workout' ? 'Deleting...' : 'Delete Plan'}
                    </button>
                  </div>
                  <div style={{
                    padding: '1.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '12px',
                    border: '1px solid rgba(14, 165, 166, 0.2)',
                    marginBottom: '1.5rem'
                  }}>
                    <pre style={{
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '14px',
                      lineHeight: '1.8',
                      color: '#1e293b'
                    }}>
                      {profile.currentWorkoutPlan.plan || profile.currentWorkoutPlan.rawPlan}
                    </pre>
                  </div>

                  <div style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(14, 165, 166, 0.08)',
                    borderRadius: '8px',
                    borderLeft: '4px solid #0ea5a6',
                    marginTop: '1rem'
                  }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '14px', fontWeight: '600', color: '#0a3d3d' }}>
                      Plan Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '13px' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Period:</span>
                        <span style={{ marginLeft: '0.5rem', fontWeight: '600', color: '#0a3d3d' }}>
                          {profile.currentWorkoutPlan.period === 'day' ? 'Daily' : 
                           profile.currentWorkoutPlan.period === 'week' ? 'Weekly' : 'Monthly'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Fitness Level:</span>
                        <span style={{ marginLeft: '0.5rem', fontWeight: '600', color: '#0a3d3d' }}>
                          {profile.currentWorkoutPlan.preferences?.fitnessLevel || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Focus Area:</span>
                        <span style={{ marginLeft: '0.5rem', fontWeight: '600', color: '#0a3d3d' }}>
                          {profile.currentWorkoutPlan.preferences?.focusArea || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Created:</span>
                        <span style={{ marginLeft: '0.5rem', fontWeight: '600', color: '#0a3d3d' }}>
                          {new Date(profile.currentWorkoutPlan.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CurrentPlans
