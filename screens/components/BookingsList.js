import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { formatDate } from './utils';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const BookingsList = ({ UserID, navigation, limit, showHeader = true, showViewAll = true }) => {
  const [bookings, setBookings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // If limit is passed (Dashboard=5), use it. otherwise use 100 for All Bookings
        const effectiveLimit = limit || 100;

        let url = `${BASE_URL}/users/get_bookings.php?UserId=${UserID}`;
        url += `&limit=${effectiveLimit}`;

        console.log('Fetching bookings from:', url);
        const response = await axios.get(url);

        if (response.data.status === 'success') {
          const bookingData = Array.isArray(response.data.data) ? response.data.data : [];
          setBookings(bookingData);
        } else {
          setBookings([]);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    if (UserID) {
      fetchBookings();
    }
  }, [UserID, limit]);

  // Direct helper to safely extract data regardless of casing and missing values
  const getField = (item, keys, fallback = '') => {
    if (!item) return fallback;
    for (const key of keys) {
      // Check for exact key
      let val = item[key];
      if (val !== undefined && val !== null) {
        if (typeof val === 'string') val = val.trim();
        if (val !== '') return val;
      }

      // Check for key with spaces removed (e.g. "booking id" -> "bookingid")
      const strippedKey = key.replace(/\s/g, '');
      val = item[strippedKey];
      if (val !== undefined && val !== null) {
        if (typeof val === 'string') val = val.trim();
        if (val !== '') return val;
      }
    }
    return fallback;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return '#4CAF50';
      case 'Declined': return '#F44336';
      case 'Canceled': return 'red';
      case 'Pending': return '#FF9800';
      case 'Service Completed': return 'gray';
      default: return '#805500';
    }
  };

  const EmptyBookings = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="calendar-clock" size={60} color="#805500" />
      <Text style={styles.emptyTitle}>No Bookings Yet</Text>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#ff0000" />;
  }

  const hasBookings = bookings && bookings.length > 0;

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <MaterialCommunityIcons name="calendar-check" size={24} color="#ff0000" />
            <Text style={styles.sectionTitle}>Your Bookings</Text>
          </View>
          {hasBookings && showViewAll && (
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('AllBookings')}
            >
              <Text style={styles.seeAllText}>View All</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#209E00" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {!hasBookings ? (
        <EmptyBookings />
      ) : (
        <>
          {bookings
            .filter(item => {
              // Filter out ghost items (no valid ID)
              const id = item.bookingid || item.BookingId || item.id || item.ID;
              return id !== undefined && id !== null && id !== '';
            })
            .map((item, index) => {
              // Updated keys based on user's debug output: 
              // booking id, servicetype, eventdate, status, bookingdate, chefname, chefimage
              const bookingId = getField(item, ['booking id', 'bookingid', 'BookingId', 'id', 'ID'], '');
              const chefName = getField(item, ['chefname', 'chef name', 'Chefname', 'ChefName', 'name'], 'Unknown Chef');
              const chefImage = getField(item, ['chefimage', 'chef image', 'ChefImage', 'image'], null);
              const eventDate = getField(item, ['eventdate', 'event date', 'EventDate', 'date'], 'N/A');
              const bookingDate = getField(item, ['bookingdate', 'booking date', 'BookingDate', 'created_at'], 'N/A');
              const serviceType = getField(item, ['servicetype', 'service type', 'ServiceType', 'service'], 'Service');
              const status = getField(item, ['status', 'Status'], 'Pending');

              return (
                <TouchableOpacity
                  key={bookingId ? bookingId.toString() : `booking-${index}`}
                  style={styles.bookingItem}
                  onPress={() =>
                    navigation.navigate('BookingDetail', {
                      BookingID: bookingId,
                    })
                  }
                >
                  <View style={styles.bookingItemLeft}>
                    <View style={styles.bookingHeader}>
                      {/* Chef Image Check */}
                      {chefImage ? (
                        <Image
                          source={{ uri: chefImage }}
                          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: '#eee' }}
                        />
                      ) : (
                        <View style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }}>
                          <MaterialCommunityIcons name="chef-hat" size={20} color="#666" />
                        </View>
                      )}

                      <Text style={styles.bookingTextCustomer}>
                        {chefName}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                        <Text style={styles.statusText}>{status}</Text>
                      </View>
                    </View>

                    <View style={styles.bookingDetails}>
                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="calendar" size={16} color="#ff0000" />
                        <Text style={[styles.bookingTextEvent, { color: '#000000' }]}>
                          Event: {eventDate !== 'N/A' ? formatDate(eventDate) : 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="clock-outline" size={16} color="#ff0000" />
                        <Text style={[styles.bookingText, { color: '#333333' }]}>
                          Booked: {bookingDate !== 'N/A' ? formatDate(bookingDate) : 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="food" size={16} color="#ff0000" />
                        <Text style={[styles.bookingTextService, { color: '#000000', fontWeight: '600' }]}>
                          {serviceType}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 15,
    padding: isTablet ? 20 : 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
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
    color: '#209E00',
    fontWeight: '600',
    marginRight: 5,
  },
  bookingItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: isTablet ? 15 : 12,
    marginBottom: 10,
    // Removed minHeight/justifyContent to let content drive the height naturally
  },
  bookingItemLeft: {
    flex: 1,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // Explicit separation from details
  },
  bookingTextCustomer: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
  },
  bookingDetails: {
    // Removed 'gap' as it causes overlap in older RN versions
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6, // Explicit margin between rows
  },
  bookingTextEvent: {
    fontSize: isTablet ? 16 : 14,
    color: '#209E00',
    marginLeft: 8,
    fontWeight: '500',
  },
  bookingText: {
    fontSize: isTablet ? 16 : 14,
    color: '#444', // Darker grey
    marginLeft: 8,
  },
  bookingTextService: {
    fontSize: isTablet ? 16 : 14,
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: isTablet ? 30 : 20,
    marginVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
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
});

export default BookingsList;
