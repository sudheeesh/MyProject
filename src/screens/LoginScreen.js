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
import Icon from "react-native-vector-icons/FontAwesome";
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

  const redirectUri = "casp://redirect"; // must match AndroidManifest scheme

  // ✅ Automatically navigate after successful login
  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace("Main");
    }
  }, [isAuthenticated]);

  // ✅ Handle deep link from OAuth redirect
  useEffect(() => {
    const handleDeepLink = async (event) => {
      const url = event.url;
      if (url && url.startsWith(redirectUri)) {
        try {
          if (InAppBrowser.close) await InAppBrowser.close();

          const parsed = QueryString.parseUrl(url);
          const returnedHash = parsed.query.uid_hash;
          if (!returnedHash) {
            Toast.show({ type: "error", text1: "Invalid redirect link" });
            return;
          }

          const res = await http.post(
            "https://whitecel.com/test/hash/users_cloud/token",
            { username: returnedHash, resource: "hash" }
          );

          if (res.data?.access_token) {
            dispatch(
              setCredentials({
                token: res.data.access_token,
                resource: res.data.resource || "hash",
              })
            );
            Toast.show({ type: "success", text1: "Login with Gmail successful" });
          } else {
            Toast.show({ type: "error", text1: "Login failed", text2: "No token received" });
          }
        } catch (err) {
          console.error("Token exchange error:", err);
          Toast.show({
            type: "error",
            text1: "Token exchange failed",
            text2: err.message,
          });
        }
      }
    };

    const sub = Linking.addEventListener("url", handleDeepLink);
    return () => sub.remove();
  }, []);

  // ✅ Fetch resources
  useEffect(() => {
    (async () => {
      try {
        const res = await http.get("/test/resources");
        setResources(res.data || []);
      } catch (err) {
        console.error("Failed to fetch resources:", err);
        Toast.show({ type: "error", text1: "Failed to load resources" });
      }
    })();
  }, []);

  const generateHash = () => uuidv4().replace(/-/g, "").slice(0, 16);

  // ✅ Manual username-password login
  const handleLogin = async () => {
    if (!resource) {
      Toast.show({ type: "error", text1: "Please select a resource" });
      return;
    }
    if (username.trim().length < 2) {
      Toast.show({ type: "error", text1: "Username must not be empty" });
      return;
    }
    if (password.trim().length < 6) {
      Toast.show({
        type: "error",
        text1: "Password must have at least 6 characters",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("username", username.trim());
      formData.append("password", password.trim());

      const { data } = await http.post(
        `/test/${resource}/users/token`,
        formData.toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      if (data?.access_token) {
        dispatch(setCredentials({ token: data.access_token, resource }));
        Toast.show({ type: "success", text1: "Login successful" });
      } else throw new Error("Invalid response");
    } catch (err) {
      console.error("Login error:", err);
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unauthorized – check username/password/resource.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ OAuth login (Google, Microsoft, Slack)
  const openOAuth = async (provider) => {
    const hash = generateHash();

    const providerMap = {
      google: {
        setLoader: setLoadingGoogle,
        loader: loadingGoogle,
        url: `https://whitecel.com/test/gmail/auth/login?uid_hash=${hash}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&scopes=email,profile`,
      },
      microsoft: {
        setLoader: setLoadingMicrosoft,
        loader: loadingMicrosoft,
        url: `https://whitecel.com/test/outlook/auth/login?uid_hash=${hash}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&scopes=openid,profile`,
      },
      slack: {
        setLoader: setLoadingSlack,
        loader: loadingSlack,
        url: `https://whitecel.com/test/slack/auth/login?uid_hash=${hash}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&scopes=email,profile`,
      },
    };

    const { setLoader, loader, url } = providerMap[provider];
    if (loader) return;

    setLoader(true);
    try {
      const isAvailable = await InAppBrowser.isAvailable();
      if (!isAvailable) {
        await Linking.openURL(url);
        return;
      }

      await new Promise((r) => setTimeout(r, 300));
      await InAppBrowser.open(url, {
        showTitle: false,
        toolbarColor: "#000",
        enableUrlBarHiding: true,
        enableDefaultShare: false,
      });
    } catch (err) {
      console.error("OAuth error:", err);
      Toast.show({ type: "error", text1: "OAuth error", text2: err.message });
    } finally {
      setLoader(false);
    }
  };

  // ✅ UI
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>CASP</Text>
      <Text style={styles.title}>Admin Login</Text>
      <Text style={styles.subtitle}>Welcome back</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={resource}
          onValueChange={(v) => setResource(v)}
          dropdownIconColor="#aaa"
          style={styles.picker}
        >
          <Picker.Item label="Select Resource" value="" />
          {resources.map((rs) => (
            <Picker.Item key={rs} label={rs} value={rs} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Username</Text>
      <TextInput
        placeholder="Username"
        placeholderTextColor="#777"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        placeholder="Password"
        placeholderTextColor="#777"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <View style={styles.oauthRow}>
        {[
          { name: "google", icon: "google", loader: loadingGoogle },
          { name: "microsoft", icon: "logo-microsoft", loader: loadingMicrosoft },
          { name: "slack", icon: "slack", loader: loadingSlack },
        ].map(({ name, icon, loader }) => (
          <TouchableOpacity
            key={name}
            style={[styles.oauthButton, loader && { opacity: 0.6 }]}
            onPress={() => openOAuth(name)}
            disabled={loader}
          >
            {loader ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name={icon} size={20} color="#fff" />
                <Text style={styles.oauthText}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

// ✅ Styles
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
  label: { color: "#ccc", fontSize: 14, marginBottom: 6 },
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
  oauthRow: { flexDirection: "row", justifyContent: "space-between" },
  oauthButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
    marginHorizontal: 4,
    borderRadius: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  oauthText: { color: "#fff", marginLeft: 8 },
});