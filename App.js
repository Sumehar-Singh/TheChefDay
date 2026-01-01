import React, { useEffect } from 'react';
import { Alert } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import PopUpScreen from './screens/screens/PopUpScreen';
import Home from './screens/screens/guests/Home';

import LoginScreen from './screens/Auth/LoginScreen';
import SignupScreen from './screens/Auth/SignupScreen';

//Chef
import ChefDashboard from './screens/screens/chefs/ChefDashboard';
import ChefEditProfile from './screens/screens/chefs/ChefEditProfile';

import ChefSettings from './screens/screens/chefs/ChefSettings';
import UpdateChefPricing from './screens/screens/chefs/UpdateChefPricing';
import ChefBookingDetail from './screens/screens/chefs/ChefBookingDetail';
import BookingAcceptedScreen from './screens/components/BookingAcceptedScreen';
import ChefReviews from './screens/screens/chefs/ChefReviews';
import SubscriptionPlans from './screens/screens/chefs/SubscriptionPlans';
import SubscriptionDetail from './screens/screens/chefs/SubscriptionDetail';
import ChefProfileStatus from './screens/screens/chefs/ChefProfileStatus';
import ChefTermsScreen from './screens/screens/chefs/ChefTermsScreen';
import Bookings from './screens/screens/chefs/Bookings';
import UploadDocuments from './screens/screens/chefs/UploadDocuments';
import DeleteChefAccount from './screens/screens/chefs/DeleteChefAccount';
//User
import UserDashboard from './screens/screens/users/UserDashboard';
import ChefDetail from './screens/screens/users/ChefDetail';
import ChefsList from './screens/screens/users/ChefsList';
import UserSettings from './screens/screens/users/UserSettings';
import UserEditProfile from './screens/screens/users/UserEditProfile';
import AddBooking from './screens/screens/users/AddBooking';
import BookingDetail from './screens/screens/users/BookingDetail';
import AdminDashboard from './screens/screens/admin/AdminDashboard';
import ManageSubscriptionPlans from './screens/screens/admin/ManageSubscriptionPlans';
import UserTermsScreen from './screens/screens/users/UserTermsScreen';
import { AuthProvider } from './components/contexts/AuthContext';
import AnimatedSplash from './screens/Auth/AnimatedSplash';
import AllBookings from './screens/screens/users/AllBookings';
import DeleteUserAccount from './screens/screens/users/DeleteUserAccount';
import PaymentScreen from './screens/screens/chefs/PaymentScreen';

const Stack = createStackNavigator();

// Wrap StripeProvider with a dynamic import to avoid bundling native modules at startup
function StripeProviderWrapper({ children }) {
  try {
    const { StripeProvider: SP } = require('@stripe/stripe-react-native');
    return (
      <SP publishableKey="pk_test_51S8esf2UcXOB5Q4qU8qNzYRVfy2cxgKPrgyJ3vsJMPPqwwifju9sf8ZYbpWrT4syqAs6K1MZTHD2EjblBT88fEhR006Hiafxc2">
        {children}
      </SP>
    );
  } catch (e) {
    console.warn('Stripe not available:', e?.message);
    // Fallback: just render children without Stripe wrapper
    return children;
  }
}

export default function App() {


  return (
    <AuthProvider>
      <StripeProviderWrapper>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              ...TransitionPresets.SlideFromRightIOS,
            }}
            initialRouteName="AnimatedSplash"
          >
            <Stack.Screen name="AnimatedSplash" component={AnimatedSplash} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="SignupScreen" component={SignupScreen} />
            <Stack.Screen name="PaymentScreen" component={PaymentScreen} />

            <Stack.Screen name="ChefDashboard" component={ChefDashboard} />
            <Stack.Screen name="ChefSettings" component={ChefSettings} />
            <Stack.Screen
              name="UpdateChefPricing"
              component={UpdateChefPricing}
            />

            <Stack.Screen
              name="ChefBookingDetail"
              component={ChefBookingDetail}
            />
            <Stack.Screen
              name="BookingAcceptedScreen"
              component={BookingAcceptedScreen}
            />
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen
              name="ManageSubscriptionPlans"
              component={ManageSubscriptionPlans}
            />

            <Stack.Screen name="ChefEditProfile" component={ChefEditProfile} />
            <Stack.Screen
              name="SubscriptionPlans"
              component={SubscriptionPlans}
            />
            <Stack.Screen
              name="SubscriptionDetail"
              component={SubscriptionDetail}
            />
            <Stack.Screen
              name="ChefProfileStatus"
              component={ChefProfileStatus}
            />
            <Stack.Screen name="ChefTermsScreen" component={ChefTermsScreen} />
            <Stack.Screen name="Bookings" component={Bookings} />
            <Stack.Screen name="UploadDocuments" component={UploadDocuments} />
            <Stack.Screen
              name="DeleteChefAccount"
              component={DeleteChefAccount}
            />

            <Stack.Screen name="ChefReviews" component={ChefReviews} />
            <Stack.Screen name="UserDashboard" component={UserDashboard} />
            <Stack.Screen name="ChefDetail" component={ChefDetail} />
            <Stack.Screen name="ChefsList" component={ChefsList} />
            <Stack.Screen name="UserSettings" component={UserSettings} />
            <Stack.Screen name="UserEditProfile" component={UserEditProfile} />
            <Stack.Screen name="AddBooking" component={AddBooking} />
            <Stack.Screen name="BookingDetail" component={BookingDetail} />
            <Stack.Screen name="UserTermsScreen" component={UserTermsScreen} />
            <Stack.Screen name="AllBookings" component={AllBookings} />
            <Stack.Screen
              name="DeleteUserAccount"
              component={DeleteUserAccount}
            />
            <Stack.Screen name="PopUpScreen" component={PopUpScreen} />

            {/* You can add more screens here for your app, e.g., RegisterScreen, HomeScreen */}
          </Stack.Navigator>
        </NavigationContainer>
      </StripeProviderWrapper>
    </AuthProvider>
  );
}
