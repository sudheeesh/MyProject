import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";

export default function PricingPlanCard({ plan }) {
  return (
    <View
      style={{
        width: 280,
        padding: 20,
        backgroundColor: "#0D0D0D",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#222",
      }}
    >
      <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>
        {plan.title}
      </Text>

      <Text style={{ color: "#4ade80", marginVertical: 12, fontSize: 16 }}>
        {plan.price}
      </Text>

      <View style={{ marginTop: 10, gap: 10 }}>
        {plan.features.map((item, index) => (
          <View
            key={index}
            style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
          >
            <Feather name="check-circle" size={18} color="#4ade80" />
            <Text style={{ color: "#ccc", fontSize: 14 }}>{item}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={{
          marginTop: 20,
          backgroundColor:
            plan.title === "Premium" ? "#555" : "#4ade80",
          paddingVertical: 12,
          borderRadius: 10,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            color: plan.title === "Premium" ? "#fff" : "#000",
            fontSize: 15,
            fontWeight: "700",
          }}
        >
          {plan.title === "Premium"
            ? "Contact Admin"
            : `Upgrade to ${plan.title} Plan`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
