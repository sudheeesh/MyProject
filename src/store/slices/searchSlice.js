// src/store/searchSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  resource: null,
  confNames: [],
  selectedModel: "Gemini-2.0",
  searchData: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setResource(state, action) {
      state.resource = action.payload;
    },
    setConfNames(state, action) {
      state.confNames = action.payload;
    },
    setSelectedModel(state, action) {
      state.selectedModel = action.payload;
    },
    setSearchData(state, action) {
      state.searchData = action.payload;
    },

    // ⭐ THE REAL RESET ⭐
    resetSearch(state) {
      state.confNames = [];
      state.searchData = null;
      state.selectedModel = "Gemini-2.0";   // important
      // DO NOT reset resource here (resource = workspace)
    },
  },
});

export const {
  setResource,
  setConfNames,
  setSelectedModel,
  setSearchData,
  resetSearch,
} = searchSlice.actions;

export default searchSlice.reducer;

// selectors
export const selectResource = (state) => state.search.resource;
export const selectConfNames = (state) => state.search.confNames;
export const selectSelectedModel = (state) => state.search.selectedModel;
export const selectSearchData = (state) => state.search.searchData;
