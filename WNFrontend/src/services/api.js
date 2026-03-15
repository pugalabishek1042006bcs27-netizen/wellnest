import axios from 'axios'

const API_URL = 'http://localhost:8080/api/auth'
const PROFILE_API_URL = 'http://localhost:8080/api/profile'
const WATER_API_URL = 'http://localhost:8080/api/water-intake'
const WORKOUT_API_URL = 'http://localhost:8080/api/workouts'
const SLEEP_API_URL = 'http://localhost:8080/api/sleep'
const MEAL_API_URL = 'http://localhost:8080/api/meals'
const HEALTH_TIP_API_URL = 'http://localhost:8080/api/health-tips'
const DIET_PLAN_API_URL = 'http://localhost:8080/api/diet-plan'
const WORKOUT_PLAN_API_URL = 'http://localhost:8080/api/workout-plan'
const GOALS_API_URL = 'http://localhost:8080/api/goals'
const HEALTH_CHAT_API_URL = 'http://localhost:8080/api/health-chat'
const FRIENDS_API_URL = 'http://localhost:8080/api/friends'
const BLOG_API_URL = 'http://localhost:8080/api/blog'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const profileApi = axios.create({
  baseURL: PROFILE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const waterApi = axios.create({
  baseURL: WATER_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const workoutApi = axios.create({
  baseURL: WORKOUT_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const sleepApi = axios.create({
  baseURL: SLEEP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const mealApi = axios.create({
  baseURL: MEAL_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const healthTipApi = axios.create({
  baseURL: HEALTH_TIP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const dietPlanApi = axios.create({
  baseURL: DIET_PLAN_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const workoutPlanApi = axios.create({
  baseURL: WORKOUT_PLAN_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const goalsApi = axios.create({
  baseURL: GOALS_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const healthChatApi = axios.create({
  baseURL: HEALTH_CHAT_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const friendsApi = axios.create({
  baseURL: FRIENDS_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const blogApi = axios.create({
  baseURL: BLOG_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/login', { username, password })
    return response.data
  },

  signup: async (fullName, username, email, password, phoneNumber, gender) => {
    const response = await api.post('/signup', { fullName, username, email, password, phoneNumber, gender })
    return response.data
  },

  verifyEmail: async (email, code) => {
    const response = await api.post('/verify-email', null, { params: { email, code } })
    return response.data
  },

  sendVerificationEmail: async (email) => {
    const response = await api.post('/send-verification', null, { params: { email } })
    return response.data
  },

  forgotPassword: async (email) => {
    const response = await api.post('/forgot-password', null, { params: { email } })
    return response.data
  },

  resetPassword: async (email, code, newPassword) => {
    const response = await api.post('/reset-password', null, { params: { email, code, newPassword } })
    return response.data
  },

  deleteAccount: async (email) => {
    const response = await api.delete('/delete-account', { params: { email } })
    return response.data
  }
}

export const profileService = {
  updateProfile: async (email, profileData) => {
    const response = await profileApi.post('/update', profileData, { params: { email } })
    return response.data
  },

  getProfile: async (email) => {
    const response = await profileApi.get('/get', { params: { email } })
    return response.data
  },

  resetAccount: async (email) => {
    const response = await profileApi.post('/reset', null, { params: { email } })
    return response.data
  }
}

export const waterService = {
  logWaterIntake: async (payload) => {
    const response = await waterApi.post('/log', payload)
    return response.data
  },
  getWaterIntake: async (email) => {
    const response = await waterApi.get('/logs', { params: { email } })
    return response.data
  },
  deleteWaterIntake: async (email, id) => {
    const response = await waterApi.delete(`/logs/${id}`, { params: { email } })
    return response.data
  }
}

export const workoutService = {
  logWorkout: async (payload) => {
    const response = await workoutApi.post('/log', payload)
    return response.data
  },
  getWorkouts: async (email) => {
    const response = await workoutApi.get('/logs', { params: { email } })
    return response.data
  },
  deleteWorkout: async (email, id) => {
    const response = await workoutApi.delete(`/logs/${id}`, { params: { email } })
    return response.data
  }
}

export const sleepService = {
  logSleep: async (payload) => {
    const response = await sleepApi.post('/log', payload)
    return response.data
  },
  getSleepLogs: async (email) => {
    const response = await sleepApi.get('/logs', { params: { email } })
    return response.data
  },
  deleteSleepLog: async (email, id) => {
    const response = await sleepApi.delete(`/logs/${id}`, { params: { email } })
    return response.data
  }
}

export const mealService = {
  logMeal: async (payload) => {
    const response = await mealApi.post('/log', payload)
    return response.data
  },
  estimateMealNutrition: async (payload) => {
    const response = await mealApi.post('/estimate', payload)
    return response.data
  },
  getMeals: async (email) => {
    const response = await mealApi.get('/logs', { params: { email } })
    return response.data
  },
  deleteMeal: async (email, id) => {
    const response = await mealApi.delete(`/logs/${id}`, { params: { email } })
    return response.data
  }
}

export const healthTipService = {
  getRandomHealthTip: async (category = 'general') => {
    const response = await healthTipApi.get('/random', { params: { category } })
    return response.data
  },
  getHomeHealthTip: async (category = 'general') => {
    const response = await healthTipApi.get('/home', { params: { category } })
    return response.data
  }
}

export const workoutPlanService = {
  generateWorkoutPlan: async (payload) => {
    const response = await workoutPlanApi.post('/generate', payload)
    return response.data
  },
  deleteWorkoutPlan: async (email) => {
    const response = await workoutPlanApi.delete('/delete', { params: { email } })
    return response.data
  }
}

export const dietPlanService = {
  generateDietPlan: async (payload) => {
    const response = await dietPlanApi.post('/generate', payload)
    return response.data
  },
  deleteDietPlan: async (email) => {
    const response = await dietPlanApi.delete('/delete', { params: { email } })
    return response.data
  }
}

export const goalService = {
  saveGoals: async (email, goals) => {
    const response = await goalsApi.post('/save', goals, { params: { email } })
    return response.data
  },
  getGoals: async (email) => {
    const response = await goalsApi.get('/get', { params: { email } })
    return response.data
  }
}

export const healthChatService = {
  sendMessage: async (email, message) => {
    const response = await healthChatApi.post('/message', { email, message })
    return response.data
  }
}

export const friendService = {
  searchUsers: async (email, searchQuery) => {
    const response = await friendsApi.get('/search', { 
      params: { email, query: searchQuery } 
    })
    return response.data
  },

  sendFriendRequest: async (email, friendEmail) => {
    const response = await friendsApi.post('/request', null, { 
      params: { email, friendEmail } 
    })
    return response.data
  },

  acceptFriendRequest: async (email, friendEmail) => {
    const response = await friendsApi.post('/accept', null, { 
      params: { email, friendEmail } 
    })
    return response.data
  },

  rejectFriendRequest: async (email, friendEmail) => {
    const response = await friendsApi.post('/reject', null, { 
      params: { email, friendEmail } 
    })
    return response.data
  },

  removeFriend: async (email, friendEmail) => {
    const response = await friendsApi.delete('/remove', { 
      params: { email, friendEmail } 
    })
    return response.data
  },

  getFriends: async (email) => {
    const response = await friendsApi.get('/list', { 
      params: { email } 
    })
    return response.data
  },

  getFriendRequests: async (email) => {
    const response = await friendsApi.get('/requests', { 
      params: { email } 
    })
    return response.data
  },

  getSentRequests: async (email) => {
    const response = await friendsApi.get('/sent', { 
      params: { email } 
    })
    return response.data
  }
}

export const blogService = {
  createPost: async (post) => {
    const response = await blogApi.post('/posts', post)
    return response.data
  },

  getPosts: async (userEmail) => {
    const response = await blogApi.get('/posts', { 
      params: { userEmail } 
    })
    return response.data
  },

  getPostsByUser: async (userEmail) => {
    const response = await blogApi.get(`/posts/user/${userEmail}`)
    return response.data
  },

  getPostById: async (id) => {
    const response = await blogApi.get(`/posts/${id}`)
    return response.data
  },

  toggleLike: async (postId, userEmail) => {
    const response = await blogApi.post(`/posts/${postId}/like`, { userEmail })
    return response.data
  },

  addComment: async (postId, comment) => {
    const response = await blogApi.post(`/posts/${postId}/comment`, comment)
    return response.data
  },

  deletePost: async (postId, userEmail) => {
    const response = await blogApi.delete(`/posts/${postId}`, { 
      params: { userEmail } 
    })
    return response.data
  }
}

export default api