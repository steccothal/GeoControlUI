import axios from "axios";
import { SERVER_BASE_URL } from "@config";
import qs from "qs";

const axiosInstance = axios.create({
  baseURL: SERVER_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  },
  paramsSerializer: (params) => qs.stringify(params, { encode: true })
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
