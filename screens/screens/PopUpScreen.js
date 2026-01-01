import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons';

const PopUpScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { width } = Dimensions.get('window');
  const isTablet = width > 600;

  const {
    title = "Success!",
    type = "success",
    detail = "Your action was successful.",
    returnTo = "Home",
  } = route.params || {};

  const getIcon = () => {
    switch (type) {
      case 'success':
        return { name: 'check-circle', color: '#4CAF50' };
      case 'error':
      case 'fail':
        return { name: 'error', color: '#f44336' };
      case 'warning':
        return { name: 'help', color: '#FFA500' };
      case 'info':
      default:
        return { name: 'info', color: '#2196F3' };
    }
  };

  const icon = getIcon();

  const handleOkPress = () => {
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
      <View style={[styles.card, isTablet && styles.cardTablet]}>
        <View style={[styles.iconContainer, { backgroundColor: `${icon.color}20` }]}>
          <MaterialIcons name={icon.name} size={40} color={icon.color} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.detail}>{detail}</Text>

        <TouchableOpacity
          style={[styles.okButton, { backgroundColor: icon.color }]}
          onPress={handleOkPress}
        >
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
    padding: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTablet: {
    width: "60%",
    maxWidth: 500,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  detail: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
  },
  okButton: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  okText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
