import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function AccountScreen({ navigation }) {
  const [occupied, setOccupied] = useState(0);
  const [storageCapacity, setStorageCapacity] = useState(1);
  const [integrated, setIntegrated] = useState(0);
  const [subscription, setSubscription] = useState("Free");
  const [expiry, setExpiry] = useState("-");
  const [profilePic, setProfilePic] = useState(null);

  const BACKEND_URL = "https://whitecel.com/test";

  const fetchData = async () => {
    try {
      const resource = await AsyncStorage.getItem("sr");
      const token = await AsyncStorage.getItem("adminToken");

      if (!resource || !token) return;

      const res = await axios.get(
        `${BACKEND_URL}/${resource}/account_info`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data && res.data.size) {
        setOccupied(res.data.size.occupied);
        setStorageCapacity(res.data.size.storage_capacity);
        setIntegrated(res.data.apps_integrated);

        await AsyncStorage.setItem("picture", res.data.picture);
        setProfilePic(res.data.picture);

        await AsyncStorage.setItem("subscription", res.data.subscription);
        setSubscription(res.data.subscription);

        await AsyncStorage.setItem("expiry", res.data.expiry);
        setExpiry(res.data.expiry);
      }
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const usage = (occupied / storageCapacity) * 100;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView style={{ padding: 20 }}>
        {/* Profile */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          {profilePic ? (
            <Image
              source={{ uri: profilePic }}
              style={{ width: 70, height: 70, borderRadius: 35 }}
            />
          ) : (
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: "#333",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 28 }}>A</Text>
            </View>
          )}

          <View style={{ marginLeft: 12 }}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              Anonymous User
            </Text>
            <Text style={{ color: "#777" }}>test@caspai.in</Text>
          </View>
        </View>

        {/* Storage */}
        <Text style={{ fontWeight: "700", color: "#fff" }}>Storage</Text>
        <Text style={{ marginTop: 5, color: "#999" }}>
          {occupied} GB used out of {storageCapacity} GB
        </Text>

        <View
          style={{
            height: 8,
            backgroundColor: "#222",
            marginTop: 8,
            borderRadius: 8,
          }}
        >
          <View
            style={{
              width: `${usage}%`,
              height: 8,
              backgroundColor: "#4ade80",
              borderRadius: 8,
            }}
          />
        </View>

        {/* Apps */}
        <Text style={{ marginTop: 20, fontWeight: "700", color: "#fff" }}>
          Apps Integrated: {integrated}
        </Text>

        {/* Billing */}
        <View
          style={{
            marginTop: 30,
            padding: 20,
            borderRadius: 14,
            backgroundColor: "#0D0D0D",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            Current Plan: {subscription}
          </Text>
          <Text style={{ color: "#777", marginTop: 8 }}>
            Your trial ends on {expiry}
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("SubscriptionPlans")}
            style={{
              marginTop: 16,
              backgroundColor: "#4ade80",
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: "#000",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              Upgrade Plan
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

