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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
const { width, height } = Dimensions.get('window');
const isTablet = width > 600;
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { formatDate } from './utils';

const ChefReviewList = ({ navigation, userId, limit }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChefReviews = useCallback(async () => {
    if (!userId) return;

    const formData = new FormData();
    formData.append('ChefID', userId);
    formData.append('Limit', limit);

    try {
      const response = await axios.post(
        `${BASE_URL}users/get_chef_reviews.php`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.data.success) {
        setReviews(response.data.data || []);
      } else {
        console.error('Review fetch error:', response.data.message);
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    setIsLoading(true);
    fetchChefReviews();
  }, [fetchChefReviews]);

  const EmptyReviews = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="star-outline"
        size={isTablet ? 80 : 60}
        color="#ff0000"
      />
      <Text style={styles.emptyTitle}>No Reviews Yet</Text>
      <Text style={styles.emptyText}>
        Start accepting bookings and delivering great experiences to receive
        reviews from your customers.
      </Text>
      {/* <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => navigation.navigate('ChefEditProfile')}
      >
        <Text style={styles.emptyButtonText}>Complete Profile</Text>
      </TouchableOpacity> */}
    </View>
  );

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, index) => (
          <MaterialCommunityIcons
            key={`star-${rating}-${index}`}
            name={index < rating ? 'star' : 'star-outline'}
            size={isTablet ? 20 : 16}
            color="#ff0000"
            style={styles.star}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <MaterialCommunityIcons
            name="star"
            size={isTablet ? 28 : 24}
            color="#ff0000"
          />
          <Text style={styles.sectionTitle}>Customer Reviews</Text>
        </View>
        {reviews.length > 0 && limit && (
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('ChefReviews')}
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
          <Text>Loading reviews...</Text>
        </View>
      ) : reviews.length === 0 ? (
        <EmptyReviews />
      ) : (
        <View style={styles.reviewsList}>
          {reviews.map((review, index) => (
            <View
              key={review.id ?? `review-${index}`}
              style={styles.reviewItem}
            >
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                  <MaterialCommunityIcons
                    name="account-circle"
                    size={isTablet ? 40 : 32}
                    color="#ff0000"
                  />
                  <Text style={styles.reviewUser}>{review.UserName}</Text>
                </View>
                <Text style={styles.reviewDate}>
                  {formatDate(review.CreatedAt)}
                </Text>
              </View>
              {renderStars(review.Rating)}
              <Text style={styles.reviewComment}>{review.ReviewText}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 15,
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
  reviewsList: {
    gap: 10,
  },
  reviewItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: isTablet ? 15 : 12,
    marginBottom: 10,
    marginHorizontal: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#ff0000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewUser: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: '#262626',
    marginLeft: 10,
  },
  reviewDate: {
    fontSize: isTablet ? 14 : 12,
    color: '#666',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  star: {
    marginRight: 2,
  },
  reviewComment: {
    fontSize: isTablet ? 16 : 14,
    color: '#666',
    lineHeight: isTablet ? 24 : 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
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

export default ChefReviewList;
