import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Linking,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import http from "../services/http";
import { integrationComponents } from "../utils/integrationComponent";
import { generateHash } from "../utils/generateHash";

export default function IntegrationsScreen() {
  const { token, resource, email } = useSelector((state) => state.admin);

  const [statusMap, setStatusMap] = useState({});
  const [loadingType, setLoadingType] = useState(null);

  const hash = useMemo(() => generateHash(), []);

  // No expo-linking available
  const redirectUri = "myproject://redirect";

  const items = useMemo(
    () => integrationComponents(hash, resource, email),
    [hash, resource, email]
  );

  useEffect(() => {
    if (token) refreshIntegrations();
  }, [token]);

  useEffect(() => {
    const sub = Linking.addEventListener("url", (event) => {
      try {
        const url = event.url;
        if (url.includes("redirect")) {
          refreshIntegrations();
        }
      } catch (e) {
        console.log("URL parse error:", e.message);
      }
    });

    return () => sub.remove();
  }, []);

  async function refreshIntegrations() {
    try {
      const { data } = await http.get(`/test/${resource}/integrations`);
      const mapped = {};
      Object.keys(data || {}).forEach((k) => {
        mapped[k] = data[k] === 1;
      });
      setStatusMap(mapped);
    } catch (e) {
      console.log("Integration fetch failed:", e?.message);
    }
  }

  async function pollOAuth(hash, timeoutMs = 120000, intervalMs = 2000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const { data } = await http.post("/test/hash/users_cloud/token", {
          username: hash,
          resource: "hash",
        });
        if (data?.access_token) return true;
      } catch (_) {}

      await new Promise((r) => setTimeout(r, intervalMs));
    }
    return false;
  }

  async function handleConfigure(type) {
    const selected = items.find((i) => i.type === type);
    if (!selected) return;

    try {
      setLoadingType(type);

      // Build OAuth URL
      const authUrl = `${selected.openPopupUrl}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}`;

      // Opening browser using RN Linking
      const supported = await Linking.canOpenURL(authUrl);
      if (!supported) {
        Alert.alert("Error", "Cannot open browser");
        return;
      }

      await Linking.openURL(authUrl);

      // Now wait for redirect → captured via Linking listener
      const ok = await pollOAuth(hash);

      if (ok) {
        await refreshIntegrations();
        Alert.alert("Success", `${selected.title} connected successfully.`);
      } else {
        Alert.alert("Timeout", `Could not verify ${selected.title} connection.`);
      }
    } catch (e) {
      Alert.alert("Error", e?.message || `Failed to connect ${selected?.title}`);
    } finally {
      setLoadingType(null);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Integrations</Text>
      <Text style={styles.subtitle}>
        Connect apps securely — all tokens stored and validated on your server.
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {items.map((item) => {
          const connected = !!statusMap[item.type];
          const busy = loadingType === item.type;
          const iconName =
            item.type === "GoogleGmail"
              ? "mail"
              : item.type === "GoogleDrive"
              ? "cloud"
              : item.type === "AzureOutlook"
              ? "inbox"
              : "users";

          return (
            <View key={item.type} style={styles.card}>
              <View style={styles.cardLeft}>
                <Feather name={iconName} size={20} color="#fff" />
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>

              <TouchableOpacity
                style={styles.configureButton}
                onPress={() => handleConfigure(item.type)}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text
                      style={[
                        styles.configureText,
                        connected && { color: "#22c55e" },
                      ]}
                    >
                      {connected ? "Connected" : "Configure"}
                    </Text>
                    <MaterialIcons
                      name="keyboard-arrow-right"
                      size={18}
                      color="#fff"
                    />
                  </>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black", padding: 20, paddingTop: 40 },
  title: { color: "white", fontSize: 22, fontWeight: "bold" },
  subtitle: { color: "#9ca3af", fontSize: 13, marginBottom: 20 },
  card: {
    backgroundColor: "#111",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  cardLeft: { flexDirection: "row", alignItems: "center" },
  cardTitle: { color: "white", fontSize: 16, marginLeft: 12 },
  configureButton: { flexDirection: "row", alignItems: "center" },
  configureText: { color: "#9ca3af", marginRight: 4, fontWeight: "500" },
});

