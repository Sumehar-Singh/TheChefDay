import React, { useCallback, useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import axios from 'axios';

import { useAuth } from '../../components/contexts/AuthContext';
import { BASE_URL } from '../../config';
const { width, height } = Dimensions.get('window');
const isTablet = width > 600;
const ChefProfileCompletionSection = ({ navigation }) => {
  const { profile } = useAuth();

  const [profileStatus, setProfileStatus] = useState(null);
  const prerequisites = [
    {
      id: 'location',
      title: 'Add Your Location',
      description: 'Let customers know where you are',
      completed: profileStatus?.location,
      screen: 'ChefEditProfile'
    },
    {
      id: 'pricing',
      title: 'Set Your Pricing',
      description: 'Define your hourly and daily rates',
      completed: profileStatus?.pricing,
      screen: 'ChefSettings'
    },
    {
      id: 'specialities',
      title: 'Select Specialities',
      description: 'Choose your cooking specialities',
      completed: profileStatus?.specialities,
      screen: 'ChefEditProfile'
    },
    {
      id: 'subscribed',
      title: 'Get a Subscription',
      description: 'Subscribe to activate your profile',
      completed: profileStatus?.subscribed,
      screen: 'SubscriptionPlans'
    },
  ];




  useFocusEffect(
    useCallback(() => {
      if (!profile.Id) return;
      const fetchProfileCompletion = async () => {
        try {
          const response = await axios.post(
            `${BASE_URL}chefs/get_chef_profile_status.php`,
            { ChefID: profile.Id },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.data.success) {
            const {
              location,
              pricing,
              specialities,
              subscribed,
              progress,
              isprofilecompleted,
            } = response.data.data;

            setProfileStatus({
              location,
              pricing,
              specialities,
              subscribed,
              progress,
              isprofilecompleted,
            });
          } else {
            console.warn('Error from API:', response.data.message);
          }
        } catch (error) {
          console.error('Error fetching profile completion:', error);
        }
      };
      fetchProfileCompletion();
    }, [profile.Id]) // <-- add userId as dependency
  );



  return (

    <View style={styles.profileCompletionContainer}>
      <View style={styles.profileCompletionHeader}>
        <Text style={styles.profileCompletionTitle}>
          {profileStatus?.isprofilecompleted ? "Your Profile is Complete" : "Complete Your Profile"}


        </Text>
        <Text style={styles.profileCompletionSubtitle}>
          {profileStatus?.isprofilecompleted ? "Everything's in place. Keep an eye out for booking requests." : "Get more bookings by completing your profile. Just a 5 minutes setup."}


        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${profileStatus?.progress || 20}%` }]} />
        </View>
        <Text style={styles.progressText}>{profileStatus?.progress || 20}% Complete</Text>
      </View>

      <View style={styles.prerequisitesList}>
        {prerequisites.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.prerequisiteItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.prerequisiteContent}>
              <Text style={styles.prerequisiteTitle}>{item.title}</Text>
              <Text style={styles.prerequisiteDescription}>{item.description}</Text>
            </View>
            <Text style={[styles.checkmark, { color: item.completed ? 'green' : 'grey' }]}>
              {item.completed ? '✔️' : '❌'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )


};
const styles = StyleSheet.create({

  profileCompletionContainer: {
    backgroundColor: '#fff',
    borderRadius: 15, // Match others
    padding: isTablet ? 20 : 15,
    marginHorizontal: 15, // Reverted to 15
    marginBottom: 20,     // Common spacing
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, // Match others (0.1?) others had 0.1.
    shadowRadius: 4,
    elevation: 3,
  },
  profileCompletionHeader: {
    marginBottom: 15,
  },
  profileCompletionTitle: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: '700',
    color: '#262626',
    marginBottom: 5,
  },
  profileCompletionSubtitle: {
    fontSize: isTablet ? 16 : 14,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#82DD6B',
    borderRadius: 4,
  },
  progressText: {
    fontSize: isTablet ? 16 : 14,
    color: '#4BC82C',
    fontWeight: '600',
    textAlign: 'right',
  },
  prerequisitesList: {
    gap: 12,
  },
  prerequisiteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  prerequisiteContent: {
    flex: 1,
  },
  prerequisiteTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 4,
  },
  prerequisiteDescription: {
    fontSize: isTablet ? 14 : 12,
    color: '#666',
  },
  checkmark: {
    fontSize: isTablet ? 20 : 16,
    marginLeft: 10,
  },
});

export default ChefProfileCompletionSection;
