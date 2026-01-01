import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../components/Controls/CustomButton';
import TopSVG from '../../components/TopSVG';
import BottomSVG from '../../components/Controls/BottomSVG';
import ChefTerms from '../components/Terms/ChefTerms';
import UserTerms from '../components/Terms/UserTerms';
import { BASE_URL } from "../../config";

const { width, height } = Dimensions.get('window');
const isTablet = width > 600;

const SignupScreen = ({ navigation, route }) => {
  const { fromScreen } = route.params || {};
  const [isChef, setIsChef] = useState(null);
  const [showFirstModal, setShowFirstModal] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [FirstName, setFirstName] = useState('');
  const [MiddleName, setMiddleName] = useState('');
  const [LastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollViewRef = React.useRef(null);

  // Add status bar height for proper header spacing
  const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight;

  const resetForm = () => {
    setFirstName('');
    setMiddleName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    setTermsAccepted(false);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      resetForm();
      // Optional: Reset form when screen is focused.
      // If you want to keep data when coming back from Terms, you might want to adjust this.
      // But user asked to reset validations if they go back and come again.
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  const handleChefSelection = () => {
    resetForm();
    setIsChef(true);
    setShowFirstModal(false);
    setStep(1);
  };

  const handleUserSelection = () => {
    resetForm();
    setIsChef(false);
    setShowFirstModal(false);
    setStep(1);
  };

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;

    if (isCloseToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleContentSizeChange = (contentWidth, contentHeight) => {
    const { height: screenHeight } = Dimensions.get('window');
    // If content height is less than screen height, enable the button
    if (contentHeight < screenHeight - 200) { // 200px buffer for header and button
      setHasScrolledToBottom(true);
    }
  };

  const handleTermsAcceptance = () => {
    if (!hasScrolledToBottom) {
      Alert.alert(
        "Please Read Terms",
        "Please scroll through and read all terms and conditions before accepting.",
        [{ text: "OK" }]
      );
      return;
    }
    setTermsAccepted(true);
    setShowTermsModal(false);
  };

  const handleSuccessRegister = () => {
    navigation.navigate("PopUpScreen", {
      title: "Registration Successful!",
      type: "success",
      detail: "Your account has been created successfully.",
      returnTo: "LoginScreen",
    });
  };

  const registerUserWithRole = async () => {
    let currentErrors = {};

    if (!FirstName.trim()) currentErrors.FirstName = 'Please enter your First Name.';
    if (!LastName.trim()) currentErrors.LastName = 'Please enter your Last Name.';
    if (!email.trim()) currentErrors.email = 'Please enter your Email Address.';
    if (!phone.trim()) currentErrors.phone = 'Please enter your Phone Number.';
    if (!password) currentErrors.password = 'Please create a Password.';
    if (!confirmPassword) currentErrors.confirmPassword = 'Please confirm your Password.';

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (email.trim() && !emailRegex.test(email)) {
      currentErrors.email = 'Please enter a valid email address.';
    }

    if (password && password.length < 6) {
      currentErrors.password = 'Password must be at least 6 characters long.';
    }

    if (password !== confirmPassword) {
      currentErrors.confirmPassword = 'Passwords do not match.';
    }

    if (phone.trim() && phone.length < 10) {
      currentErrors.phone = 'Please enter a valid phone number (at least 10 digits).';
    }

    if (!termsAccepted) {
      Alert.alert('Required', 'Please accept the terms and conditions'); // Converting this one too? User said "validations above inputs". Terms is a checkbox/button. I'll leave alert for Terms or add a text above button. I'll leave alert for terms as it's separate.
      return;
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}register.php`, {
        email: email,
        password: password,
        fname: FirstName,
        mname: MiddleName,
        lname: LastName,
        phone: phone,
        role_id: isChef ? 3 : 2,
        terms_accepted: 1,
        terms_accepted_at: new Date().toISOString(),
      });

      const { status, message } = response.data;

      if (status === "success") {
        handleSuccessRegister();
      } else {
        Alert.alert('Registration Failed', message || 'An unknown error occurred during registration.');
      }
    } catch (error) {
      if (error.response) {
        const serverMessage =
          error.response.data?.message ||
          JSON.stringify(error.response.data) ||
          'Unexpected error from server.';
        Alert.alert('Server Error', serverMessage);
      } else if (error.request) {
        Alert.alert('Network Error', 'No response received from the server. Please check your internet connection.');
      } else {
        Alert.alert('Error', `Unexpected error occurred: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }

  };

  const renderFirstModal = () => (
    <Modal
      visible={showFirstModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowFirstModal(false)}
    >
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
    </Modal>
  );

  const renderTermsModal = () => (
    <Modal
      visible={showTermsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        setShowTermsModal(false);
        setHasScrolledToBottom(false);
      }}
    >
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.termsModalContainer}>
          <View style={styles.termsHeader}>
            <Text style={styles.termsTitle}>
              {isChef ? "Chef Terms and Conditions" : "User Terms and Conditions"}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowTermsModal(false);
                setHasScrolledToBottom(false);
              }}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            ref={scrollViewRef}
            style={styles.termsScrollView}
            onScroll={handleScroll}
            onContentSizeChange={handleContentSizeChange}
            scrollEventThrottle={16}
          >
            {isChef ? <ChefTerms /> : <UserTerms />}
            <View style={styles.scrollIndicator}>
              <Text style={styles.scrollIndicatorText}>
                {hasScrolledToBottom
                  ? "✓ You have read all terms and conditions"
                  : "Please scroll to read all terms and conditions"}
              </Text>
            </View>
          </ScrollView>
          <View style={styles.termsButtonContainer}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                !hasScrolledToBottom && styles.disabledButton
              ]}
              onPress={handleTermsAcceptance}
              disabled={!hasScrolledToBottom}
            >
              <Text style={styles.primaryButtonText}>Accept Terms</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );

  const renderRegistrationForm = () => (
    <SafeAreaView style={[styles.safeArea, { paddingTop: STATUS_BAR_HEIGHT }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            resetForm();
            setShowFirstModal(true);
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Register as {isChef ? "Chef" : "User"}
        </Text>
        <View style={{ width: 24 }} />
      </View>
      <KeyboardAvoidingView
        style={styles.formContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.signupText}>SIGN UP</Text>
            <Text style={styles.subText}>
              {!isChef
                ? "From home dinners to special events, we've got the perfect chef for you. Sign up and start your search!"
                : "Sign up to showcase your culinary skills and connect with top kitchens looking for chefs like you!"
              }
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              {errors.FirstName && <Text style={styles.errorText}>{errors.FirstName}</Text>}
              <TextInput
                style={styles.input}
                placeholder="Enter your first name"
                placeholderTextColor="#8c8c8c"
                value={FirstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  if (errors.FirstName) setErrors({ ...errors, FirstName: null });
                }}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Middle Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your middle name"
                placeholderTextColor="#8c8c8c"
                value={MiddleName}
                onChangeText={setMiddleName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              {errors.LastName && <Text style={styles.errorText}>{errors.LastName}</Text>}
              <TextInput
                style={styles.input}
                placeholder="Enter your last name"
                placeholderTextColor="#8c8c8c"
                value={LastName}
                onChangeText={(text) => {
                  setLastName(text);
                  if (errors.LastName) setErrors({ ...errors, LastName: null });
                }}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                placeholderTextColor="#8c8c8c"
                keyboardType="email-address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#8c8c8c"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (errors.phone) setErrors({ ...errors, phone: null });
                }}
                maxLength={15}
              />
            </View>



            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor="#8c8c8c"
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#8c8c8c"
                secureTextEntry
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                }}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.termsButton}
                onPress={() => setShowTermsModal(true)}
              >
                <Text style={styles.termsButtonText}>
                  Read {isChef ? "Chef" : "User"} Terms and Conditions
                </Text>
              </TouchableOpacity>
              {termsAccepted && (
                <View style={styles.termsAcceptedContainer}>
                  <Text style={styles.termsAcceptedText}>
                    ✓ You have accepted the terms and conditions
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  !termsAccepted && styles.disabledButton
                ]}
                onPress={registerUserWithRole}
                disabled={!termsAccepted || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>SIGN UP</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.navigate('LoginScreen')}
              >
                <Text style={styles.loginText}>
                  Already have an account? <Text style={styles.loginTextHighlight}>LOG IN</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  return (
    <View style={styles.container}>
      {renderFirstModal()}
      {renderTermsModal()}
      {!showFirstModal && !showTermsModal && step === 1 && renderRegistrationForm()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    zIndex: 1001,
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: '600',
    color: '#333',
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: '600',
    color: '#333',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 0, // Removed padding to allow full width header
    paddingBottom: isTablet ? 40 : 20,
  },
  headerContainer: {
    backgroundColor: '#ff0000',
    width: '100%',
    paddingVertical: isTablet ? 40 : 30,
    paddingHorizontal: isTablet ? 60 : 30,
    marginBottom: isTablet ? 30 : 20,
    alignItems: 'flex-start', // Left align content
  },
  form: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: isTablet ? 60 : 30, // Added padding here for form inputs
  },
  input: {
    width: '100%',
    height: isTablet ? 60 : 50,
    fontSize: isTablet ? 18 : 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: isTablet ? 25 : 15,
    paddingHorizontal: 0,
    backgroundColor: 'transparent', // Reset
    borderRadius: 0, // Reset
    borderWidth: 0, // Reset
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 0,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: isTablet ? 40 : 20,
    width: '100%',
  },
  buttonGroup: {
    width: '100%',
    maxWidth: 400,
    marginTop: 20,
  },
  signupText: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: '800', // Stronger weight
    color: '#fff',
    marginBottom: 8, // Tighter spacing
    textAlign: 'left',
    letterSpacing: 1, // Add spacing for "premium" feel
    textTransform: 'uppercase',
  },
  subText: {
    fontSize: isTablet ? 16 : 15,
    color: 'rgba(255, 255, 255, 0.9)', // Softer white
    textAlign: 'left',
    marginBottom: 0,
    lineHeight: isTablet ? 24 : 20,
    maxWidth: 600, // Prevent too wide lines on tablets
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: isTablet ? 21 : 14,
  },
  loginTextHighlight: {
    color: '#ff0000',
    fontWeight: '600',
  },
  termsModalContainer: {
    flex: 1,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    padding: 0,
    overflow: 'hidden',
  },
  termsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#f8f8f8',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  termsScrollView: {
    flex: 1,
    padding: 20,
  },
  termsTitle: {
    fontSize: isTablet ? 28 : 18,
    fontWeight: 'bold',
    color: '#BB0000',
  },
  termsContent: {
    padding: 10,
  },
  termsSectionTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: '#BB0000',
    marginTop: 10,
    marginBottom: 10,
  },
  termsBulletContainer: {
    marginBottom: 15,
  },
  termsBulletPoint: {
    fontSize: isTablet ? 16 : 14,
    color: '#333',
    marginBottom: 8,
    paddingLeft: 10,
    lineHeight: isTablet ? 24 : 20,
  },
  termsButtonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#f8f8f8',
  },
  termsButton: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  termsButtonText: {
    color: '#209E00',
    fontSize: isTablet ? 16 : 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  termsAcceptedContainer: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  termsAcceptedText: {
    color: '#2e7d32',
    fontSize: isTablet ? 14 : 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#ff0000',
    borderRadius: 5,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: isTablet ? 20 : 10,
    width: '100%',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: isTablet ? 20 : 17,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#B0BEC5',
    opacity: 0.7,
  },
  scrollIndicator: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  scrollIndicatorText: {
    fontSize: isTablet ? 14 : 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SignupScreen;
