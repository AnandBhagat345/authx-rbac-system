import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      
      const refresh = localStorage.getItem("refresh")
      if (!refresh) {
         localStorage.clear() 
         window.location.href = "/login" 
         return Promise.reject(error)
         }

      try {
        const res = await axios.post(
          import.meta.env.VITE_API_URL + "auth/token/refresh/",
          { refresh }
        );

        localStorage.setItem("access", res.data.access);

        if (res.data.refresh) {
          localStorage.setItem("refresh", res.data.refresh);
        }

        originalRequest.headers.Authorization =
          "Bearer " + res.data.access;

        return api(originalRequest);

      } catch (err) {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
