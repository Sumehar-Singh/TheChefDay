import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const BookingAcceptedScreen = ({ navigation, route }) => {
  const { booking } = route.params;

  return (
    <View style={styles.container}>
      {/* <Image
        source={require('../assets/success.png')} // You can use a checkmark or confetti image
        style={styles.image}
      /> */}

      <Text style={styles.title}>🎉 Congrats!</Text>
      <Text style={styles.message}>You have accepted the booking request.</Text>

      <View style={styles.infoBox}>
       
        <Text style={styles.infoLabel}>Customer:</Text>
        <Text style={styles.infoValue}>{booking?.Name}</Text>
        <Text style={styles.infoLabel}>Phone:</Text>
        <Text style={styles.infoValue}>{booking?.PhoneNo}</Text>
        <Text style={styles.infoLabel}>Event On:</Text>
        <Text style={styles.infoValue}>{booking?.EventDate}</Text>
        <Text style={styles.infoLabel}>Service Type:</Text>
        <Text style={styles.infoValue}>{booking?.ServiceType}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ChefDashboard')}
      >
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BookingAcceptedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 10,
  },
  message: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#f1f1f1',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 30,
  },
  infoLabel: {
    fontWeight: '600',
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 10,
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
