import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CustomStatusBar from '../../components/CustomStatusBar';
import CenterLoading from '../../components/CenterLoading';
import axios from 'axios';
import { BASE_URL } from '../../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getDistanceInMiles from '../../components/DistanceCalculator';
import { getUserCoords } from '../../components/utils';
import { useAuth } from '../../../components/contexts/AuthContext';
const { width, height } = Dimensions.get('window');
const isTablet = width > 600;
const radiusMiles = 200; // Global limit

const ChefsList = ({ navigation, route }) => {
  const { filterType } = route.params || { filterType: 'All' };
  const [chefs, setChefs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChefs, setFilteredChefs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const { profile } = useAuth();

  useEffect(() => {
    const getUserId = async () => {
      fetchChefs(profile.Id);
      const dimensions = await getUserCoords();
      setCoords(dimensions);
    };

    if (profile) getUserId();
    else fetchChefsForGuest();
  }, []);
  const navigateToChefDetail = (chefId) => {
    navigation.navigate('ChefDetail', {
      ChefId: chefId, // Pass the ChefId as a param (INT)

      // Passed these two because ChefId will be stored in Recent
      // UserId will get the chef data in ChefDetail screen
    });
  };
  const fetchChefs = async (userId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}chefs/get_chefs_list_with_booked.php`,
        {
          params: { UserID: userId },
        }
      );

      if (response.data.status === 'success') {
        let fetchedChefs = response.data.data;

        // 1. Global Filter: Enforce 200-mile radius if coords exist
        if (coords) {
          fetchedChefs = fetchedChefs.filter(chef =>
            getDistanceInMiles(coords.lat, coords.lon, chef.Lat, chef.Lon) <= 200
          );
        }

        // 2. Apply Specific Category Filters
        let finalChefs = [...fetchedChefs];

        if (filterType === 'Popular') {
          // Sort by Popularity Descending
          finalChefs.sort((a, b) => (b.Popularity || 0) - (a.Popularity || 0));
        } else if (filterType === 'Nearby') {
          // Sort by Distance Ascending
          if (coords) {
            finalChefs.sort((a, b) => {
              const distA = getDistanceInMiles(coords.lat, coords.lon, a.Lat, a.Lon);
              const distB = getDistanceInMiles(coords.lat, coords.lon, b.Lat, b.Lon);
              return distA - distB;
            });
          }
        } else if (filterType === 'Recent') {
          // Filter by Recent Logic (requires fetching recent IDs inside this component or passing them)
          // For simplify, we might need to fetch them here.
          // Ideally Recent IDs should be passed, but let's re-fetch for robustness
          const recentIds = await AsyncStorage.getItem('chefIds'); // Correct key from utils.js
          const parsedIds = recentIds ? JSON.parse(recentIds) : [];
          // Ensure type-safe comparison
          const safeParsedIds = parsedIds.map(id => String(id));

          finalChefs = finalChefs.filter(c => safeParsedIds.includes(String(c.ChefID)));

          // Sort by Recency: Newest viewed (last in safeParsedIds) comes first
          finalChefs.sort((a, b) => {
            const indexA = safeParsedIds.indexOf(String(a.ChefID));
            const indexB = safeParsedIds.indexOf(String(b.ChefID));
            return indexB - indexA; // Descending order
          });
        } else if (filterType === 'Random') {
          // Shuffle
          finalChefs = finalChefs.sort(() => 0.5 - Math.random());
        }

        setChefs(finalChefs);
        setFilteredChefs(finalChefs);
      }
    } catch (error) {
      console.error('Error fetching chefs:', error);
    }
  };

  const fetchChefsForGuest = async () => {
    try {
      const response = await axios.get(`${BASE_URL}guest/get_chefs_list.php`);

      if (response.data.status === 'success') {
        setChefs(response.data.data);
        setFilteredChefs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching chefs:', error);
    }
  };

  const handleSearch = () => {
    const filtered = chefs.filter(
      (chef) => chef.FirstName.toLowerCase().includes(searchQuery.toLowerCase())
      //||
      // chef.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      // chef.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredChefs(filtered);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setIsLoading(true);
    try {
      await fetchChefs();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  return (
    <LinearGradient
      colors={['white', '#f2f2f2', '#e6e6e6']}
      style={styles.container}
    >
      <CustomStatusBar title={`${filterType === 'All' ? 'Chefs List' : filterType + ' Chefs'}`} />
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color="#ff0000"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={
              isTablet
                ? 'Search by name, cuisine, location...'
                : 'Search by anything...'
            }
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color="white"
            style={styles.searchIcon}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ff0000']}
            tintColor="#ff0000"
          />
        }
      >
        {filteredChefs.filter((chef) => chef.Booked).length > 0 && (
          <Text style={styles.sectionTitle}>Booked Chefs</Text>
        )}
        {profile && (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filteredChefs.filter((chef) => chef.Booked)}
            keyExtractor={(item) => item.ChefID}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.bookedChefItem}
                onPress={() => navigateToChefDetail(item.ChefID)}
              >
                <Image source={{ uri: item.Image }} style={styles.chefImage} />
                <Text style={styles.chefName}>
                  {`${item.FirstName} ${item.MiddleName} ${item.LastName}`.trim()
                    .length > 13
                    ? `${`${item.FirstName} ${item.MiddleName} ${item.LastName}`
                      .trim()
                      .slice(0, 13)}...`
                    : `${item.FirstName} ${item.MiddleName} ${item.LastName}`.trim()}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.bookedChefsList}
          />
        )}

        <Text style={styles.sectionTitle}>All Chefs</Text>
        <FlatList
          data={filteredChefs}
          keyExtractor={(item) =>
            item.ChefID
              ? item.ChefID.toString()
              : `${item.id || 'chef'}-${Math.random()}`
          }
          scrollEnabled={false}
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
                style={styles.chefCardImage}
              />
              <View style={styles.chefInfo}>
                <Text style={styles.chefCardName}>
                  {`${item.FirstName} ${item.MiddleName} ${item.LastName}`.trim()
                    .length > 25
                    ? `${`${item.FirstName} ${item.MiddleName} ${item.LastName}`
                      .trim()
                      .slice(0, 25)}...`
                    : `${item.FirstName} ${item.MiddleName} ${item.LastName}`.trim()}
                </Text>

                <Text style={styles.chefDetails}>
                  Exp -{item.ExperienceYears} Years
                </Text>
                {/* <Text style={styles.chefRating}>⭐ {item.rating} | 📍 {item.location}</Text> */}
                <Text style={styles.chefRating}>
                  {coords &&
                    getDistanceInMiles(
                      coords.lat,
                      coords.lon,
                      item.Lat,
                      item.Lon
                    ) < radiusMiles &&
                    '~' +
                    getDistanceInMiles(
                      coords.lat,
                      coords.lon,
                      item.Lat,
                      item.Lon
                    ).toFixed(2) +
                    ' mi'}
                </Text>
                {item.HourlyRate || item.DayRate ? (
                  <View style={styles.hourDayRateContainer}>
                    <View style={[styles.rateBadge, styles.hourRateBadge]}>
                      <Text style={styles.rateText}>H: ${item.HourlyRate}</Text>
                    </View>
                    <View style={[styles.rateBadge, styles.dayRateBadge]}>
                      <Text style={styles.rateText}>D: ${item.DayRate}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.hourDayRateContainer}>
                    <View style={[styles.rateBadge, styles.dayRateBadge]}>
                      <Text style={styles.rateText}>
                        Rates are not mentioned
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.allChefsList}
        />
      </ScrollView>
      {isLoading && <CenterLoading />}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: isTablet ? 20 : 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  hourDayRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8, // optional if you're using React Native 0.71+
  },

  rateBadge: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },

  hourRateBadge: {
    backgroundColor: '#e0f7fa', // light cyan for hourly
  },

  dayRateBadge: {
    backgroundColor: '#ffe0b2', // light orange for daily
  },

  rateText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },

  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: isTablet ? 16 : 14,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#ff0000',
    borderRadius: 12,
    paddingLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: isTablet ? 20 : 15,
  },
  sectionTitle: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  bookedChefsList: {
    paddingBottom: 15,
  },
  bookedChefItem: {
    marginRight: 15,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chefImage: {
    width: isTablet ? 70 : 50,
    height: isTablet ? 70 : 50,
    borderRadius: isTablet ? 35 : 25,
    marginBottom: 8,
  },
  chefName: {
    fontSize: isTablet ? 16 : 12,
    fontWeight: '600',
    color: '#333',
  },
  allChefsList: {
    paddingBottom: 20,
  },
  chefCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: isTablet ? 15 : 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chefCardImage: {
    width: isTablet ? 80 : 65,
    height: isTablet ? 80 : 65,
    borderRadius: isTablet ? 40 : 32,
    marginRight: 15,
  },
  chefInfo: {
    flex: 1,
  },
  chefCardName: {
    fontSize: isTablet ? 18 : 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  chefDetails: {
    fontSize: isTablet ? 15 : 13,
    color: '#666',
    marginBottom: 5,
  },
  chefRating: {
    fontSize: isTablet ? 15 : 13,
    color: '#805500',
    fontWeight: '500',
  },
});

export default ChefsList;
