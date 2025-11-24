import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PricingPlanCard from "../account/PricingPlanCard";

export default function SubscriptionPlansScreen() {
  const plans = [
    {
      title: "Free",
      price: "Always free",
      features: [
        "easy signup process",
        "1 user access",
        "1 app integrations",
        "1,000 documents processing",
        "5 GB of cloud storage",
        "30-day service period",
        "3 LLM Options with Basic Agent automation",
        "Unified search for connected apps and local content",
        "Cloud-based hosting with fundamental security measures",
      ],
    },
    {
      title: "Basic",
      price: "$20/month",
      features: [
        "5 app integrations",
        "5,000 documents processing",
        "50 GB of cloud storage",
        "60-day service period",
        "Advanced automation with up to 10 bots",
        "Custom interface design",
        "Cloud-based hosting with enhanced security",
      ],
    },
    {
      title: "Pro",
      price: "$46/month",
      features: [
        "12 app integrations upto",
        "20,000 documents processing",
        "100 GB of cloud storage",
        "60-day service period",
        "Advanced automation with up to 20 Agents",
        "Custom interface with dedicated support",
        "Enterprise-grade security and compliance",
      ],
    },
    {
      title: "Premium",
      price: "Please Contact the Administration",
      features: [
        "Unlimited user access",
        "Unlimited app integrations",
        "Unlimited documents",
        "Unlimited cloud storage",
        "Unlimited service period",
        "Custom automation with up to 50 Agents",
        "Tailored interface design",
        "On-premise hosting with top-tier security",
      ],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={{ padding: 20 }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: "#fff",
            marginBottom: 20,
          }}
        >
          Choose a Subscription Plan
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 20 }}
        >
          {plans.map((p, i) => (
            <PricingPlanCard key={i} plan={p} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
