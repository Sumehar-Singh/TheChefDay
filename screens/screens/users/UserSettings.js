import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UserProfileImage from '../../components/strings/users/UserProfileImage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserFullName from '../../components/strings/users/UserFullName';
import { Ionicons } from '@expo/vector-icons';
import UserFullName from '../../components/strings/users/UserFullName';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../components/contexts/AuthContext';
const { width } = Dimensions.get('window');
const isTablet = width > 600;
const UserSettings = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = useState('');
  const { profile, logout } = useAuth();


  const handleLogout = async () => {
    const keysToRemove = ['userid', 'user_id', 'userCoods', 'role_id']; // List of keys to remove

    for (let key of keysToRemove) {
      await AsyncStorage.removeItem(key);
    }
    // Use the centralized logout function
    await logout(navigation, 'UserSettings');
  };

  const SettingItem = ({ icon, title, onPress }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingItemLeft}>
        <Ionicons name={icon} size={24} color="#FF4F4F" />
        <Text style={styles.settingText}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

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
        <View style={styles.headerContainer}>
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
              <Text style={styles.headDesc}>Settings</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.container}>

        {/* Settings Options Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.settingsGroup}>
            {/* <SettingItem 
              icon="settings-outline" 
              title="Account Settings" 
              onPress={() => {}} 
            /> */}
            <SettingItem
              icon="document-text-outline"
              title="Terms and Conditions"
              onPress={() => navigation.navigate("UserTermsScreen")}
            />
            <SettingItem
              icon="remove-circle-outline"
              title="Delete Account"
              onPress={() => navigation.navigate("DeleteUserAccount")}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </ScrollView>
    </View >
  );
};

const styles = StyleSheet.create({
  const styles = StyleSheet.create({
    superContainer: {
      flex: 1,
      backgroundColor: '#F5F5F5',
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
    container: {
      flex: 1,
      padding: 20,
      marginTop: 15,
    },
    settingsSection: {
      marginTop: 8,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: '#666',
      marginBottom: 12,
      marginLeft: 8,
    },
    settingsGroup: {
      backgroundColor: '#fff',
      borderRadius: 12,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 18,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    settingItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingText: {
      fontSize: 16,
      color: '#333',
      marginLeft: 15,
    },
    logoutButton: {
      backgroundColor: '#ff0000',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 10,
      marginTop: 25,
      marginBottom: 30,
      gap: 8,
    },
    logoutText: {
      color: '#FFF',
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 10,
    },
  });

  export default UserSettings;
