import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Linking,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../store/slices/adminSlice";
import http from "../services/http";
import InAppBrowser from "react-native-inappbrowser-reborn";
import * as QueryString from "query-string";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.admin);

  const [resources, setResources] = useState([]);
  const [resource, setResource] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingMicrosoft, setLoadingMicrosoft] = useState(false);
  const [loadingSlack, setLoadingSlack] = useState(false);

  // ⭐ FINAL WORKING REDIRECT URI
  const redirectUri = "caspai://oauth";



  // ⭐ HANDLE DEEP LINK AFTER OAUTH LOGIN
  useEffect(() => {
    const processDeepLink = async (url) => {
      if (!url) return;

      console.log("DEEP LINK URL:", url);

      if (!url.startsWith(redirectUri)) {
        console.log("URL does not match redirectUri, ignoring");
        return;
      }

      try {
        if (InAppBrowser.close) await InAppBrowser.close();

        const parsed = QueryString.parseUrl(url);
        const uid_hash = parsed.query.uid_hash;

        console.log("UID HASH:", uid_hash);

        if (!uid_hash) {
          Toast.show({ type: "error", text1: "Invalid redirect link" });
          return;
        }

        const res = await http.post(
          "https://whitecel.com/test/hash/users_cloud/token",
          { username: uid_hash, resource: "hash" }
        );

        console.log("TOKEN RESPONSE:", res.data);

        if (res.data?.access_token) {
          dispatch(
            setCredentials({
              token: res.data.access_token,
              resource: res.data.resource || "hash",
            })
          );

          Toast.show({ type: "success", text1: "Login successful" });
        } else {
          Toast.show({ type: "error", text1: "No token received" });
        }
      } catch (err) {
        Toast.show({
          type: "error",
          text1: "OAuth login failed",
          text2: err.message,
        });
      }
    };

    const sub = Linking.addEventListener("url", (event) =>
      processDeepLink(event.url)
    );

    Linking.getInitialURL().then((url) => {
      if (url) processDeepLink(url);
    });

    return () => sub.remove();
  }, []);

  // Load resources for manual login
  useEffect(() => {
    (async () => {
      try {
        const res = await http.get("/test/resources");
        setResources(res.data || []);
      } catch (err) {
        Toast.show({ type: "error", text1: "Failed to load resources" });
      }
    })();
  }, []);

  const generateHash = () => uuidv4().replace(/-/g, "").slice(0, 16);

  // Manual login
  const handleLogin = async () => {
    if (!resource || !username || !password) {
      Toast.show({ type: "error", text1: "Fill all fields" });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", username.trim());
      formData.append("password", btoa(password.trim()));

      const { data } = await http.post(
        `/test/${resource}/users/token`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data?.access_token) {
        dispatch(setCredentials({ token: data.access_token, resource }));
        Toast.show({ type: "success", text1: "Login successful" });
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Invalid credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  // OAuth login
  const openOAuth = async (provider) => {
    const hash = generateHash();

    const providerMap = {
      google: {
        setLoader: setLoadingGoogle,
        loader: loadingGoogle,
        url: `https://whitecel.com/test/gmail/auth/login?uid_hash=${hash}&redirect_uri=${redirectUri}`,
      },
      microsoft: {
        setLoader: setLoadingMicrosoft,
        loader: loadingMicrosoft,
        url: `https://whitecel.com/test/outlook/auth/login?uid_hash=${hash}&redirect_uri=${redirectUri}`,
      },
      slack: {
        setLoader: setLoadingSlack,
        loader: loadingSlack,
        url: `https://whitecel.com/test/slack/auth/login?uid_hash=${hash}&redirect_uri=${redirectUri}`,
      },
    };

    const { setLoader, loader, url } = providerMap[provider];
    if (loader) return;

    setLoader(true);
    try {
      const available = await InAppBrowser.isAvailable();

      if (!available) {
        Linking.openURL(url);
        return;
      }

      await InAppBrowser.open(url, {
        showTitle: false,
        toolbarColor: "#000",
      });
    } catch (err) {
      Toast.show({ type: "error", text1: "OAuth failed" });
    } finally {
      setLoader(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>CASP</Text>
      <Text style={styles.title}>Admin Login</Text>
      <Text style={styles.subtitle}>Welcome back</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={resource}
          onValueChange={setResource}
          dropdownIconColor="#aaa"
          style={styles.picker}
        >
          <Picker.Item label="Select Resource" value="" />
          {resources.map((rs) => (
            <Picker.Item key={rs} label={rs} value={rs} />
          ))}
        </Picker>
      </View>

      <TextInput
        placeholder="Username"
        placeholderTextColor="#777"
        style={styles.input}
        onChangeText={setUsername}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#777"
        style={styles.input}
        secureTextEntry
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleLogin}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <View style={styles.oauthRow}>
        <TouchableOpacity
          style={styles.oauthButton}
          onPress={() => openOAuth("google")}
        >
          {loadingGoogle ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#fff" />
              <Text style={styles.oauthText}>Google</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.oauthButton}
          onPress={() => openOAuth("microsoft")}
        >
          {loadingMicrosoft ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="microsoft" size={22} color="#fff" />
              <Text style={styles.oauthText}>Microsoft</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.oauthButton}
          onPress={() => openOAuth("slack")}
        >
          {loadingSlack ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="slack" size={22} color="#fff" />
              <Text style={styles.oauthText}>Slack</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    padding: 32,
  },
  logo: {
    color: "#3b82f6",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#bbb",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 32,
  },
  pickerContainer: {
    backgroundColor: "#111",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 16,
  },
  picker: { color: "#fff" },
  input: {
    backgroundColor: "#111",
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  oauthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  oauthButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  oauthText: {
    color: "#fff",
    marginLeft: 8,
  },
});
