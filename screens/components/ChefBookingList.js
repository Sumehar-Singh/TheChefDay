import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ScrollView,
  ImageBackground,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
const { width, height } = Dimensions.get('window');
const isTablet = width > 600;
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { formatDate, getEventDayLabel } from './utils';

const ChefBookingList = ({ navigation, userId, limit }) => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChefBookings = useCallback(async () => {
    if (!userId) return;

    const form = new FormData();
    form.append('ChefID', userId);
    form.append('Limit', limit);

    try {
      const response = await axios.post(
        `${BASE_URL}chefs/get_chef_bookings.php`,
        form,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.data.success) {
        setBookings(response.data.data || []);
      } else {
        console.error('Error fetching bookings:', response.data.message);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    setIsLoading(true);
    fetchChefBookings();
  }, [fetchChefBookings]);

  const handleBookingsList = () => {
    navigation.navigate('Bookings');
  };

  const EmptyBookings = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="calendar-clock"
        size={isTablet ? 80 : 60}
        color="#ff0000"
      />
      <Text style={styles.emptyTitle}>No Booking Requests Yet</Text>
      <Text style={styles.emptyText}>
        You haven't received any booking requests yet. We'll let you know as
        soon as someone reaches out.
      </Text>
      {/* <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => navigation.navigate('ChefEditProfile')}
      >
        <Text style={styles.emptyButtonText}>Update Profile</Text>
      </TouchableOpacity> */}
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return '#4CAF50';
      case 'Declined':
        return '#F44336';
      case 'Canceled':
        return '#FF9800';
      default:
        return '#ff0000';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <MaterialCommunityIcons
            name="calendar-check"
            size={isTablet ? 28 : 24}
            color="#ff0000"
          />
          <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
        </View>
        {bookings.length > 0 && limit && (
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={handleBookingsList}
          >
            <Text style={styles.seeAllText}>View All</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={isTablet ? 24 : 20}
              color="#ff0000"
            />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading bookings...</Text>
        </View>
      ) : bookings.length === 0 ? (
        <EmptyBookings />
      ) : (
        <FlatList
          scrollEnabled={false}
          data={bookings}
          keyExtractor={(item) => item.BookingID}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.bookingItem}
              onPress={() =>
                navigation.navigate('ChefBookingDetail', {
                  BookingID: item.BookingID,
                })
              }
            >
              <View style={styles.bookingItemLeft}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.bookingTextCustomer}>
                    {item.UserName}{' '}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(item.Status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{item.Status}</Text>
                  </View>
                </View>
                <View style={styles.bookingDetails}>
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={isTablet ? 20 : 16}
                      color="#ff0000"
                    />
                    <Text style={styles.bookingTextEvent}>
                      Event: {formatDate(item.EventDate)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={isTablet ? 20 : 16}
                      color="#ff0000"
                    />
                    <Text style={styles.bookingText}>
                      Booked: {formatDate(item.BookingDate)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons
                      name="calendar-clock"
                      size={isTablet ? 20 : 16}
                      color="#ff0000"
                    />
                    <Text style={styles.bookingTextDays}>
                      {getEventDayLabel(item.EventDate)}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minHeight: 200,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: '700',
    color: '#262626',
    marginLeft: 10,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  seeAllText: {
    fontSize: isTablet ? 16 : 14,
    color: '#ff0000',
    fontWeight: '600',
    marginRight: 5,
  },
  bookingItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: isTablet ? 14 : 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ff0000',
  },
  bookingItemLeft: {
    flex: 1,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookingTextCustomer: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    color: '#262626',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
  },
  bookingDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingTextEvent: {
    fontSize: isTablet ? 16 : 14,
    color: '#ff0000',
    marginLeft: 8,
  },
  bookingText: {
    fontSize: isTablet ? 16 : 14,
    color: '#666',
    marginLeft: 8,
  },
  bookingTextDays: {
    fontSize: isTablet ? 16 : 14,
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: '700',
    color: '#262626',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: isTablet ? 16 : 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: isTablet ? 24 : 18,
  },
  emptyButton: {
    backgroundColor: '#ff0000',
    paddingVertical: isTablet ? 12 : 10,
    paddingHorizontal: isTablet ? 25 : 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },
});

export default ChefBookingList;
