import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { formatDate, getEventDayLabel } from './utils';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const BookingsList = ({ UserID, navigation, limit, showHeader = true, showViewAll = true }) => {
  const [bookings, setBookings] = useState(null);
  const [loading, setLoading] = useState(true);

  // ... (useEffect remains same) ...

  // ... (normalizeBooking remains same) ...

  // ... (getStatusColor and EmptyBookings remain same) ...

  if (loading) {
    return <ActivityIndicator size="large" color="#ff0000" />;
  }

  // Determine if we should show the list or the empty state
  const hasBookings = bookings && bookings.length > 0;

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <MaterialCommunityIcons
              name="calendar-check"
              size={isTablet ? 28 : 24}
              color="#ff0000"
            />
            <Text style={styles.sectionTitle}>Your Bookings</Text>
          </View>
          {hasBookings && showViewAll && (
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('AllBookings')}
            >
              <Text style={styles.seeAllText}>View All</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={isTablet ? 24 : 20}
                color="#209E00"
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {!hasBookings ? (
        <EmptyBookings />
      ) : (
        <>
          {bookings.map((rawItem, index) => {
            const item = normalizeBooking(rawItem);
            return (
              <TouchableOpacity
                key={
                  item.BookingId?.toString() ??
                  `booking-${index}`
                }
                style={styles.bookingItem}
                onPress={() =>
                  navigation.navigate('BookingDetail', {
                    BookingID: item.BookingId,
                  })
                }
              >
                <View style={styles.bookingItemLeft}>
                  <View style={styles.bookingHeader}>
                    <Text style={styles.bookingTextCustomer}>
                      {item.ChefName || `Booking #${item.BookingId || '?'}`}
                    </Text>
                  </View>
                  <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons
                        name="calendar"
                        size={isTablet ? 20 : 16}
                        color="#ff0000"
                      />
                      <Text style={styles.bookingTextEvent}>
                        Event: {item.EventDate ? formatDate(item.EventDate) : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={isTablet ? 20 : 16}
                        color="#ff0000"
                      />
                      <Text style={styles.bookingText}>
                        Booked: {item.BookingDate ? formatDate(item.BookingDate) : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons
                        name="food"
                        size={isTablet ? 20 : 16}
                        color="#ff0000"
                      />
                      <Text style={styles.bookingTextService}>
                        {item.ServiceType || 'Service'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(item.Status) },
                      ]}
                    >
                      <Text style={styles.statusText}>{item.Status || 'Unknown'}</Text>
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
