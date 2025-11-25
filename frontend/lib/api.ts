import axios from "axios";
import { useAppStore } from "./store";

// Backend base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Added JWT from zustand store on each request
api.interceptors.request.use((config) => {
  const token = useAppStore.getState().user?.token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
