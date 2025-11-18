import axios from "axios";
import Toast from "react-native-toast-message";

export const API_URL = "https://whitecel.com";

let authToken = null;
let resourceHeader = "csp-test";

export function setHttpAuth(token, resource) {
  authToken = token;
  if (resource) resourceHeader = resource;
}

const http = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    config.headers["X-Resource"] = resourceHeader;
    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err?.response?.status === 401) {
      Toast.show({
        type: "error",
        text1: "Session expired",
        text2: "Please log in again",
      });
    }
    return Promise.reject(err);
  }
);

export default http;
