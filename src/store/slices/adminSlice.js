import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const initialState = {
  token: null,
  email: null,
  resource: "csp-test",
  isAuthenticated: false,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, email, resource } = action.payload;
      state.token = token;
      state.email = email;
      state.resource = resource;
      state.isAuthenticated = true;

      AsyncStorage.setItem("token", token);
      AsyncStorage.setItem("email", email);
      AsyncStorage.setItem("resource", resource);
    },

    logout: (state) => {
      state.token = null;
      state.email = null;
      state.resource = "csp-test";
      state.isAuthenticated = false;
      AsyncStorage.multiRemove(["token", "email", "resource"]);
    },
  },
});

export const { setCredentials, logout } = adminSlice.actions;
export default adminSlice.reducer;
