export default function AssistantDetailsScreen({ route }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 20 }}>
      <Text style={{ color: "#fff", fontSize: 24 }}>
        {route.params.name}
      </Text>
    </View>
  );
}
