import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const iconMap = {
  success: require("../../assets/icons/success.png"),
  warning: require("../../assets/icons/warning.png"),
  fail: require("../../assets/icons/fail.png"),
  info: require("../../assets/icons/info.png"),
};

const PopUpScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    title = "Success!",
    type = "success",
    detail = "Your action was successful.",
    returnTo = "Home", // Default screen if not passed
  } = route.params || {};

  useEffect(() => {
    if (!iconMap[type]) {
      console.warn("Invalid type passed to PopUpScreen. Defaulting to info.");
    }
  }, [type]);

  const handleOkPress = () => {
    // If returning to ChefSettings, include ChefDashboard behind it for proper back navigation
    if (returnTo === 'ChefSettings') {
      navigation.reset({
        index: 1,
        routes: [{ name: 'ChefDashboard' }, { name: 'ChefSettings' }],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: returnTo }],
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={iconMap[type] || iconMap.info} style={styles.icon} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.detail}>{detail}</Text>

        <TouchableOpacity style={styles.okButton} onPress={handleOkPress}>
          <Text style={styles.okText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PopUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  detail: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  okButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  okText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});
