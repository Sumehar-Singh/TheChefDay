import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, Alert, TouchableOpacity, RefreshControl, Modal, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../../config';
import { useRoute } from '@react-navigation/native';
import { formatDate } from '../../components/utils';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomStatusBar from '../../components/CustomStatusBar';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const BookingDetail = () => {
  const route = useRoute();
  const { BookingID } = route.params;
  const [booking, setBooking] = useState(null);
  const [bookingStatus, setBookingStatus] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  // modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalConfirmText, setModalConfirmText] = useState("Confirm");
  const [pendingStatus, setPendingStatus] = useState("");

  const [modalOnSuccess, setModalOnSuccess] = useState(() => () => { });
  const fetchBookingDetail = async () => {
    const form = new FormData();
    form.append('BookingID', BookingID);
    try {
      const response = await axios.post(`${BASE_URL}users/get_booking_detail.php`, form, {
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
  useEffect(() => {

    fetchBookingDetail();
  }, [BookingID]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh booking details
      await fetchBookingDetail();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  if (!booking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#805500" />
      </View>
    );
  }
  const updateBookingStatus = async (status, onSuccess = () => { }) => {
    // Configure modal content based on target status
    let title = 'Confirm Action';
    let message = 'Are you sure you want to proceed?';
    let confirmText = 'Confirm';

    if (status === 'Cancelled') {
      title = 'Confirm Cancel';
      message = 'Are you sure you want to cancel this booking?';
      confirmText = 'Yes, Cancel';
    } else if (status === 'Service Completed') {
      title = 'Mark as Completed';
      message = 'Please confirm the service has been completed successfully.';
      confirmText = 'Yes, Mark Completed';
    }

    setPendingStatus(status);
    setModalTitle(title);
    setModalMessage(message);
    setModalConfirmText(confirmText);
    setModalOnSuccess(() => onSuccess);
    setModalVisible(true);
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
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <CustomStatusBar title="Booking Details" />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#805500']}
            tintColor="#805500"
            progressViewOffset={10}
          />
        }
      >
        {/* Header Section */}




        {/* Chef Image */}
        {booking.Image && (
          <View style={styles.imageContainer}>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: booking.Image }} style={styles.chefImage} />
            </View>
          </View>
        )}

        {/* Chef Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-circle" size={24} color="#805500" />
            <Text style={styles.cardTitle}>Chef Details</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{booking.ChefName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Experience</Text>
            <Text style={styles.value}>{booking.ExperienceYears} Years</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Bio</Text>
            <Text style={[styles.value, styles.multiline]}>{booking.Bio}</Text>
          </View>
        </View>

        {/* Confirmation Modal */}
        <Modal
          transparent
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={[styles.modalIconContainer, { backgroundColor: pendingStatus === 'Cancelled' ? '#FFEBEE' : '#E8F5E9' }]}>
                <Ionicons
                  name={pendingStatus === 'Cancelled' ? "alert-circle" : "checkmark-circle"}
                  size={40}
                  color={pendingStatus === 'Cancelled' ? "#D32F2F" : "#2E7D32"}
                />
              </View>

              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <Text style={styles.modalMessage}>{modalMessage}</Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalConfirmBtn, { backgroundColor: pendingStatus === 'Cancelled' ? '#D32F2F' : '#2E7D32' }]}
                  onPress={() =>
                    proceedUpdateStatus(pendingStatus, () => {
                      setBooking((prev) => (prev ? { ...prev, Status: pendingStatus } : prev));
                      setBookingStatus(pendingStatus);
                      setModalVisible(false);
                      modalOnSuccess();
                    })
                  }
                >
                  <Text style={styles.modalConfirmText}>{modalConfirmText}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Booking Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={24} color="#805500" />
            <Text style={styles.cardTitle}>Booking Info</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Booked By</Text>
            <Text style={styles.value}>{booking.Name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Phone No</Text>
            <Text style={styles.value}>{booking.PhoneNo}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{booking.Address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Pin Code</Text>
            <Text style={styles.value}>{booking.PinCode}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Booking Date</Text>
            <Text style={styles.value}>{formatDate(booking.BookingDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Event Date</Text>
            <Text style={styles.valueevent}>{formatDate(booking.EventDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Service Type</Text>
            <Text style={styles.value}>{booking.ServiceType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Total Price</Text>
            <Text style={styles.value}>${booking.TotalPrice}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Status</Text>
            <View style={[
              styles.statusBadge,
              booking.Status === 'Confirmed' ? styles.statusConfirmedBadge :
                booking.Status === 'Cancelled' ? styles.statusCancelledBadge :
                  styles.statusPendingBadge
            ]}>
              {/* <Text style={styles.statusText}>{booking.Status}</Text> */}

              <Text
                style={styles.statusText}
              >
                {bookingStatus === "Canceled" ? "Canceled by You" : bookingStatus}
              </Text>

            </View>
          </View>
        </View>

        {booking.Status === "Service Completed" ? (
          <View style={styles.completedNotice}>
            <Ionicons name="checkmark-done-circle" size={24} color="#2E7D32" />
            <Text style={styles.completedNoticeText}>Your service was completed by this chef.</Text>
          </View>
        ) : booking.Status === "Cancelled" ? (
          <View style={styles.cancelledNotice}>
            <Ionicons name="close-circle" size={24} color="#B00020" />
            <Text style={styles.cancelledNoticeText}>This booking was cancelled.</Text>
          </View>
        ) : booking.Status === "Confirmed" ? (
          <TouchableOpacity
            style={styles.completedButton}
            onPress={() => updateBookingStatus("Service Completed")}
          >
            <Ionicons name="checkmark-done-circle" size={24} color="#FFF" />
            <Text style={styles.completedText}>Mark as Service Completed</Text>
          </TouchableOpacity>
        ) : (
          booking.Status !== "Cancelled" && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => updateBookingStatus("Cancelled")}
            >
              <Ionicons name="close-circle" size={24} color="#FFF" />
              <Text style={styles.cancelText}>Cancel Booking</Text>
            </TouchableOpacity>
          )
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: -20,
  },
  headerTitle: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  imageWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  chefImage: {
    width: isTablet ? 160 : 120,
    height: isTablet ? 160 : 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: '700',
    color: '#805500',
    marginLeft: 10,
  },
  detailRow: {
    marginBottom: 15,
  },
  label: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: isTablet ? 18 : 16,
    color: '#333',
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
  },
  valueevent: {
    fontSize: isTablet ? 18 : 16,
    color: '#2E7D32',
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
  },
  multiline: {
    textAlignVertical: 'top',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusConfirmedBadge: {
    backgroundColor: '#E8F5E9',
  },
  statusCancelledBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusPendingBadge: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FF4F4F',
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF4F4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cancelText: {
    color: '#FFF',
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  completedButton: {
    backgroundColor: 'green',
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF4F4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  completedText: {
    color: '#FFF',
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  completedNotice: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6, // Reduced gap
    borderWidth: 1,
    borderColor: '#C8E6C9', // Subtle border
  },
  completedNoticeText: {
    color: '#2E7D32',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    // Removed marginLeft
    textAlign: 'center',
    flexShrink: 1, // Ensure text wraps properly if long
  },
  cancelledNotice: {
    backgroundColor: '#FFEBEE',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  cancelledNoticeText: {
    color: '#B00020',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    // Removed marginLeft
    textAlign: 'center',
    flexShrink: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center', // Center everything
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 20,
  },
  modalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: isTablet ? 22 : 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: isTablet ? 16 : 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'column', // Stack vertically for better space
    width: '100%',
    gap: 12,
  },
  modalCancelBtn: {
    width: '100%',
    backgroundColor: '#fff', // Ghost style
    borderColor: '#ddd',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontSize: isTablet ? 16 : 15,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    width: '100%',
    // Background color handled in JSX
    paddingVertical: 15, // Slightly taller
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, // Stronger shadow
    shadowRadius: 5,
    elevation: 5,
  },
  modalConfirmText: {
    color: '#FFF',
    fontSize: isTablet ? 18 : 16, // Larger text
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BookingDetail;
