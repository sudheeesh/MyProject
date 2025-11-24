// src/services/api.js
import axios from "axios";

const BASE_URL = "https://whitecel.com";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// AUTH TOKEN
export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
};

// X-RESOURCE
export const setXResource = (resource) => {
  if (resource) api.defaults.headers.common["X-Resource"] = resource;
  else delete api.defaults.headers.common["X-Resource"];
};

// ------------ CONFIGS ------------
export const getIntegrations = (resource) =>
  api.get(`/test/${resource}/integrations`);

export const getDriveConfigs = (resource) =>
  api.get(`/test/${resource}/driveconfigs`);

export const getQnaConfigs = (resource) =>
  api.get(`/test/${resource}/qnaconfigs`);

export const getBotConfigs = (resource) =>
  api.get(`/test/${resource}/botconfigs`);

// ------------ QNA ------------
export const qnaQuery = (resource, payload) =>
  api.post(`/test/${resource}/qna_query`, payload);

export const qnaQueryOld = (resource, payload) =>
  api.post(`/test/${resource}/qna_query_old`, payload);

// ------------ FIXED CHAT SESSION (MATCHING WEB) ------------
export const getChatSession = (resource, sessionId, confNames = []) => {
  const query = confNames.length
    ? `?conf_names=${encodeURIComponent(confNames.join(","))}`
    : "";

  return api.get(
    `/test/${resource}/chatconfigs/session/${sessionId}${query}`
  );
};

// ------------ FOLLOW-UP STREAM ------------
export const streamChat = (resource, sessionId, payload) =>
  api.post(`/test/${resource}/chatconfigs/stream/${sessionId}`, payload);

// ------------ OTHER ------------
export const getSessionById = (resource, sessionId, confQuery) =>
  api.get(
    `/test/${resource}/chatconfigs/session/${sessionId}${
      confQuery ? `?${confQuery}` : ""
    }`
  );

export const fetchEmails = (query) =>
  api.get(`/test/${query}/fetch_emails`);

export default api;
