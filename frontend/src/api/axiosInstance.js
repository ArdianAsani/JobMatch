import axios from 'axios'
import { getToken, getRefreshToken, clearAuthTokens } from '../utils/auth'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'


const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor
axiosInstance.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor (mbaje siç e ke)
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config

    // Auth endpoints return 401 as a business error (wrong credentials, expired
    // refresh token). Never attempt token-refresh on those — it would loop or
    // trigger an unwanted page reload on the login screen.
    const isAuthEndpoint = original.url?.includes('/auth/')

    if (error.response?.status !== 401 || original._retried || isAuthEndpoint) {
      return Promise.reject(error)
    }

    original._retried = true
    const refreshToken = getRefreshToken()

    if (!refreshToken) {
      clearAuthTokens()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    try {
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      })
      localStorage.setItem('access_token', data.access_token)
      original.headers.Authorization = `Bearer ${data.access_token}`
      return axiosInstance(original)
    } catch {
      clearAuthTokens()
      window.location.href = '/login'
      return Promise.reject(error)
    }
  }
)

export default axiosInstance