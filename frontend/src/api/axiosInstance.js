import axios from 'axios'
import { getToken, getRefreshToken, clearAuthTokens } from '../utils/auth'

const BASE_URL = import.meta.env.VITE_API_URL

const axiosInstance = axios.create({
  baseURL: BASE_URL,
})

// Attach access token to every request
axiosInstance.interceptors.request.use(config => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401: try to refresh once, then retry the original request
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config

    // Only handle 401s, and only attempt one refresh per request
    if (error.response?.status !== 401 || original._retried) {
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
      // Use plain axios (not axiosInstance) to avoid triggering this interceptor again
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
