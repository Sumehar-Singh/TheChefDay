import React from 'react';
import { View, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import ChefReviewList from '../../components/ChefReviewList';
import CustomStatusBar from '../../components/CustomStatusBar';
import { useAuth } from '../../../components/contexts/AuthContext';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const ChefReviews = ({ navigation }) => {
  const { profile } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar title="Chef Reviews" includeTopInset={false} />
      <View style={styles.content}>
        <ChefReviewList
          navigation={navigation}
          userId={profile.Id}
          limit={null}
          showHeader={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    paddingTop: 10,
    // paddingHorizontal removed to match Bookings.js correct style
  },
});

export default ChefReviews;
