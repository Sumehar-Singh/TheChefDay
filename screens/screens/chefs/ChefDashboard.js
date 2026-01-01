import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, FlatList, ScrollView, ImageBackground, RefreshControl, SafeAreaView, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CenterLoading from '../../components/CenterLoading';
//import AsyncStorage from '@react-native-async-storage/async-storage';
import ChefFullName from '../../components/strings/chefs/ChefFullName';
import ChefBookingList from '../../components/ChefBookingList';
import ChefReviewList from '../../components/ChefReviewList';
import ChefProfileImage from '../../components/strings/chefs/ChefProfileImage';
import ChefProfileCompletionSection from '../../components/ChefProfileCompletionSection';
import axios from 'axios';
import { BASE_URL } from '../../../config';
import { useAuth } from '../../../components/contexts/AuthContext';
import { Provider } from 'react-native-paper';

const { width, height } = Dimensions.get('window');
const isTablet = width > 600;

const ChefDashboard = ({ navigation }) => {
    // const [userId, setUserId] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);
    const [hasBookings, setHasBookings] = useState(false);
    const [hasReviews, setHasReviews] = useState(false);
    const [isProfileCompleted, setIsProfileCompleted] = useState(false);
    const { profile } = useAuth();
    const fetchProfileStatus = async () => {
        if (!profile?.Id) return;

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
                setIsProfileCompleted(response.data.data.isprofilecompleted);
            }
        } catch (error) {
            console.error('Error fetching profile status:', error);
        }
    };

    const fetchBookings = async () => {
        if (!profile?.Id) return;
        try {
            const response = await axios.get(`${BASE_URL}chefs/get_chef_bookings.php`, {
                params: { ChefId: profile.Id }
            });
            if (response.data.status === 'success') {
                setHasBookings(response.data.data && response.data.data.length > 0);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const fetchReviews = async () => {
        if (!profile?.Id) return;
        try {
            const response = await axios.get(`${BASE_URL}chefs/get_chef_reviews.php`, {
                params: { ChefId: profile.Id }
            });
            if (response.data.status === 'success') {
                setHasReviews(response.data.data && response.data.data.length > 0);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const onRefresh = useCallback(async () => {
        if (!profile?.Id) return;
        setRefreshing(true);
        setIsLoading(true);
        try {
            await Promise.all([
                fetchProfileStatus(),
                fetchBookings(),
                fetchReviews()
            ]);
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setRefreshing(false);
            setIsLoading(false);
        }
    }, [profile?.Id]);

    useEffect(() => {
        if (profile?.Id) {
            const loadData = async () => {
                try {
                    await Promise.all([
                        fetchProfileStatus(),
                        fetchBookings(),
                        fetchReviews()
                    ]);
                } catch (error) {
                    console.error('Error loading initial data:', error);
                } finally {
                    setInitialLoad(false);
                    setIsLoading(false);
                }
            };
            loadData();
        }
    }, [profile?.Id]);

    return (
        <SafeAreaView style={styles.superContainer}>
            {!profile?.Id ? (
                <CenterLoading />
            ) : (
                <ScrollView
                    contentContainerStyle={styles.container}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#ff0000']}
                            tintColor="#70BD5C"
                        />
                    }
                >
                    <LinearGradient
                        colors={['#ff0000', '#c90000']}
                        style={styles.headerGradient}
                    >
                        <TouchableOpacity
                            style={styles.headerContainer}
                            onPress={() => navigation.navigate('ChefSettings')}
                        >
                            <View style={styles.profileContainer}>
                                <ChefProfileImage userId={profile?.Id} height={70} width={70} mr={15} style={styles.profileImage} />
                                <View style={styles.profileInfo}>
                                    <Text style={styles.headerTitle}><ChefFullName userId={profile?.Id} /></Text>
                                    <Text style={styles.headDesc}>👨‍🍳 Chef Dashboard</Text>
                                </View>
                            </View>
                            <View style={styles.editButton}>
                                <MaterialCommunityIcons name="cog-outline" size={isTablet ? 40 : 25} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    </LinearGradient>

                    {/* Welcome Section for New Chefs */}
                    {!initialLoad && !isLoading && !isProfileCompleted && !hasBookings && !hasReviews && (
                        <View style={styles.welcomeContainer}>
                            <MaterialCommunityIcons name="chef-hat" size={isTablet ? 80 : 60} color="#ff0000" />
                            <Text style={styles.welcomeTitle}>Welcome to Your Chef Dashboard!</Text>
                            <Text style={styles.welcomeText}>
                                Complete your profile to start receiving bookings and build your reputation as a chef.
                            </Text>
                        </View>
                    )}
                    {!initialLoad && !isLoading && !isProfileCompleted && (
                        <ChefProfileCompletionSection navigation={navigation} />
                    )}
                    <View style={styles.section}>
                        <ChefBookingList navigation={navigation} userId={profile?.Id} limit={5} />
                    </View>

                    <ChefReviewList navigation={navigation} userId={profile?.Id} limit={5} />
                </ScrollView>
            )}
            {(isLoading || initialLoad) && <CenterLoading />}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    superContainer: {
        height: "100%",
        backgroundColor: '#f5f5f5',
    },
    container: {
        paddingBottom: 20,
    },
    headerGradient: {
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: 15,
        paddingTop: 10,
    },
    headerContainer: {
        padding: isTablet ? 20 : 15,
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
    editButton: {
        padding: 10,
    },
    section: {
        marginBottom: 15,
    },
    welcomeContainer: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: isTablet ? 30 : 20,
        marginHorizontal: 15,
        marginVertical: 3,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    welcomeTitle: {
        fontSize: isTablet ? 24 : 20,
        fontWeight: '700',
        color: '#262626',
        marginTop: 15,
        marginBottom: 10,
        textAlign: 'center',
    },
    welcomeText: {
        fontSize: isTablet ? 18 : 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: isTablet ? 26 : 20,
    },
    welcomeButton: {
        backgroundColor: '#ff0000',
        paddingVertical: isTablet ? 15 : 12,
        paddingHorizontal: isTablet ? 30 : 25,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    welcomeButtonText: {
        color: '#fff',
        fontSize: isTablet ? 18 : 14,
        fontWeight: '600',
    },
});

export default ChefDashboard;
