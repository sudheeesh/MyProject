import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const email = await AsyncStorage.getItem("email");
        const resource = await AsyncStorage.getItem("resource");
        if (token && email) {
          setUser({ token, email, resource });
        }
      } catch (err) {
        console.log("Failed to restore session:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (data) => {
    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("email", data.email);
    await AsyncStorage.setItem("resource", data.resource);
    setUser(data);
  };
  
  const logout = async () => {
    await AsyncStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
