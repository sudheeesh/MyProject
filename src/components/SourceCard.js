// src/components/SourceCard.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SourceCard({ source }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title} numberOfLines={1}>
        {source.title || "Source"}
      </Text>
      <Text style={styles.snippet} numberOfLines={2}>
        {source.snippet || ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    padding: 12,
    backgroundColor: "#111",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 10,
    marginRight: 12,
  },
  title: { color: "#fff", fontWeight: "600", marginBottom: 6 },
  snippet: { color: "#bbb", fontSize: 13 },
});
