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
import { formatDate } from './utils';

const { width } = Dimensions.get('window');
const isTablet = width > 600;
const PAGE_SIZE = 20;

const ChefReviewList = ({ navigation, userId, limit, showHeader = true, showViewAll = true }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchChefReviews = useCallback(async (pageNum = 1) => {
    if (!userId) return;

    const form = new FormData();
    form.append('ChefID', userId);

    // If limit is provided (Dashboard), use it and dont offset (always 1 page).
    // If no limit (Full Page), use PAGE_SIZE and offset.
    const currentLimit = limit ? limit : PAGE_SIZE;
    const currentOffset = limit ? 0 : (pageNum - 1) * PAGE_SIZE;

    form.append('Limit', currentLimit);
    form.append('Offset', currentOffset);

    try {
      const response = await axios.post(
        `${BASE_URL}users/get_chef_reviews.php`,
        form,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.data.success) {
        const newData = response.data.data || [];

        if (limit) {
          setReviews(newData);
        } else {
          if (pageNum === 1) {
            setReviews(newData);
          } else {
            setReviews(prev => [...prev, ...newData]);
          }

          if (newData.length < PAGE_SIZE) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
        }
      } else {
        if (pageNum === 1) setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      if (pageNum === 1) setReviews([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    setIsLoading(true);
    setPage(1);
    fetchChefReviews(1);
  }, [fetchChefReviews]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchChefReviews(1);
  };

  const loadMoreData = () => {
    if (limit) return;
    if (loadingMore || isLoading) return;
    if (!hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchChefReviews(nextPage);
  };

  const handleSeeAll = () => {
    navigation.navigate('ChefReviews');
  };

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
    </View>
  );

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <MaterialCommunityIcons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color="#ff9900"
        />
      );
    }
    return <View style={{ flexDirection: 'row' }}>{stars}</View>;
  };

  const renderItem = ({ item }) => {
    let userImage = item.Image; // API returns 'Image' directly
    if (userImage && typeof userImage === 'string' && !userImage.startsWith('http')) {
      userImage = `https://thechefday.com/server/${userImage.replace(/^\//, '')}`;
    }

    return (
      <View style={styles.reviewItem}>
        <View style={styles.reviewHeader}>
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
          <View style={styles.reviewHeaderText}>
            <Text style={styles.reviewerName}>{item.UserName || 'Unknown User'}</Text>
            <Text style={styles.reviewDate}>{formatDate(item.CreatedAt)}</Text>
          </View>
          <View style={styles.reviewRating}>
            {renderStars(parseInt(item.Rating))}
          </View>
        </View>
        <Text style={styles.reviewText}>{item.ReviewText}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, !limit && { flex: 1, marginBottom: 0 }]}>
      {showHeader && (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <MaterialCommunityIcons
              name="star-check"
              size={isTablet ? 28 : 24}
              color="#ff0000"
            />
            <Text style={styles.sectionTitle}>Reviews</Text>
          </View>
          {reviews.length > 0 && limit && showViewAll && (
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={handleSeeAll}
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
      ) : reviews.length === 0 ? (
        <EmptyReviews />
      ) : (
        <FlatList
          scrollEnabled={!limit}
          data={reviews}
          keyExtractor={(item) => item.ReviewID ? item.ReviewID.toString() : Math.random().toString()}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={!limit ? onRefresh : null}
          onEndReached={!limit ? loadMoreData : null}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#ff0000" style={{ padding: 10 }} /> : null}
          showsVerticalScrollIndicator={false}
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
    marginBottom: 20,
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
  reviewItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  reviewHeaderText: {
    flex: 1,
  },
  reviewerName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    color: '#000',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  reviewRating: {
    alignItems: 'flex-end',
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChefReviewList;
