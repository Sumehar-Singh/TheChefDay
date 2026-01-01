import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Alert,
  Animated,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import { useAuth } from '../../../components/contexts/AuthContext';
import CustomStatusBar from '../../components/CustomStatusBar';
import { BASE_URL } from '../../../config';

const DeleteUserAccount = ({ navigation }) => {
  const { profile, logout, appUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [deletionInfo, setDeletionInfo] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionProgress, setDeletionProgress] = useState({
    isDeleting: false,
    currentStep: 0,
    completedSteps: [],
    showFinalLoading: false,
  });

  useEffect(() => {
    fetchDeletionInfo();
  }, []);

  const fetchDeletionInfo = async () => {
    console.log(profile.Id);

    try {
      const response = await axios.post(
        `${BASE_URL}users/get_user_deletion_info.php`,
        { UserID: profile.Id },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setDeletionInfo(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching deletion info:', error);
      Alert.alert(
        'Error',
        'Failed to load account information. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    setIsDeleting(true);
    setDeletionProgress({
      isDeleting: true,
      currentStep: 0,
      completedSteps: [],
      showFinalLoading: false,
    });

    try {
      // Get items that need to be deleted (only Reviews and Bookings for users)
      const itemsToDelete = [
        { label: 'Reviews', count: deletionInfo?.reviews || 0 },
        { label: 'Bookings', count: deletionInfo?.bookings || 0 },
      ].filter((item) => item.count > 0);

      // Call PHP API to delete user account (always call regardless of visible items)
      const response = await axios.post(
        `${BASE_URL}delete_user.php`,
        {
          app_user_id: appUser.Id,
          user_id: profile.Id,
          role_id: 2,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('DELETE RESPONSE:', response.data);

      if (response.data.success) {
        // Show visual progress if there are items to display
        if (itemsToDelete.length > 0) {
          // Animate deletion of each item sequentially (UI only)
          for (let i = 0; i < itemsToDelete.length; i++) {
            setDeletionProgress((prev) => ({
              ...prev,
              currentStep: i + 1,
              completedSteps: [...prev.completedSteps, itemsToDelete[i].label],
            }));

            // Wait 1.5 seconds before moving to next item
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }
        }

        // Show final loading for 2 seconds
        setDeletionProgress((prev) => ({ ...prev, showFinalLoading: true }));
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Logout and navigate
        await logout();
        navigation.reset({
          index: 0,
          routes: [{ name: 'LoginScreen' }],
        });
      } else {
        throw new Error('API call failed');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again later.');
      setDeletionProgress({
        isDeleting: false,
        currentStep: 0,
        completedSteps: [],
        showFinalLoading: false,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const navigateToScreen = (screenName) => {
    switch (screenName) {
      case 'Reviews':
        navigation.navigate('ChefReviews');
        break;
      case 'Bookings':
        navigation.navigate('AllBookings');
        break;
    }
  };

  const renderDeletionInfo = () => {
    if (!deletionInfo) return null;

    if (!deletionInfo.isAlert) {
      return (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            You don't have any active data that will be affected by account
            deletion.
          </Text>
        </View>
      );
    }

    const items = [
      {
        label: 'Reviews',
        count: deletionInfo.reviews,
        icon: 'star-outline',
        screen: 'ChefReviews',
      },
      {
        label: 'Bookings',
        count: deletionInfo.bookings,
        icon: 'calendar-outline',
        screen: 'AllBookings',
      },
    ].filter((item) => item.count > 0);

    // Show deletion progress if currently deleting
    if (deletionProgress.isDeleting) {
      return (
        <View style={styles.infoBox}>
          <Text
            style={[styles.infoText, { marginBottom: 15, textAlign: 'center' }]}
          >
            Deleting your account data...
          </Text>
          {items.map((item, index) => {
            const isCompleted = deletionProgress.completedSteps.includes(
              item.label
            );
            const isCurrent =
              deletionProgress.currentStep === index + 1 && !isCompleted;

            return (
              <View
                key={index}
                style={[
                  styles.infoItem,
                  isCompleted && styles.completedItem,
                  isCurrent && styles.currentItem,
                ]}
              >
                <Ionicons
                  name={isCompleted ? 'checkmark-circle' : item.icon}
                  size={20}
                  color={
                    isCompleted ? '#4CAF50' : isCurrent ? '#FF4F4F' : '#999'
                  }
                  style={styles.infoIcon}
                />
                <View style={styles.infoTextContainer}>
                  <Text
                    style={[
                      styles.infoText,
                      isCompleted && styles.completedText,
                      isCurrent && styles.currentText,
                    ]}
                  >
                    {isCompleted
                      ? `✓ ${item.count} ${item.label} deleted`
                      : `${item.count} ${item.label}`}
                  </Text>
                  {isCurrent && (
                    <ActivityIndicator size="small" color="#FF4F4F" />
                  )}
                </View>
              </View>
            );
          })}

          {deletionProgress.showFinalLoading && (
            <View style={styles.finalLoadingContainer}>
              <ActivityIndicator size="large" color="#FF4F4F" />
              <Text
                style={[
                  styles.infoText,
                  { marginTop: 10, textAlign: 'center' },
                ]}
              >
                Finalizing account deletion...
              </Text>
            </View>
          )}
        </View>
      );
    }

    return (
      <View style={styles.infoBox}>
        <Text style={[styles.infoText, { marginBottom: 15 }]}>
          Deleting your account will permanently remove the following data as
          well:
        </Text>
        {items.map((item, index) => (
          <TouchableOpacity
            key={`item-${item.label}-${index}`}
            style={styles.infoItem}
            onPress={() => navigateToScreen(item.label)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color="#FF4F4F"
              style={styles.infoIcon}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoText}>
                {item.count} {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDeletionInfo();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4F4F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomStatusBar title="Delete Account" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ff0000']}
            tintColor="#ff0000"
          />
        }
      >
        <View style={styles.header}>
          <Ionicons
            name="warning"
            size={60}
            color="#ff0000"
            style={styles.warningIcon}
          />
          <Text style={styles.title}>Delete Your Account</Text>
          <Text style={styles.subtitle}>
            Are you sure you want to delete your account? This action cannot be
            undone.
          </Text>
        </View>

        {renderDeletionInfo()}

        {!deletionProgress.isDeleting && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
              disabled={isDeleting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.deleteButton,
                isDeleting && styles.disabledButton,
              ]}
              onPress={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  warningIcon: {
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFF9F9',
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    marginBottom: 30,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#DDD',
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#ff0000',
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  completedItem: {
    backgroundColor: '#F0F8F0',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  currentItem: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FF4F4F',
    borderWidth: 1,
  },
  completedText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  currentText: {
    color: '#FF4F4F',
    fontWeight: '600',
  },
  finalLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 10,
  },
});

export default DeleteUserAccount;
