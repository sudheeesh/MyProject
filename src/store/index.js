import { configureStore, combineReducers } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistReducer, persistStore } from "redux-persist";

// Your existing slices
import adminReducer from "./slices/adminSlice";
import chatReducer from "./slices/chatSlice";

// ⭐ NEW: Import the searchSlice you created
import searchReducer from "./slices/searchSlice";

import { setHttpAuth } from "../services/http";

const persistConfig = {
  key: "CASP_MOBILE",
  storage: AsyncStorage,
  whitelist: ["admin"],   // Do NOT persist search slice
};

const rootReducer = combineReducers({
  admin: adminReducer,
  chat: chatReducer,
  search: searchReducer,   // ⭐ ADD THIS LINE
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
// Inject token + resource into axios/http
// ===============================
store.subscribe(() => {
  const state = store.getState();
  const token = state?.admin?.token;
  const resource = state?.admin?.resource;

  setHttpAuth(token, resource);
});

export default store;
