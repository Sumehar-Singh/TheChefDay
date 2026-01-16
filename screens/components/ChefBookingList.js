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
      case 'Confirmed': return '#4CAF50';
      case 'Declined': return '#F44336';
      case 'Canceled': return '#F44336';
      case 'Cancelled': return '#F44336';
      case 'Pending': return '#FF9800';
      case 'Service Completed': return 'gray';
      default: return '#805500';
    }
  };

  // Helper to safely extract data
  const getField = (item, keys, fallback = '') => {
    if (!item) return fallback;
    for (const key of keys) {
      let val = item[key];
      if (val !== undefined && val !== null) {
        if (typeof val === 'string') val = val.trim();
        if (val !== '') return val;
      }
      // Check lowercase key
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
    // Robust lookup for User Image
    let userImage = getField(item, [
      'UserImage', 'userimage',
      'Image', 'image',
      'ProfileImage', 'profileimage',
      'ClientImage', 'clientimage',
      'CustomerImage', 'customerimage',
      'user_image', 'profile_image'
    ], null);

    // Check nested User object (if API returns joined object)
    if (!userImage && item.User && item.User.Image) {
      userImage = item.User.Image;
    }
    if (!userImage && item.user && item.user.image) {
      userImage = item.user.image;
    }

    // Fix Relative URLs
    if (userImage && typeof userImage === 'string' && !userImage.startsWith('http')) {
      // Assume it's relative to the server root if not absolute
      // BASE_URL is ".../server/chef/api/"
      // We guess images are at ".../server/"
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
            {/* User Image Area */}
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
                name="food" // Changed from calendar-clock to food (Service) to match User side? Or keep logic but style? 
                // User side uses 'food' icon for Service Type. 
                // ChefBookingList originally showed "Day Label" here. user asked for "same booking styling".
                // I will keep the DATA (Day Label) but style it like the User side's 3rd row. 
                // Or should I show Service Type? The API response in ChefBooking might not have ServiceType easily? 
                // I'll stick to Day Label but style it black/bold like User side Service Type.
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
    <View style={styles.container}>
      {/* ... Header remains ... */}
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
          keyExtractor={(item) => item.BookingID.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 15, // Reverted to 15
    padding: isTablet ? 20 : 15,
    marginBottom: 20,
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
    color: '#ff0000',
    fontWeight: '600',
    marginRight: 5,
  },
  bookingItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: isTablet ? 15 : 12,
    marginBottom: 10,
    // No red border
  },
  bookingItemLeft: {
    flex: 1,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  userImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingTextCustomer: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    color: '#000',
    flex: 1, // Allow text to take space between image and badge
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
  },
  bookingDetails: {
    // gap: 8, // Removed to match user side (gap sometimes issues)
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bookingTextEvent: {
    fontSize: isTablet ? 16 : 14,
    color: '#000',
    marginLeft: 8,
    fontWeight: '600',
  },
  bookingText: {
    fontSize: isTablet ? 16 : 14,
    color: '#000',
    marginLeft: 8,
    fontWeight: '600',
  },
  bookingTextService: {
    fontSize: isTablet ? 16 : 14,
    color: '#000', // Black, Bold
    marginLeft: 8,
    fontWeight: '600',
  },
  // ... empty styles ...
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    elevation: 3,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },
});

export default ChefBookingList;
