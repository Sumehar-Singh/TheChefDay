import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    SafeAreaView,
    StatusBar,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopSVG from '../../components/TopSVG';

const { width, height } = Dimensions.get('window');
const isTablet = width > 600;

export default function SignupRoleScreen({ navigation, route }) {
    // Use 'fromScreen' logic if passed, to customize back button text/behavior
    const { fromScreen } = route.params || {};

    const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight;

    const handleChefSelection = () => {
        navigation.navigate('SignupScreen', { isChef: true, fromScreen });
    };

    const handleUserSelection = () => {
        navigation.navigate('SignupScreen', { isChef: false, fromScreen });
    };

    return (
        <SafeAreaView style={[styles.modalOverlay, { paddingTop: STATUS_BAR_HEIGHT }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.modalContainer}>
                <TopSVG />
                <View style={styles.selectionContainer}>
                    <Text style={styles.modalTitle}>Welcome to The Chef's Day</Text>
                    <Text style={styles.modalSubtitle}>Please select your role to continue</Text>

                    <View style={styles.roleSelectionContainer}>
                        <TouchableOpacity
                            style={styles.roleButton}
                            onPress={handleChefSelection}
                        >
                            <View style={styles.roleIconContainer}>
                                <Ionicons name="restaurant" size={40} color="#ff0000" />
                            </View>
                            <Text style={styles.roleTitle}>Chef</Text>
                            <Text style={styles.roleDescription}>
                                Share your culinary expertise and connect with food lovers
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.roleButton}
                            onPress={handleUserSelection}
                        >
                            <View style={styles.roleIconContainer}>
                                <Ionicons name="person" size={40} color="#ff0000" />
                            </View>
                            <Text style={styles.roleTitle}>User</Text>
                            <Text style={styles.roleDescription}>
                                Book talented chefs for your special occasions
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.backToLoginButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={20} color="#ff0000" />
                        <Text style={styles.backToLoginText}>
                            {fromScreen === 'Home' ? 'Back to Home' : fromScreen === 'Login' ? 'Back' : 'Back to Login'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'white',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    selectionContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: isTablet ? 32 : 20,
        fontWeight: 'bold',
        color: '#BB0000',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: isTablet ? 18 : 16,
        color: '#666',
        marginBottom: 40,
        textAlign: 'center',
    },
    roleSelectionContainer: {
        width: '100%',
        maxWidth: 600,
        flexDirection: isTablet ? 'row' : 'column',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        gap: isTablet ? 0 : 20,
    },
    roleButton: {
        width: isTablet ? '45%' : '100%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    roleIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF8E1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    roleTitle: {
        fontSize: isTablet ? 24 : 20,
        fontWeight: 'bold',
        color: '#BB0000',
        marginBottom: 10,
    },
    roleDescription: {
        fontSize: isTablet ? 16 : 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: isTablet ? 22 : 18,
    },
    backToLoginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        padding: 10,
    },
    backToLoginText: {
        color: '#ff0000',
        fontSize: 16,
        marginLeft: 8,
        fontWeight: '500',
    },
});
