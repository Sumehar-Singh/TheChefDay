import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { formatDate, getEventDayLabel } from './utils';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const BookingsList = ({ UserID, navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/users/get_bookings.php?UserId=${UserID}&limit=5`);
        if (response.data.status === 'success') {
          setBookings(response.data.data);
        } else {
          Alert.alert('Error', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        Alert.alert('Error', 'Failed to load bookings');
      }
      setLoading(false);
    };
    fetchBookings();
  }, []);

  

  const getStatusColor = (status) => {
    switch(status) {
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
      <MaterialCommunityIcons name="calendar-clock" size={isTablet ? 80 : 60} color="#805500" />
      <Text style={styles.emptyTitle}>No Bookings Yet</Text>
      <Text style={styles.emptyText}>
        Start exploring chefs and book their services for your special occasions.
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => navigation.navigate('ChefsList')}
      >
        <Text style={styles.emptyButtonText}>Find Chefs</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#ff0000" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <MaterialCommunityIcons name="calendar-check" size={isTablet ? 28 : 24} color="#ff0000" />
          <Text style={styles.sectionTitle}>Your Bookings</Text>
        </View>
        {bookings && (
          <TouchableOpacity 
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('AllBookings')}
          >
            <Text style={styles.seeAllText}>View All</Text>
            <MaterialCommunityIcons name="chevron-right" size={isTablet ? 24 : 20} color="#209E00" />
          </TouchableOpacity>
        )}
      </View>

      {!bookings? (
        <EmptyBookings />
      ) : (
        <FlatList
          data={[...bookings.slice(0, 5), { id: 'seeAll' }]}
          keyExtractor={(item) => item.BookingId?.toString() ?? 'seeAll'}
          renderItem={({ item }) =>
            item.id !== 'seeAll' ? (
              <TouchableOpacity 
                style={styles.bookingItem}
                onPress={() => navigation.navigate('BookingDetail', { BookingID: item.BookingId })}
              >
                <View style={styles.bookingItemLeft}>
                  <View style={styles.bookingHeader}>
                    <Text style={styles.bookingTextCustomer}>{item.ChefName}</Text>
                    
                  </View>
                  <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="calendar" size={isTablet ? 20 : 16} color="#ff0000" />
                      <Text style={styles.bookingTextEvent}>Event: {formatDate(item.EventDate)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="clock-outline" size={isTablet ? 20 : 16} color="#ff0000" />
                      <Text style={styles.bookingText}>Booked: {formatDate(item.BookingDate)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="food" size={isTablet ? 20 : 16} color="#ff0000" />
                      <Text style={styles.bookingTextService}>{item.ServiceType}</Text>
                      
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.Status) }]}>
                      <Text style={styles.statusText}>{item.Status}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
            <></>
            )
          }
        />
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
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#209E00',
    marginLeft: 8,
  },
  bookingText: {
    fontSize: isTablet ? 16 : 14,
    color: '#666',
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
  seeAllCard: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 5,
  },
  seeAllCardText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#ff0000',
  },
});

export default BookingsList;
