import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './components/Login'
import Signup from './components/Signup'
import Home from './components/Home'
import ProtectedRoute from './components/ProtectedRoute'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import UserProfile from './components/UserProfile'
import GuestProfileSetup from './components/GuestProfileSetup'
import Profile from './components/Profile'
import VerifyEmail from './components/VerifyEmail'
import WaterIntake from './components/WaterIntake'
import SleepLogs from './components/SleepLogs'
import WorkoutTracker from './components/WorkoutTracker'
import MealTracker from './components/MealTracker'
import AddWorkoutLog from './components/AddWorkoutLog'
import AddWaterLog from './components/AddWaterLog'
import AddSleepLog from './components/AddSleepLog'
import AddMealLog from './components/AddMealLog'
import CombinedGraph from './components/CombinedGraph'
import WorkoutPlanner from './components/WorkoutPlanner'
import DietPlanner from './components/DietPlanner'
import CurrentPlans from './components/CurrentPlans'
import HealthChat from './components/HealthChat'
import Settings from './components/Settings'
import Friends from './components/Friends'
import Blog from './components/Blog'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/guest-profile-setup" element={<GuestProfileSetup />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/water-intake" element={
            <ProtectedRoute>
              <WaterIntake />
            </ProtectedRoute>
          } />
          <Route path="/sleep-logs" element={
            <ProtectedRoute>
              <SleepLogs />
            </ProtectedRoute>
          } />
          <Route path="/workout-tracker" element={
            <ProtectedRoute>
              <WorkoutTracker />
            </ProtectedRoute>
          } />
          <Route path="/meal-tracker" element={
            <ProtectedRoute>
              <MealTracker />
            </ProtectedRoute>
          } />
          <Route path="/add-workout" element={
            <ProtectedRoute>
              <AddWorkoutLog />
            </ProtectedRoute>
          } />
          <Route path="/add-water" element={
            <ProtectedRoute>
              <AddWaterLog />
            </ProtectedRoute>
          } />
          <Route path="/add-sleep" element={
            <ProtectedRoute>
              <AddSleepLog />
            </ProtectedRoute>
          } />
          <Route path="/add-meal" element={
            <ProtectedRoute>
              <AddMealLog />
            </ProtectedRoute>
          } />
          <Route path="/combined-graph" element={
            <ProtectedRoute>
              <CombinedGraph />
            </ProtectedRoute>
          } />
          <Route path="/workout-planner" element={
            <ProtectedRoute>
              <WorkoutPlanner />
            </ProtectedRoute>
          } />
          <Route path="/diet-planner" element={
            <ProtectedRoute>
              <DietPlanner />
            </ProtectedRoute>
          } />
          <Route path="/current-plans" element={
            <ProtectedRoute>
              <CurrentPlans />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <HealthChat />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/friends" element={
            <ProtectedRoute>
              <Friends />
            </ProtectedRoute>
          } />
          <Route path="/blog" element={
            <ProtectedRoute>
              <Blog />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App