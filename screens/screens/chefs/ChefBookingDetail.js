import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, Alert, TouchableOpacity, SafeAreaView } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../../config';
import { useRoute, useNavigation } from '@react-navigation/native';
import { formatDate } from '../../components/utils';
import { Ionicons } from '@expo/vector-icons';
import CustomStatusBar from '../../components/CustomStatusBar';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const ChefBookingDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { BookingID } = route.params;
  const [booking, setBooking] = useState(null);
  const [bookingStatus, setBookingStatus] = useState("");

  useEffect(() => {
    const fetchBookingDetail = async () => {
      const form = new FormData();
      form.append('BookingID', BookingID);
      try {
        const response = await axios.post(`${BASE_URL}chefs/get_booking_detail.php`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data.success) {
          setBooking(response.data.data);
          setBookingStatus(response.data.data.Status);
        } else {
          Alert.alert('Error', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching booking detail:', error);
        Alert.alert('Error', 'Something went wrong while fetching booking data.');
      }
    };

    fetchBookingDetail();
  }, [BookingID]);

  if (!booking) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const updateBookingStatus = async (status, onSuccess = () => {}) => {
    // If the status is "Rejected", confirm with the user first
    if (status === "Rejected") {
      Alert.alert(
        "Confirm Rejection",
        "Are you sure you want to reject this booking?",
        [
          {
            text: "No",
            style: "cancel"
          },
          {
            text: "Yes",
            onPress: () => proceedUpdateStatus(status, onSuccess)
          }
        ]
      );
    } else {
      proceedUpdateStatus(status, onSuccess);
    }
  };
  
  // This function actually performs the API call
  const proceedUpdateStatus = async (status, onSuccess) => {
    const form = new FormData();
    form.append('BookingID', BookingID);
    form.append('Status', status);
  
    try {
      const response = await axios.post(`${BASE_URL}shared/update_booking.php`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      if (response.data.success) {
        setBookingStatus(status);
        onSuccess();
        if(status==="Confirmed")
        navigation.navigate('BookingAcceptedScreen', { booking });
      //  Alert.alert('Success', response.data.message);
        // callback after success (optional)
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      Alert.alert('Error', 'Something went wrong while updating booking status.');
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
     <CustomStatusBar title="Booking Detail" includeTopInset={false} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Chef Image */}
        {booking.Image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: booking.Image }} style={styles.chefImage} />
          </View>
        )}

        {/* Booking Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Information</Text>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Booked By:</Text>
            <Text style={styles.value}>{booking.Name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Phone No:</Text>
            <Text style={styles.value}>{booking.PhoneNo}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Event At:</Text>
            <Text style={styles.value}>{booking.Address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Pin Code:</Text>
            <Text style={styles.value}>{booking.PinCode}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Booking Date:</Text>
            <Text style={styles.value}>{formatDate(booking.BookingDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Event Date:</Text>
            <Text style={styles.valueevent}>{formatDate(booking.EventDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Service Type:</Text>
            <Text style={styles.value}>{booking.ServiceType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Total Price:</Text>
            <Text style={styles.value}>${booking.TotalPrice}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Status:</Text>
            
            <Text
              style={[
                styles.value,
                bookingStatus === 'Confirmed'
                  ? styles.statusConfirmed
                  : bookingStatus === 'Canceled'
                  ? styles.statusCancelled
                  : styles.statusPending,
              ]}
            >
              {bookingStatus === "Canceled" ? "Canceled by User" : bookingStatus}
            </Text>
          </View>
        </View>

        {bookingStatus !== "Confirmed" && bookingStatus !== "Canceled" && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.buttonBox, styles.acceptButton]} 
              onPress={() => updateBookingStatus("Confirmed")}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.buttonBox, styles.declineButton]} 
              onPress={() => updateBookingStatus("Rejected")}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isTablet ? 20 : 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: isTablet ? 20 : 15,
  },
  headerTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: '700',
    color: '#805500',
  },
  container: {
    padding: isTablet ? 24 : 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: isTablet ? 20 : 16,
    color: '#805500',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: isTablet ? 30 : 20,
  },
  chefImage: {
    width: isTablet ? 160 : 120,
    height: isTablet ? 160 : 120,
    borderRadius: isTablet ? 80 : 60,
    borderWidth: 3,
    borderColor: '#805500',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: isTablet ? 24 : 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: '700',
    color: '#805500',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailRow: {
    marginBottom: isTablet ? 16 : 12,
    paddingBottom: isTablet ? 12 : 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: isTablet ? 18 : 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  value: {
    fontSize: isTablet ? 18 : 14,
    color: '#444',
    padding: 8,
    borderRadius: 8,
  },
  valueevent: {
    fontSize: isTablet ? 18 : 14,
    color: 'green',
    padding: 8,
    borderRadius: 8,
  },
  statusConfirmed: {
    color: 'green',
    fontWeight: 'bold',
  },
  statusCancelled: {
    color: 'red',
    fontWeight: 'bold',
  },
  statusPending: {
    color: 'orange',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: isTablet ? 30 : 20,
    marginBottom: isTablet ? 40 : 30,
  },
  buttonBox: {
    paddingVertical: isTablet ? 18 : 14,
    paddingHorizontal: isTablet ? 30 : 24,
    borderRadius: 12,
    marginHorizontal: isTablet ? 20 : 15,
    minWidth: isTablet ? 180 : 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  buttonText: {
    color: '#FFF',
    fontSize: isTablet ? 20 : 16,
    fontWeight: 'bold',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#FF4F4F',
  },
});

export default ChefBookingDetail;
