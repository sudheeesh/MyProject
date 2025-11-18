import { configureStore, combineReducers } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistReducer, persistStore } from "redux-persist";

import adminReducer from "./slices/adminSlice";
import chatReducer from "./slices/chatSlice";

import { setHttpAuth } from "../services/http";   // ✅ ADD THIS LINE

const persistConfig = {
  key: "CASP_MOBILE",
  storage: AsyncStorage,
  whitelist: ["admin"],
};

const rootReducer = combineReducers({
  admin: adminReducer,
  chat: chatReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

// ===============================
// ✅ Inject token into http.js
// ===============================
store.subscribe(() => {
  const state = store.getState();
  const token = state?.admin?.token;
  const resource = state?.admin?.resource;

  setHttpAuth(token, resource);
});

export default store;
