import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  SafeAreaView,
  ImageBackground,
  RefreshControl,
  StatusBar,
  Platform, Animated, Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../../../config';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const Home = ({ navigation }) => {
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [flipAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const flipLogo = () => {
      Animated.sequence([
        Animated.timing(flipAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease)
        }),
        Animated.delay(14000),
        Animated.timing(flipAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease)
        })
      ]).start(() => flipLogo());
    };

    flipLogo();
    return () => flipAnim.stopAnimation();
  }, []);

  const flipInterpolation = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const animatedStyle = {
    transform: [{ rotateY: flipInterpolation }]
  };
  const fetchChefs = async () => {
    try {
      const response = await axios.get(`${BASE_URL}guest/get_chefs_list.php?limit=10`);
      if (response.data.status === 'success') {
        setChefs(response.data.data);


      }
    } catch (error) {
      console.error('Error fetching chefs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChefs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchChefs();
  };

  const renderChefCard = ({ item }) => (
    <TouchableOpacity
      style={styles.chefCard}
      onPress={() => navigation.navigate('ChefDetail', { ChefId: item.ChefID })}
    >
      <Image
        source={item.Image
          ? { uri: item.Image }
          : require('../../../assets/userImage.jpg')}
        style={styles.chefImage}
        resizeMode="cover"
      />
      <View style={styles.chefInfo}>
        <Text style={styles.chefName} numberOfLines={1}>
          {item.FirstName}
          {item.is_verified === '1' && (
            <MaterialIcons name="verified" size={16} color="#1E90FF" style={styles.verifiedIcon} />
          )}
        </Text>

        <View style={styles.ratingContainer}>
          <MaterialIcons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{parseFloat(item.AvgRating).toFixed(1) || '4.5'}</Text>
          {item.ReviewCount !== 0 ? <Text style={styles.reviewCount}>({item.ReviewCount || '0'} reviews)</Text> : <Text style={styles.reviewCount}>(No Reviews Yet)</Text>}
        </View>
        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={14} color="#666" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.Address || 'Location not specified'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const features = [
    { id: '1', icon: 'chef-hat', title: 'Professional Chefs', description: 'Hire experienced chefs for any occasion' },
    { id: '2', icon: 'silverware-fork-knife', title: 'Custom Menus', description: 'Personalized menus tailored to your taste' },
    { id: '3', icon: 'calendar-check', title: 'Easy Booking', description: 'Simple and quick booking process' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ff1a1a" />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <LinearGradient
            colors={['#ff4d4d', '#ff1a1a']}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >


            <View style={styles.heroContent}>
              <Animated.View style={[styles.logoContainer, animatedStyle]}>
                <Image
                  source={require('../../../assets/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </Animated.View>
              <Text style={styles.heroTitle}>Find the Perfect Private Chef</Text>
              <Text style={styles.heroSubtitle}>For your next dinner party, corporate event, or special occasion</Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={() => navigation.navigate('SignupScreen', { fromScreen: 'Home' })}
                >
                  <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={() => navigation.navigate('LoginScreen')}
                >
                  <Text style={styles.buttonTextLogin}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View >

        {/* Features Section */}
        < View style={styles.section} >
          <Text style={styles.sectionTitle}>Why Choose The Chef Day?</Text>
          <View style={styles.featuresContainer}>
            {features.map((feature) => (
              <View key={feature.id} style={styles.featureCard}>
                <View style={styles.featureHeader}>
                  <View style={styles.featureIcon}>
                    <MaterialCommunityIcons
                      name={feature.icon}
                      size={24}
                      color="#ff1a1a"
                    />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                </View>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View >

        {/* Top Chefs Section */}
        < View style={[styles.section, { paddingBottom: 10 }]} >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Chefs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ChefsList')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {
            loading ? (
              <View style={styles.loadingContainer}>
                <Text>Loading chefs...</Text>
              </View>
            ) : (
              <FlatList
                data={chefs.slice(0, 5)}
                renderItem={renderChefCard}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chefList}
              />
            )
          }
        </View >

        {/* How It Works Section */}
        < View style={[styles.section, { backgroundColor: '#f9f9f9', paddingVertical: 20, marginBottom: 30 }]} >
          <Text style={styles.sectionTitle}>How It Works</Text>

          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepTitle}>Browse Chefs</Text>
              </View>
              <Text style={styles.stepDescription}>Explore our talented chefs and their specialties</Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepTitle}>Book & Plan</Text>
              </View>
              <Text style={styles.stepDescription}>Choose your menu and schedule your event</Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepTitle}>Enjoy</Text>
              </View>
              <Text style={styles.stepDescription}>Sit back and enjoy a restaurant-quality meal at home</Text>
            </View>
          </View>
        </View >

        {/* Premium CTA Section */}
        <View style={{ padding: 20, marginBottom: 30 }}>
          <LinearGradient
            colors={['#ff4d4d', '#b30000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: 30,
              borderRadius: 20,
              alignItems: 'center',
              shadowColor: '#ff1a1a',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <MaterialCommunityIcons name="chef-hat" size={50} color="rgba(255,255,255,0.2)" style={{ position: 'absolute', top: 10, right: 20 }} />
            <MaterialCommunityIcons name="silverware" size={40} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', bottom: 10, left: 20 }} />

            <Text style={{ fontSize: 28, fontWeight: '800', color: 'white', textAlign: 'center', marginBottom: 10 }}>
              Join The Chef Day
            </Text>
            <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 25, lineHeight: 24, paddingHorizontal: 10 }}>
              Book a private chef for your next event, or sign up as a chef to showcase your culinary skills.
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: 'white',
                paddingVertical: 16,
                paddingHorizontal: 40,
                borderRadius: 50,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 5,
                flexDirection: 'row',
                alignItems: 'center'
              }}
              onPress={() => navigation.navigate('SignupScreen', { fromScreen: 'Home' })}
            >
              <Text style={{ color: '#b30000', fontSize: 18, fontWeight: 'bold', marginRight: 8 }}>Get Started</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#b30000" />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView >
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    width: 150,
    height: 150,
    marginBottom: 20,
    alignSelf: 'center',
    backgroundColor: '#fdfdfd',
    borderRadius: 40,
    shadowColor: '#555555',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  // Hero Section
  heroContainer: {
    height: 450,
    width: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
  },
  heroGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    alignSelf: 'center',
    backgroundColor: '#fdfdfdff',
    borderRadius: 40,

    shadowColor: '#555555ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },


  heroContent: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
    paddingTop: 40,
    paddingBottom: 30,
  },
  heroTitle: {
    fontSize: isTablet ? 28 : 22,
    fontWeight: '700', // Consistent bold
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '500', // Medium weight for better legibility
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#fff',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff1a1a',
  },
  buttonTextLogin: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff1a1a'
  },
  // Section Styles
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

  },
  sectionTitle: {
    fontSize: isTablet ? 26 : 22,
    fontWeight: '800', // Extra Bold
    color: '#1a1a1a', // Darker Black
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  seeAllText: {
    color: '#ff1a1a',
    fontWeight: '600',
  },
  // Features
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  featureCard: {
    width: isTablet ? '31%' : '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 26, 26, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 0,
  },
  featureTitle: {
    fontSize: 18, // Scaling up to match Step Title
    fontWeight: '700',
    marginBottom: 0,
    color: '#333',
    flex: 1,
  },
  featureDescription: {
    color: '#555', // Darker to match Step Description
    fontSize: 15, // Match Step Description
    lineHeight: 22, // Match Step Description
  },
  // Chef Cards
  chefList: {
    paddingVertical: 10,
  },
  chefCard: {
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  chefImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  chefInfo: {
    padding: 15,
  },
  chefName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  verifiedIcon: {
    marginLeft: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingText: {
    marginLeft: 5,
    marginRight: 10,
    color: '#333',
    fontWeight: '600',
  },
  reviewCount: {
    color: '#888',
    fontSize: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  locationText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 12,
    flex: 1,
  },
  // How It Works Section
  stepsContainer: {
    marginTop: 20,
  },
  step: {
    marginBottom: 20, // Match featureCard
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20, // Match featureCard
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, // Match featureCard
    shadowRadius: 8, // Match featureCard
    elevation: 3, // Match featureCard
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    width: 40, // Match Feature Icon size
    height: 40, // Match Feature Icon size
    borderRadius: 20, // Match Feature Icon radius
    backgroundColor: '#ff1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    // Removed marginTop to ensure perfect centering
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 0, // Removed bottom margin so text centers perfectly with icon
    color: '#222',
  },
  stepDescription: {
    color: '#555',
    fontSize: 15,
    lineHeight: 22,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;