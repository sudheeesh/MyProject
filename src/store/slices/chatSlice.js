import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import http from "../../services/http";

export const fetchChatConfigs = createAsyncThunk(
  "chat/fetchChatConfigs",
  async (resource, { rejectWithValue }) => {
    try {
      const { data } = await http.get(`/test/${resource}/chatconfigs`);
      return data;
    } catch (error) {
      console.error("Chat config fetch failed:", error.message);
      return rejectWithValue(error.response?.data || "Failed to load chat configs");
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    configs: [],
    selectedBot: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedBot: (state, action) => {
      state.selectedBot = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatConfigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatConfigs.fulfilled, (state, action) => {
        state.loading = false;
        state.configs = action.payload;
        state.selectedBot = action.payload?.[0]?.id || null;
      })
      .addCase(fetchChatConfigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedBot } = chatSlice.actions;
export default chatSlice.reducer;
