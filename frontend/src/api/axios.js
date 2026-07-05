import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      const isLoginRequest =
        originalRequest.url &&
        (originalRequest.url.includes("token/") ||
          originalRequest.url.includes("register/"));

      if (isLoginRequest) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(Promise.reject);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const res = await axios.post(
            `${API_BASE_URL}/token/refresh/`,
            {
              refresh: refreshToken,
            }
          );

          const { access } = res.data;

          localStorage.setItem("accessToken", access);

          api.defaults.headers.common.Authorization = `Bearer ${access}`;
          originalRequest.headers.Authorization = `Bearer ${access}`;

          processQueue(null, access);

          isRefreshing = false;

          return api(originalRequest);
        } catch (err) {
          processQueue(err, null);
          isRefreshing = false;

          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");

          window.location.href = "/login";

          return Promise.reject(err);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;