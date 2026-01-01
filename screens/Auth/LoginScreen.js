import React, { useState, useEffect } from 'react';
import { BASE_URL } from "../../config";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Dimensions, ImageBackground, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../../components/Controls/CustomButton';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getUserDimentions from '../components/strings/users/UserDimentions';
import { useAuth } from '../../components/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
const { width, height } = Dimensions.get('window');
const isTablet = width > 600;
export default function LoginScreen({ navigation }) {
  // const [email, setEmail] = useState('user@gmail.com');
  // const [password, setPassword] = useState('Info@123#');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const { login } = useAuth();

  // useEffect(() => {
  //   const isLoggedIn = async () => {
  //     const usrId = await AsyncStorage.getItem("userid");

  //     if(usrId)
  //     {

  //       const roleId = await AsyncStorage.getItem("role_id");

  //       if(roleId==2)
  //       {
  //         navigation.navigate("UserDashboard");
  //       }
  //       else if(roleId==3)
  //       {
  //         navigation.navigate("ChefDashboard");
  //       }
  //     }
  //   };
  //   isLoggedIn();
  // }, []);

  const loginUser = async (email, password) => {

    if (!email || !password) {
      setLoginError("Email/Username and password are required");
      setLoading(false);

      return;  // Exit early without making the request
    }
    //console.log(`${BASE_URL}login2.php`);
    console.log("You are running with this URL: ", BASE_URL);
    try {
      const response = await axios.post(`${BASE_URL}login2.php`, {
        email: email,
        password: password
      });

      if (response.data.status === "success") {
        // Use the centralized login function with navigation
        await login(response.data.app_user, response.data.profile, navigation);
      } else {
        setLoginError("Username or Password is incorrect");
        console.log('Login failed:', response.data.message);
      }
    } catch (error) {
      if (error.response) {
        console.error('Error response from server:', error.response.data);
      } else if (error.request) {
        console.error('Error request made, no response received:', error.request);
      } else {
        console.error('Error during setup of request:', error.message);
      }
    }
    setLoading(false);

  };

  // Example usage

  const handleLogin = () => {
    setLoginError("");
    setLoading(true);

    // Handle login logic here
    //fetchData();
    //registerUserWithRole('test2@example.com', 'Info@123#', 2); // 1 = Admin
    loginUser(email, password); // 1 = Admin


  };



  const handleCancel = () => {
    // Handle cancel logic here
    console.log('Cancel clicked');
  };
  return (
    <LinearGradient colors={['white', '#f2f2f2', '#e6e6e6']} style={styles.superContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={false} />
      <SafeAreaView style={styles.safeArea}>
        {/* Back Arrow */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: Platform.OS === 'ios' ? 60 : 40,
            left: 20,
            zIndex: 999,
          }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>

        <KeyboardAvoidingView
          style={styles.formContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          {/* <View style={styles.TopSVG}>
        <ImageBackground
        source={require('../../assets/TopSVG.png')} // Local image file
        style={styles.topSection}
        resizeMode='cover'
      >
      
      
      </ImageBackground></View> */}
          <View style={styles.container}>
            <View style={styles.logoContainer}>
              <Image source={require('../../assets/logo.png')} style={styles.logo} />
              {/* <Text style={styles.appTitle}>The <Text style={styles.appTitleHighlight}>Chef </Text>Day</Text> */}
            </View>

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Email or Username"
                placeholderTextColor="#8c8c8c"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#8c8c8c"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <Text style={styles.loginFailed}>{loginError}</Text>
              <CustomButton
                title="LOG IN"
                onPress={handleLogin}
                isLoading={loading}
                type="primary"
              />

              <TouchableOpacity style={styles.signupLink} onPress={() => navigation.navigate('SignupScreen', { fromScreen: 'Login' })}>
                <Text style={styles.signupText}>If you don’t have an account <Text style={styles.signupTextHighlight}>SIGN UP</Text></Text>
              </TouchableOpacity>






              {/* Guest Button Removed - User navigates from Home -> Login, so 'Back' is sufficient */}
              {/* <View style={styles.exploreContainer}>
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.divider} />
                </View>

                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => navigation.navigate('Home')}
                >
                  <Ionicons name="search" size={20} color="#fff" style={styles.exploreIcon} />
                  <Text style={styles.exploreButtonText}>Continue as Guest</Text>
                </TouchableOpacity>

              </View> */}
            </View>

          </View>

        </KeyboardAvoidingView>
        <View style={styles.BottomSVG}>
          <ImageBackground
            source={require('../../assets/BottomSVG.png')} // Local image file
            style={styles.bottomSection}
            resizeMode='cover'
          >
          </ImageBackground></View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  superContainer: {
    // flex: 1,
    backgroundColor: '#FFF',
    height: "100%",
    justifyContent: 'center',
    // paddingBottom:isTablet?"20%":0

  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  TopSVG: {
    height: isTablet ? 160 : 120,

    width: "100%",
    position: "absolute",
    top: 0
  },
  topSection: {



    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,


  },
  BottomSVG: {
    height: isTablet ? 160 : 70,

    width: "100%",
    position: "absolute",
    bottom: 0
  },
  bottomSection: {

    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,



  },
  container: {

    paddingHorizontal: isTablet ? 60 : 30,
    paddingVertical: "10%"
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: "center",
    marginBottom: 15,
    marginTop: 50,

  },
  logo: {
    width: isTablet ? 220 : 150,
    height: isTablet ? 190 : 130,
    marginBottom: 10,
  },
  appTitle: {
    fontSize: isTablet ? 32 : 24,
    fontWeight: '500',
    color: 'black', textShadowColor: '#585858',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  appTitleHighlight: {
    color: '#ff0000',
    fontWeight: '600',
    fontSize: isTablet ? 35 : 26,
  },
  loginText: {
    fontSize: isTablet ? 27 : 20,
    fontWeight: '600',
    color: 'black',
    marginBottom: isTablet ? 20 : 10,
    textShadowColor: '#585858',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,

  },
  subText: {
    fontSize: isTablet ? 22 : 15,
    color: '#222',

    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 50,
    fontSize: isTablet ? 23 : 17,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: isTablet ? 25 : 15,
    paddingHorizontal: 0,
  },

  signupLink: {
    marginTop: isTablet ? 30 : 20,
    alignItems: 'center',
  },
  signupText: {
    color: '#666',
    fontSize: isTablet ? 21 : 14,
  },
  signupTextHighlight: {
    color: '#ff0000',
    fontWeight: '600',
  },
  loginFailed: {
    color: "red",

  },
  svgContainer: {
    position: "absolute",
    top: 0,
    width: "100%",
  },
  svgContainerBottom: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },


  exploreContainer: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 14,
  },
  exploreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exploreIcon: {
    marginRight: 10,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
