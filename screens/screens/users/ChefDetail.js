import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomStatusBar from '../../components/CustomStatusBar';
import { useRoute } from '@react-navigation/native';
import { storeChefId } from '../../components/utils';
import axios from 'axios';
import { BASE_URL } from '../../../config';
import StarRating from '../../components/StarRating';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CenterLoading from '../../components/CenterLoading';
import getDistanceInMiles from '../../components/DistanceCalculator';
import { getUserCoords } from '../../components/utils';
import { useAuth } from '../../../components/contexts/AuthContext';
import { ChefPropertiesForProfile } from '../../components/ChefPropertiesForProfile';
const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const ChefDetail = ({ navigation }) => {
  const [reviews, setReviews] = useState([]);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [distance, setDistance] = useState(0);
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState(0);
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const route = useRoute();
  const { ChefId } = route.params; //this is int chef Id
  const { profile } = useAuth();

  const [HourlyRate, setHourlyRate] = useState('');
  const [DayRate, setDayRate] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [chefProperties, setChefProperties] = useState([]);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [selectedReview, setSelectedReview] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editReview, setEditReview] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const fetchPricing = async (ChefID) => {
    try {
      const form = new FormData();
      form.append('ChefID', ChefID);

      const response = await axios.post(
        `${BASE_URL}/chefs/get_chef_pricing.php`,
        form,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.data.success && response.data.data) {
        setHourlyRate(response.data.data.HourlyRate.toString());
        setDayRate(response.data.data.DayRate.toString());
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
    } finally {
      setRatesLoading(false);
    }
  };
  const getChefData = async (chefId) => {
    setRatesLoading(true);

    const fetchCoords = async (cLat, cLon) => {
      const dimensions = await getUserCoords();

      setDistance(
        getDistanceInMiles(dimensions.lat, dimensions.lon, cLat, cLon)
      );
    };

    try {
      const response = await axios.get(`${BASE_URL}chefs/get_chef_data.php`, {
        params: { ChefID: chefId },

        // it is passing the Int chef Id to get the data from Chefs table
      });

      if (response.data.status === 'success') {
        fetchPricing(chefId);
        const chef = response.data.data;

        setFullName(
          chef[0].FirstName + ' ' + chef[0].MiddleName + ' ' + chef[0].LastName
        );
        setBio(chef[0].Bio);
        setAddress(chef[0].Address);
        setExperience(chef[0].ExperienceYears); // Convert number to string for TextInput
        setPhone(chef[0].Phone);
        setProfileImage(chef[0].Image);
        if (profile != null) fetchCoords(chef[0].Lat, chef[0].Lon);
        const cProperties = await ChefPropertiesForProfile(chefId);
        setChefProperties(cProperties);
        console.log('Chef Properties', cProperties);
      } else {
        console.log('Error:', response.data.message);
        setRatesLoading(false);
      }
    } catch (error) {
      console.error('Error fetching chef data:', error);
      setRatesLoading(false);
    }
  };

  const navigateToAddBooking = () => {
    if (!profile) {
      navigation.navigate('LoginScreen');
      return;
    }

    navigation.navigate('AddBooking', {
      ChefId: ChefId,
    });
  };

  useEffect(() => {
    // Store this chef in "Recently Viewed"
    // Argument Order: (chefId, userId)
    storeChefId(ChefId, profile?.Id);

    getChefData(ChefId);
    fetchPricing(ChefId);
    // Start flip animation when component mounts
    Animated.timing(flipAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [ChefId]);

  const chef = {
    name: fullName,
    experience: experience,
    cuisine: 'Italian, French, Indian',
    location: address,

    image: profileImage,
  };
  const handleSubmitReview = async () => {
    if (!review.trim() || rating === 0) {
      Alert.alert('Review Required', 'Please rate your experience and write a review.');
      return;
    }

    if (!profile) {
      navigation.navigate('LoginScreen');
      return;
    }

    const formData = new FormData();
    formData.append('ChefID', ChefId); // This is the chef's ID (int)
    formData.append('UserID', profile.Id); // This is the logged-in user's ID (int)
    formData.append('Rating', rating);
    formData.append('ReviewText', review);

    try {
      const response = await axios.post(
        `${BASE_URL}users/add_review.php`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Review submitted successfully.');
        setReview('');
        setRating(0);
        fetchChefReviews(); // Refresh reviews
      } else {
        // Check for duplicate review message
        if (
          response.data.message ===
          'You have already submitted a review for this chef.'
        ) {
          Alert.alert(
            'Alert',
            'You have already submitted a review for this chef.'
          );
        } else {
          Alert.alert(
            'Error',
            response.data.message || 'Failed to submit review.'
          );
        }
      }
    } catch (error) {
      console.error('Review submit error:', error);
      Alert.alert(
        'Error',
        'Something went wrong while submitting your review.'
      );
    }
  };

  const fetchChefReviews = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}users/get_chef_reviews.php`,
        {
          params: { ChefID: ChefId, Limit: 8 },
        }
      );
      if (response.data.success) {
        setReviews(response.data.data);
      } else {
        console.log('Review fetch error:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    if (ChefId) {
      fetchChefReviews();
    }
  }, [ChefId]);

  const averageRating = reviews
    ? (
      reviews.reduce((sum, item) => sum + parseInt(item.Rating), 0) /
      reviews.length
    ).toFixed(1)
    : '0.0';

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString.replace(' ', 'T'));
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  const truncateText = (text, maxLength = 140) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '…' : text;
  };

  const handleLongPress = (item, pageX, pageY) => {
    if (!profile || !profile.Id) return;
    if (item.UserID != profile.Id) return; // Only own review gets menu
    console.log('Profile ID', profile.Id);
    console.log('User ID', item.UserID);
    console.log('PageX:', pageX, 'PageY:', pageY);
    const MENU_WIDTH = 200;
    const MENU_HEIGHT = 160;
    const PADDING = 8;
    let left = pageX;
    let top = pageY;
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;

    if (left + MENU_WIDTH + PADDING > screenWidth) {
      left = screenWidth - MENU_WIDTH - PADDING;
    }
    if (top + MENU_HEIGHT + PADDING > screenHeight) {
      top = screenHeight - MENU_HEIGHT - PADDING;
    }

    console.log('Final position - left:', left, 'top:', top);
    setSelectedReview(item);
    setContextMenuPosition({ x: left, y: top });
    setContextMenuVisible(true);
  };

  const closeContextMenu = () => {
    setContextMenuVisible(false);
  };

  const openViewModal = async () => {
    if (!selectedReview) return;
    try {
      setModalLoading(true);
      // Optional: fetch full review details
      const response = await axios.get(
        `${BASE_URL}users/view_chef_review.php`,
        {
          params: { ReviewID: selectedReview.ReviewID },
        }
      );
      if (response.data && response.data.success && response.data.data) {
        const data = response.data.data;
        setSelectedReview((prev) => ({ ...prev, ...data }));
      }
    } catch (e) {
      // Fallback to existing selectedReview
    } finally {
      setModalLoading(false);
      setViewModalVisible(true);
      closeContextMenu();
    }
  };

  const openUpdateModal = () => {
    if (!selectedReview) return;
    setEditRating(parseInt(selectedReview.Rating));
    setEditReview(selectedReview.ReviewText || '');
    setUpdateModalVisible(true);
    closeContextMenu();
  };

  const confirmDelete = () => {
    setDeleteModalVisible(true);
    closeContextMenu();
  };

  const handleUpdateReview = async () => {
    if (!selectedReview) return;
    if (!editReview.trim() || editRating === 0) {
      Alert.alert('Error', 'Please provide rating and review text.');
      return;
    }
    try {
      setModalLoading(true);
      const formData = new FormData();
      formData.append('ReviewID', selectedReview.ReviewID);
      formData.append('UserID', profile.Id);
      formData.append('ChefID', ChefId);
      formData.append('Rating', editRating);
      formData.append('ReviewText', editReview);
      const response = await axios.post(
        `${BASE_URL}users/update_chef_review.php`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      if (response.data && response.data.success) {
        Alert.alert('Success', 'Review updated.');
        setUpdateModalVisible(false);
        await fetchChefReviews();
      } else {
        Alert.alert(
          'Error',
          response.data?.message || 'Failed to update review.'
        );
      }
    } catch (e) {
      console.error('Update review error:', e);
      Alert.alert('Error', 'Something went wrong updating the review.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!selectedReview) return;
    try {
      setModalLoading(true);
      const formData = new FormData();
      formData.append('ReviewID', selectedReview.ReviewID);
      formData.append('UserID', profile.Id);
      const response = await axios.post(
        `${BASE_URL}users/delete_chef_review.php`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      if (response.data && response.data.success) {
        Alert.alert('Deleted', 'Your review has been deleted.');
        setDeleteModalVisible(false);
        setSelectedReview(null);
        await fetchChefReviews();
      } else {
        Alert.alert(
          'Error',
          response.data?.message || 'Failed to delete review.'
        );
      }
    } catch (e) {
      console.error('Delete review error:', e);
      Alert.alert('Error', 'Something went wrong deleting the review.');
    } finally {
      setModalLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setIsLoading(true);
    try {
      setRatesLoading(true);
      await Promise.all([getChefData(ChefId), fetchChefReviews()]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  }, [ChefId]);

  return (
    <LinearGradient colors={['#f8f8f8', '#eaeaea']} style={styles.container}>
      <CustomStatusBar title="Chef Details" />
      {contextMenuVisible && (
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={closeContextMenu}
        >
          <View
            style={[
              styles.contextMenu,
              { left: contextMenuPosition.x, top: contextMenuPosition.y },
            ]}
          >
            <TouchableOpacity style={styles.menuItem} onPress={openViewModal}>
              <Text style={styles.menuItemText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={openUpdateModal}>
              <Text style={styles.menuItemText}>Update Review</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemDanger]}
              onPress={confirmDelete}
            >
              <Text style={[styles.menuItemText, styles.menuItemDangerText]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#805500']}
            tintColor="#805500"
          />
        }
      >
        {/* Chef Profile */}
        <View style={styles.profileContainer}>
          <View style={styles.profileHeader}>
            <Animated.View
              style={[
                styles.imageContainer,
                {
                  transform: [
                    {
                      rotateY: flipAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['180deg', '0deg'],
                      }),
                    },
                    { perspective: 1000 }, // This is important for 3D effect
                  ],
                  opacity: flipAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.5, 1],
                  }),
                },
              ]}
            >
              <Image
                source={
                  chef.image
                    ? { uri: chef.image }
                    : require('../../../assets/userImage.jpg')
                }
                style={[styles.chefImage, { backfaceVisibility: 'hidden' }]}
              />
            </Animated.View>
            <View style={styles.profileInfo}>
              <Text style={styles.chefName}>{chef.name}</Text>
              {averageRating !== '0.0' && (
                <View style={styles.ratingContainer}>
                  <StarRating
                    rating={parseFloat(averageRating)}
                    readOnly
                    size={isTablet ? 28 : 22}
                    activeColor="#ff9900"
                    inactiveColor="#e5e7eb"
                    spacing={4}
                  />
                  <Text style={styles.ratingValue}>{averageRating}</Text>
                </View>
              )}
            </View>
          </View>
          {ratesLoading ? (
            <View style={styles.bookButtonLoading}>
              <ActivityIndicator
                color="#805500"
                size={isTablet ? 'large' : 'small'}
              />
              <Text style={styles.bookButtonLoadingText}>
                Checking availability...
              </Text>
            </View>
          ) : HourlyRate && DayRate ? (
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => navigateToAddBooking()}
              activeOpacity={0.8}
            >
              <Text style={styles.bookButtonText}>
                {profile ? 'Book Now' : 'Login to book this chef'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.bookingError}>
              Booking is unavailable as this chef has not yet set their hourly
              and daily rates. Please check back later.
            </Text>
          )}

          <View style={styles.detailsContainer}>
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Hourly Rate</Text>
                <Text style={styles.detailValue}>
                  {' '}
                  {HourlyRate ? '$' + HourlyRate : 'Not set'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Day Rate</Text>
                <Text style={styles.detailValue}>
                  {' '}
                  {DayRate ? '$' + DayRate : 'Not set'}
                </Text>
              </View>
            </View>
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Location</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Text style={styles.detailValue}>📍 </Text>
                  <Text style={[styles.detailValue, { flex: 1 }]}>
                    {address}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Distance from you</Text>
                {profile ? (
                  <Text style={styles.detailValue}>
                    ~ {distance.toFixed(2)} miles
                  </Text>
                ) : (
                  <Text style={styles.detailValueRed}>Login Required</Text>
                )}
              </View>
            </View>

            {/* Chef Properties Section */}
            <View style={styles.propertiesContainer}>
              {chefProperties && chefProperties.length > 0 ? (
                chefProperties.map((property, index) => (
                  <View
                    key={`property-${property.PropertyName}-${index}`}
                    style={styles.propertyItem}
                  >
                    <Text style={styles.detailLabel}>
                      {property.PropertyName}
                    </Text>
                    <Text style={styles.detailValue}>
                      {property.Specialties}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.propertyItem}>
                  <Text style={styles.detailLabel}>Properties</Text>
                  <Text style={styles.detailValue}>
                    No additional properties available
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Experience</Text>
                <Text style={styles.detailValue}>{chef.experience} Years</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Book Now Button */}

        {/* Add Review Section - Modern Design */}
        <View style={styles.modernReviewSection}>
          <View style={styles.reviewSectionHeader}>
            <View style={styles.reviewHeaderIcon}>
              <Text style={styles.reviewHeaderEmoji}>⭐</Text>
            </View>
            <View style={styles.reviewHeaderText}>
              <Text style={styles.reviewSectionTitle}>
                Share Your Experience
              </Text>
              <Text style={styles.reviewSectionSubtitle}>
                Help others by sharing your thoughts
              </Text>
            </View>
          </View>

          <View style={styles.modernReviewForm}>
            {/* Rating Section */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Rate your experience</Text>
              <View style={styles.modernStarContainer}>
                <StarRating
                  rating={rating}
                  onChange={setRating}
                  size={isTablet ? 40 : 36}
                  activeColor="#FFD700"
                  inactiveColor="#E5E7EB"
                  spacing={12}
                />
                {rating > 0 && (
                  <Text style={styles.ratingText}>
                    {rating === 1
                      ? 'Poor'
                      : rating === 2
                        ? 'Fair'
                        : rating === 3
                          ? 'Good'
                          : rating === 4
                            ? 'Very Good'
                            : 'Excellent'}
                  </Text>
                )}
              </View>
            </View>

            {/* Review Text Section */}
            <View style={styles.textSection}>
              <Text style={styles.textLabel}>
                Tell us more about your experience
              </Text>
              <View style={styles.modernTextInputContainer}>
                <TextInput
                  style={styles.modernTextInput}
                  placeholder={`Share details for ${chef.name} about the food quality, service, cleanliness, or anything else that stood out...`}
                  value={review}
                  onChangeText={(text) => {
                    if (text.length <= 500) {
                      setReview(text);
                    }
                  }}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                  maxLength={500}
                />
                <View style={styles.characterCount}>
                  <Text style={styles.characterCountText}>
                    {review.length}/500
                  </Text>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.modernSubmitButton}
              onPress={handleSubmitReview}
              activeOpacity={0.8}
            >
              <View style={styles.submitButtonContent}>
                <Text style={styles.modernSubmitButtonText}>
                  {profile ? 'Submit Review' : 'Submit Review'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={[styles.sectionContainer, { position: 'relative' }]}>
          <Text style={styles.sectionTitle}>User Reviews</Text>
          {reviews && reviews.length > 0 ? (
            <FlatList
              data={reviews}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onLongPress={(e) =>
                    handleLongPress(
                      item,
                      e.nativeEvent.pageX || 0,
                      e.nativeEvent.pageY || 0
                    )
                  }
                >
                  <View style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewUser}>{item.UserName}</Text>
                        <Text style={styles.reviewDate}>
                          {formatDate(item.CreatedAt)}
                        </Text>
                      </View>
                      <View style={styles.reviewRating}>
                        {[...Array(5)].map((_, index) => (
                          <Text key={index} style={styles.star}>
                            {index < item.Rating ? '★' : '☆'}
                          </Text>
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewText}>
                      {truncateText(item.ReviewText)}
                    </Text>
                    {profile?.Id === item.UserID && (
                      <Text style={styles.ownReviewHint}>
                        Long-press to manage your review
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.noReviewsContainer}>
              <Text style={styles.noReviewsText}>No reviews yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
      {isLoading && <CenterLoading />}
      {/* View Modal */}
      <Modal
        visible={viewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setViewModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Review Details</Text>
            {modalLoading ? (
              <ActivityIndicator color="#805500" />
            ) : (
              <View>
                <View style={styles.modalRatingRow}>
                  {[...Array(5)].map((_, index) => (
                    <Text key={index} style={styles.star}>
                      {index < (selectedReview?.Rating || 0) ? '★' : '☆'}
                    </Text>
                  ))}
                </View>
                <Text style={styles.modalDate}>
                  {selectedReview ? formatDate(selectedReview.CreatedAt) : ''}
                </Text>
                <Text style={styles.modalBody}>
                  {selectedReview?.ReviewText}
                </Text>
              </View>
            )}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={() => setViewModalVisible(false)}
              >
                <Text style={styles.modalPrimaryText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Update Modal */}
      <Modal
        visible={updateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setUpdateModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCardLarge}>
            <Text style={styles.modalTitle}>Update Review</Text>
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Update your rating</Text>
              <View style={styles.modernStarContainer}>
                <StarRating
                  rating={editRating}
                  onChange={setEditRating}
                  size={isTablet ? 40 : 36}
                  activeColor="#FFD700"
                  inactiveColor="#E5E7EB"
                  spacing={12}
                />
              </View>
            </View>
            <View style={styles.textSection}>
              <Text style={styles.textLabel}>Update your review</Text>
              <View style={styles.modernTextInputContainer}>
                <TextInput
                  style={styles.modernTextInput}
                  placeholder={`Update details for ${chef.name}...`}
                  value={editReview}
                  onChangeText={(text) => {
                    if (text.length <= 500) setEditReview(text);
                  }}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                  maxLength={500}
                />
                <View style={styles.characterCount}>
                  <Text style={styles.characterCountText}>
                    {editReview.length}/500
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.modalActionsSpread}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setUpdateModalVisible(false)}
              >
                <Text style={styles.modalSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={handleUpdateReview}
                disabled={modalLoading}
              >
                <Text style={styles.modalPrimaryText}>
                  {modalLoading ? 'Updating...' : 'Update'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete Review</Text>
            <Text style={styles.modalBody}>
              Are you sure you want to delete this review?
            </Text>
            <View style={styles.modalActionsSpread}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.modalSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDangerBtn}
                onPress={handleDeleteReview}
                disabled={modalLoading}
              >
                <Text style={styles.modalDangerText}>
                  {modalLoading ? 'Deleting...' : 'Delete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: isTablet ? 14 : 10,
    alignItems: 'center',
  },
  profileContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: isTablet ? 18 : 8,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 1,
    width: '100%',
    maxWidth: 900,
  },
  profileHeader: {
    flexDirection: isTablet ? 'row' : 'column',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageContainer: {
    width: isTablet ? 150 : 120,
    height: isTablet ? 150 : 120,
    borderRadius: isTablet ? 75 : 60,
    backgroundColor: 'white',
    padding: 3,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginRight: isTablet ? 20 : 0,
  },
  chefImage: {
    width: '100%',
    height: '100%',
    borderRadius: isTablet ? 75 : 60,
    borderWidth: 3,
    borderColor: '#ffb300',
  },
  profileInfo: {
    flex: 1,
    alignItems: isTablet ? 'flex-start' : 'center',
  },
  chefName: {
    fontSize: isTablet ? 28 : 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: isTablet ? 0 : 15,
    marginBottom: 8,
    textAlign: isTablet ? 'left' : 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingValue: {
    marginLeft: 8,
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: '#555',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
    marginBottom: 10,
  },
  metaText: {
    fontSize: isTablet ? 16 : 14,
    color: '#555',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  chip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipText: {
    color: '#333',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
  },
  detailsContainer: {
    marginTop: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexGrow: 1,
    flexBasis: '48%',
    backgroundColor: '#f8f8f8',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  propertiesContainer: {
    width: '100%',
    marginBottom: 12,
  },
  propertyItem: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailLabel: {
    fontSize: isTablet ? 14 : 12,
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'left',
  },
  detailValueRed: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#ff0000',
    textAlign: 'left',
  },
  bookButton: {
    backgroundColor: '#ff0000',
    padding: isTablet ? 18 : 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  bookButtonText: {
    fontSize: isTablet ? 20 : 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  bookButtonLoading: {
    backgroundColor: '#f8f8f8',
    padding: isTablet ? 16 : 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bookButtonLoadingText: {
    marginTop: 8,
    color: '#805500',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: isTablet ? 25 : 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
    maxWidth: 900,
  },
  // Modern Review Section Styles
  modernReviewSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: isTablet ? 22 : 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
    maxWidth: 900,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  reviewSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  reviewHeaderIcon: {
    width: isTablet ? 56 : 48,
    height: isTablet ? 56 : 48,
    borderRadius: isTablet ? 28 : 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reviewHeaderEmoji: {
    fontSize: isTablet ? 28 : 24,
  },
  reviewHeaderText: {
    flex: 1,
  },
  reviewSectionTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  reviewSectionSubtitle: {
    fontSize: isTablet ? 16 : 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  modernReviewForm: {
    gap: 16,
  },
  ratingSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: isTablet ? 18 : 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ratingLabel: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  modernStarContainer: {
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#059669',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  textSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: isTablet ? 18 : 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textLabel: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  modernTextInputContainer: {
    position: 'relative',
  },
  modernTextInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: isTablet ? 16 : 14,
    fontSize: isTablet ? 15 : 13,
    color: '#111827',
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  characterCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  characterCountText: {
    fontSize: isTablet ? 12 : 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  modernSubmitButton: {
    backgroundColor: '#ff0000',
    borderRadius: 12,
    paddingVertical: isTablet ? 16 : 14,
    paddingHorizontal: isTablet ? 20 : 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  submitButtonDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    shadowOpacity: 0.05,
    elevation: 1,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  submitButtonIcon: {
    fontSize: isTablet ? 20 : 18,
  },
  modernSubmitButtonText: {
    fontSize: isTablet ? 16 : 14,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  bookingError: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: isTablet ? 25 : 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    color: 'red',
    fontSize: isTablet ? 18 : 15,
    fontWeight: 'bold',
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: isTablet ? 22 : 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  reviewCard: {
    backgroundColor: '#f8f8f8',
    padding: isTablet ? 20 : 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewDate: {
    fontSize: isTablet ? 12 : 11,
    color: '#888',
  },
  reviewUser: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewText: {
    fontSize: isTablet ? 16 : 14,
    color: '#666',
    lineHeight: 22,
  },
  ownReviewHint: {
    marginTop: 8,
    fontSize: isTablet ? 12 : 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  star: {
    fontSize: isTablet ? 22 : 20,
    color: '#ff9900',
    marginHorizontal: 2,
  },
  noReviewsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noReviewsText: {
    fontSize: isTablet ? 18 : 16,
    color: '#666',
    fontStyle: 'italic',
  },
  contextMenu: {
    position: 'absolute',
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 9999,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  menuItemText: {
    fontSize: isTablet ? 16 : 14,
    color: '#111827',
    fontWeight: '600',
  },
  menuItemDanger: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  menuItemDangerText: {
    color: '#DC2626',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 720,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalCardLarge: {
    width: '100%',
    maxWidth: 820,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: isTablet ? 16 : 14,
    color: '#374151',
    lineHeight: 22,
    marginTop: 6,
  },
  modalDate: {
    fontSize: isTablet ? 13 : 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  modalRatingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalActionsRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  modalActionsSpread: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalPrimaryBtn: {
    backgroundColor: '#ff5733',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  modalPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: isTablet ? 16 : 14,
  },
  modalSecondaryBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalSecondaryText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: isTablet ? 16 : 14,
  },
  modalDangerBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  modalDangerText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: isTablet ? 16 : 14,
  },
});

export default ChefDetail;
