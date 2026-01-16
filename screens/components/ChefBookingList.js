import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { formatDate, getEventDayLabel } from './utils';

const { width } = Dimensions.get('window');
const isTablet = width > 600;
const PAGE_SIZE = 20;

const ChefBookingList = ({ navigation, userId, limit, showHeader = true, showViewAll = true }) => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchChefBookings = useCallback(async (pageNum = 1) => {
    if (!userId) return;

    const form = new FormData();
    form.append('ChefID', userId);

    const currentLimit = limit ? limit : PAGE_SIZE;
    const currentOffset = limit ? 0 : (pageNum - 1) * PAGE_SIZE;

    form.append('Limit', currentLimit);
    form.append('Offset', currentOffset);

    try {
      const response = await axios.post(
        `${BASE_URL}chefs/get_chef_bookings.php`,
        form,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.data.success) {
        const newData = response.data.data || [];

        if (limit) {
          setBookings(newData);
        } else {
          if (pageNum === 1) {
            setBookings(newData);
          } else {
            setBookings(prev => [...prev, ...newData]);
          }

          if (newData.length < PAGE_SIZE) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
        }
      } else {
        if (pageNum === 1) setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      if (pageNum === 1) setBookings([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    setIsLoading(true);
    setPage(1);
    fetchChefBookings(1);
  }, [fetchChefBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchChefBookings(1);
  };

  const loadMoreData = () => {
    if (limit) return;
    if (loadingMore || isLoading) return;
    if (!hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchChefBookings(nextPage);
  };

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
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return '#4CAF50';
      case 'Declined': return '#F44336';
      case 'Canceled': return '#F44336';
      case 'Cancelled': return '#F44336';
      case 'Pending': return '#FF9800';
      case 'Service Completed': return 'gray';
      default: return '#805500';
    }
  };

  const getField = (item, keys, fallback = '') => {
    if (!item) return fallback;
    for (const key of keys) {
      let val = item[key];
      if (val !== undefined && val !== null) {
        if (typeof val === 'string') val = val.trim();
        if (val !== '') return val;
      }
      const lowerKey = key.toLowerCase();
      val = item[lowerKey];
      if (val !== undefined && val !== null) {
        if (typeof val === 'string') val = val.trim();
        if (val !== '') return val;
      }
    }
    return fallback;
  };

  const renderItem = ({ item }) => {
    let userImage = getField(item, [
      'UserImage', 'userimage',
      'Image', 'image',
      'ProfileImage', 'profileimage',
      'ClientImage', 'clientimage',
      'CustomerImage', 'customerimage',
      'user_image', 'profile_image'
    ], null);

    if (!userImage && item.User && item.User.Image) {
      userImage = item.User.Image;
    }
    if (!userImage && item.user && item.user.image) {
      userImage = item.user.image;
    }

    if (userImage && typeof userImage === 'string' && !userImage.startsWith('http')) {
      userImage = `https://thechefday.com/server/${userImage.replace(/^\//, '')}`;
    }

    const userName = getField(item, ['UserName', 'username', 'Name', 'name'], 'Unknown User');

    return (
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
            {userImage ? (
              <Image
                source={{ uri: userImage }}
                style={styles.userImage}
              />
            ) : (
              <View style={styles.userImagePlaceholder}>
                <MaterialCommunityIcons name="account" size={20} color="#666" />
              </View>
            )}

            <Text style={styles.bookingTextCustomer}>
              {userName}
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
                size={16}
                color="#ff0000"
              />
              <Text style={styles.bookingTextEvent}>
                Event: {formatDate(item.EventDate)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color="#ff0000"
              />
              <Text style={styles.bookingText}>
                Booked: {formatDate(item.BookingDate)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons
                name="food"
                size={16}
                color="#ff0000"
              />
              <Text style={styles.bookingTextService}>
                {getEventDayLabel(item.EventDate)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, !limit && { flex: 1, marginBottom: 0 }]}>
      {showHeader && (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <MaterialCommunityIcons
              name="calendar-check"
              size={isTablet ? 28 : 24}
              color="#ff0000"
            />
            <Text style={styles.sectionTitle}>My Bookings</Text>
          </View>
          {bookings.length > 0 && limit && showViewAll && (
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
      )}

      {isLoading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff0000" />
        </View>
      ) : bookings.length === 0 ? (
        <EmptyBookings />
      ) : (
        <FlatList
          scrollEnabled={!limit}
          data={bookings}
          keyExtractor={(item) => item.BookingID ? item.BookingID.toString() : Math.random().toString()}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={!limit ? onRefresh : null}
          onEndReached={!limit ? loadMoreData : null}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#ff0000" style={{ padding: 10 }} /> : null}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // If limit is set (Dashboard style), keep card container style. 
    // If infinite list (AllBookings), we want it to fill fetching area, but sharing styles is fine.
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 15,
    padding: isTablet ? 20 : 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20, // Add bottom margin for safe spacing
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
    color: '#ff0000',
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
    color: '#000',
    marginLeft: 8,
    fontWeight: '600',
  },
  bookingText: {
    fontSize: isTablet ? 16 : 14,
    color: '#000', // Matches uniform look
    marginLeft: 8,
    fontWeight: '600', // Match Service weight
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChefBookingList;
