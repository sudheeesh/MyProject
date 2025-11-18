import http from "./http";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const sendQuery = async (resource, query) => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      throw new Error("No authentication token found. Please log in again.");
    }

    const { data } = await http.post(
      `/test/${resource}/qna_query`,
      { query },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return data;
  } catch (error) {
    console.error("Error in sendQuery:", error);
    throw error;
  }
};
