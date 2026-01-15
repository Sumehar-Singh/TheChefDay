import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BlueTick from '../../components/BlueTick';
import { BASE_URL } from '../../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CenterLoading from '../../components/CenterLoading';
const { width, height } = Dimensions.get('window');
const isTablet = width > 600;
import { getStoredChefIds, getUserCoords } from '../../components/utils';
import UserFullName from '../../components/strings/users/UserFullName';
import UserProfileImage from '../../components/strings/users/UserProfileImage';
import BookingsList from '../../components/BookingsList';
import getDistanceInMiles from '../../components/DistanceCalculator';
import { useAuth } from '../../../components/contexts/AuthContext';

const UserDashboard = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [allChefs, setAllChefs] = useState([]);
  const [recentChefIds, setRecentChefIds] = useState([]);
  const [userId, setUserId] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useAuth();

  const [coords, setCoords] = useState(null);
  const nearByMiles = 200; // Updated to 200 miles as per requirement


  const removeItemFromStorage = async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`${key} removed successfully`);
    } catch (error) {
      console.error('Error removing item from AsyncStorage:', error);
    }
  };

  const fetchRecentChefIds = async () => {
    const storedIds = await getStoredChefIds(); // Call the utility function to fetch ChefIds
    console.log('all Stored', storedIds);

    setRecentChefIds(storedIds);
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchRecentChefIds();
    }, [])
  );
  useEffect(() => {
    const removeAndFetch = async () => {
      await removeItemFromStorage('userCoords'); // Clear stored chefIds
    };
    //removeAndFetch();

    const getUserId = async () => {
      const dimensions = await getUserCoords();
      console.log('My Corr', dimensions);
      setCoords(dimensions);
    };
    getUserId();
    fetchAllChefs();
  }, []);

  const fetchAllChefs = async () => {
    try {
      const response = await axios.get(`${BASE_URL}chefs/get_chefs_list.php`);
      console.log(response.data.status);
      if (response.data.status === 'success') {
        setAllChefs(response.data.data);
      } else {
        console.log('No chefs found');
      }
    } catch (error) {
      console.error('Error fetching chefs:', error);
    }
  };

  const navigateToChefDetail = (chefId) => {
    navigation.navigate('ChefDetail', {
      ChefId: chefId, // Pass the ChefId as a param (INT)

      // Passed these two because ChefId will be stored in Recent
      // UserId will get the chef data in ChefDetail screen
    });
  };

  // const getRandomChefs = (count) => allChefs.sort(() => 0.5 - Math.random()).slice(0, count);
  // Optimize: Memoize safeRecentIds to prevent re-creation
  const safeRecentIds = React.useMemo(() => {
    return recentChefIds.map(id => String(id));
  }, [recentChefIds]);

  // Optimize: Memoize visibleChefs to prevent expensive filtering on every render
  const visibleChefs = React.useMemo(() => {
    return allChefs.filter((chef) => {
      if (!coords) return true; // detailed location not yet found, show all
      // Safety check for coordinates
      if (!chef.Lat || !chef.Lon) return false;
      return getDistanceInMiles(coords.lat, coords.lon, chef.Lat, chef.Lon) <= nearByMiles;
    });
  }, [allChefs, coords, nearByMiles]);

  const getRecentChefs = (count) => {
    const getRecentChefs = (count) => {
      const filteredChefs = visibleChefs.filter((chef) =>
        safeRecentIds.includes(String(chef.ChefID))
      );

      // Sort by Recency: Newest viewed (last in safeRecentIds) comes first
      filteredChefs.sort((a, b) => {
        const indexA = safeRecentIds.indexOf(String(a.ChefID));
        const indexB = safeRecentIds.indexOf(String(b.ChefID));
        return indexB - indexA; // Descending order
      });

      return filteredChefs.slice(0, count);
    };

    const getPopularChefs = (count) => {
      // IMPORTANT: Create a copy before sorting to avoid mutating the memoized array
      return [...visibleChefs].sort((a, b) => b.Popularity - a.Popularity).slice(0, count);
    };

    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const sections = [
      {
        title: 'Recently Viewed',
        data: getRecentChefs(5),
      },
      {
        title: 'Random Picks',
        data: shuffleArray(visibleChefs).slice(0, 8),
      },
      {
        title: 'Nearby Chefs',
        // Sort by distance
        data: [...visibleChefs].sort((a, b) => {
          if (!coords) return 0;
          const distA = getDistanceInMiles(coords.lat, coords.lon, a.Lat, a.Lon);
          const distB = getDistanceInMiles(coords.lat, coords.lon, b.Lat, b.Lon);
          return distA - distB;
        }).slice(0, 5),
      },
      {
        title: 'Popular Chefs',
        data: getPopularChefs(2),
      },
    ];

    // const nearbyChefs = getRandomChefs(5);

    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      setIsLoading(true);
      try {
        await Promise.all([
          fetchAllChefs(),
          fetchRecentChefIds(),
          //fetchBookings()
        ]);
      } catch (error) {
        console.error('Error refreshing data:', error);
      } finally {
        setRefreshing(false);
        setIsLoading(false);
      }
    }, []);

    // Don't render anything if there's no profile
    if (!profile) {
      return null;
    }

    return (
      <View style={styles.superContainer}>
        <StatusBar backgroundColor="transparent" barStyle="light-content" translucent={true} />

        <LinearGradient
          colors={['#ff0000', '#c90000']}
          style={[styles.headerGradient, { paddingTop: insets.top }]}
        >
          <TouchableOpacity
            style={styles.headerContainer}
            onPress={() => navigation.navigate('UserSettings')}
          >
            <View style={styles.profileContainer}>
              <UserProfileImage
                userId={profile.Id}
                height={70}
                width={70}
                mr={15}
                style={styles.profileImage}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.headerTitle}>
                  <UserFullName userId={profile.Id} />
                </Text>
                <Text style={styles.headDesc}>User Dashboard</Text>
              </View>
            </View>
            <View style={styles.editButton}>
              <MaterialCommunityIcons
                name="cog-outline"
                size={isTablet ? 40 : 25}
                color="#fff"
              />
            </View>
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#ff0000']}
              tintColor="#ff0000"
            />
          }
        >

          <View style={{ marginTop: 25 }}>
            {sections.map((section, index) => (
              <View
                key={`section-${section.title}-${index}`}
                style={styles.sectionContainer}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <MaterialCommunityIcons
                      name={
                        section.title.includes('Recently')
                          ? 'clock-outline'
                          : section.title.includes('Random')
                            ? 'dice-multiple'
                            : section.title.includes('Nearby')
                              ? 'map-marker'
                              : 'fire'
                      }
                      size={isTablet ? 28 : 24}
                      color="#ff0000"
                    />
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.seeAllButton}
                    onPress={() => {
                      let filterType = 'All';
                      if (section.title.includes('Recently')) filterType = 'Recent';
                      else if (section.title.includes('Random')) filterType = 'Random';
                      else if (section.title.includes('Nearby')) filterType = 'Nearby';
                      else if (section.title.includes('Popular')) filterType = 'Popular';

                      navigation.navigate('ChefsList', { filterType });
                    }}
                  >
                    <Text style={styles.seeAllText}>View All</Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={isTablet ? 24 : 20}
                      color="#209E00"
                    />
                  </TouchableOpacity>
                </View>

                <FlatList
                  horizontal
                  data={section.data}
                  keyExtractor={(item, idx) =>
                    item.ChefID.toString()
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.chefCard}
                      onPress={() => navigateToChefDetail(item.ChefID)}
                    >
                      <Image
                        source={
                          item.Image
                            ? { uri: item.Image }
                            : require('../../../assets/userImage.jpg')
                        }
                        style={styles.chefImage}
                      />
                      <Text style={styles.chefName}>{item.FirstName}</Text>
                      <Text style={styles.chefExperience}>
                        {item.ExperienceYears} yrs
                      </Text>
                      <Text style={styles.chefDistance}>
                        {coords &&
                          getDistanceInMiles(
                            coords.lat,
                            coords.lon,
                            item.Lat,
                            item.Lon
                          ) < nearByMiles &&
                          '~' +
                          getDistanceInMiles(
                            coords.lat,
                            coords.lon,
                            item.Lat,
                            item.Lon
                          ).toFixed(2) +
                          ' mi'}
                      </Text>
                    </TouchableOpacity>
                  )
                  }
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chefListContent}
                />
              </View>
            ))}
          </View>

          {profile.Id && (
            <View style={styles.bookingsSection}>
              <BookingsList UserID={profile.Id} navigation={navigation} limit={5} />
              <TouchableOpacity
                style={styles.bookingsCtaCard}
                onPress={() => navigation.navigate('AllBookings')}
                activeOpacity={0.8}
              >
                <View style={styles.bookingsCtaLeft}>
                  <MaterialCommunityIcons
                    name="calendar-multiple-check"
                    size={22}
                    color="#cc0000"
                  />
                  <Text style={styles.bookingsCtaText}>View All Bookings</Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#cc0000"
                />
              </TouchableOpacity>
            </View>
          )
          }
        </ScrollView >
        {isLoading && <CenterLoading />}
      </View >
    );
  };

  const styles = StyleSheet.create({
    superContainer: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    container: {
      flex: 1,
    },
    headerGradient: {
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      marginBottom: 0,
    },
    headerContainer: {
      paddingTop: isTablet ? 15 : 8,
      paddingBottom: isTablet ? 20 : 15,
      paddingHorizontal: isTablet ? 20 : 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    bookingItem: {
      backgroundColor: '#f8f8f8',
      borderRadius: 12,
      padding: isTablet ? 15 : 12,
      marginBottom: 10,
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
    profileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    profileInfo: {
      flex: 1,
    },
    profileImage: {
      borderRadius: 35,
      borderWidth: 3,
      borderColor: '#fff',
    },
    headerTitle: {
      fontSize: isTablet ? 24 : 18,
      fontWeight: '700',
      color: '#fff',
      marginBottom: 4,
    },
    headDesc: {
      fontSize: isTablet ? 16 : 14,
      color: '#fff',
      opacity: 0.9,
    },
    editButton: {
      padding: 10,
    },
    sectionContainer: {
      marginBottom: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
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
    chefListContent: {
      paddingHorizontal: 10,
    },
    chefCard: {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: isTablet ? 15 : 12,
      width: isTablet ? 180 : 160,
      height: isTablet ? 250 : 200,
      alignItems: 'center',
      marginHorizontal: isTablet ? 8 : 8,
      marginBottom: isTablet ? 10 : 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06, // Very light
      shadowRadius: 6,
      elevation: 3, // Subtle lift
      borderWidth: 1,
      borderColor: '#f0f0f0',
    },
    chefImage: {
      width: isTablet ? 100 : 90,
      height: isTablet ? 100 : 90,
      borderRadius: isTablet ? 50 : 45,
      marginBottom: isTablet ? 12 : 10,
      borderWidth: 2,
      borderColor: '#f8f8f8',
    },
    chefName: {
      fontSize: isTablet ? 18 : 15,
      fontWeight: '700',
      marginTop: 4,
      color: '#1a1a1a',
      textAlign: 'center',
      numberOfLines: 1,
    },
    chefExperience: {
      fontSize: isTablet ? 14 : 12,
      color: '#666',
      marginTop: 4,
      fontWeight: '500',
    },
    chefDistance: {
      fontSize: isTablet ? 13 : 11,
      color: '#e63946',
      marginTop: 6,
      fontWeight: '600',
      backgroundColor: '#fff0f0',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      overflow: 'hidden',
    },
    seeAllCard: {
      justifyContent: 'center',
      alignItems: 'center',
      width: isTablet ? 180 : 150,
      height: isTablet ? 240 : 180,
      backgroundColor: '#f6f6f6',
    },
    seeAllCardText: {
      fontSize: isTablet ? 16 : 14,
      fontWeight: '600',
      color: '#209E00',
    },
    bookingsSection: {
      marginTop: 10,
    },
    bookingsCtaCard: {
      backgroundColor: '#fff',
      borderRadius: 12,
      paddingVertical: isTablet ? 16 : 14,
      paddingHorizontal: isTablet ? 18 : 16,
      marginTop: 8,
      marginHorizontal: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: '#eaeaea',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
      marginBottom: 50,
    },
    bookingsCtaLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    bookingsCtaText: {
      fontSize: isTablet ? 18 : 16,
      fontWeight: '700',
      color: '#cc0000',
      marginLeft: 10,
    },
  });

  export default UserDashboard;
