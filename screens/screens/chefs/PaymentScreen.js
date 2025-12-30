import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../../config';

const PaymentScreen = () => {
  // Dynamically require Stripe only on native platforms to avoid web bundling errors
  let confirmPayment = null;
  let StripeCardField = null;
  if (Platform.OS !== 'web') {  
    try {
      const stripe = require('@stripe/stripe-react-native');
      const stripeHook = stripe.useStripe();
      confirmPayment = stripeHook.confirmPayment;
      StripeCardField = stripe.CardField;
    } catch (e) {
      console.warn('Stripe native module not available:', e?.message);
    }
  }

  const [loading, setLoading] = useState(false);

  const fetchPaymentIntent = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}stripe/create-payment-intent.php`,
        {
          amount: 50000,
        }
      );

      return res.data;
    } catch (error) {
      console.log('Backend error:', error.response?.data || error.message);
      return { error: 'Server error' };
    }
  };

  const handlePay = async () => {
    setLoading(true);
    const { clientSecret, error: intentError } = await fetchPaymentIntent();

    if (intentError || !clientSecret) {
      setLoading(false);
      return Alert.alert('Error', intentError || 'Invalid response');
    }

    if (!confirmPayment) {
      setLoading(false);
      return Alert.alert(
        'Error',
        'Stripe native module not available on this platform'
      );
    }

    const { error, paymentIntent } = await confirmPayment(clientSecret, {
      paymentMethodType: 'Card',
    });

    setLoading(false);

    if (error) {
      return Alert.alert('Payment Failed', error.message);
    }

    Alert.alert('Success', 'Payment completed!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Secure Payment</Text>
      <Text style={styles.subtitle}>Enter your card details to continue</Text>

      <View style={styles.cardContainer}>
        {Platform.OS !== 'web' && StripeCardField ? (
          <StripeCardField
            postalCodeEnabled={false}
            style={{ height: 50, width: '100%' }}
            cardStyle={{ backgroundColor: '#ffffff', textColor: '#000000' }}
          />
        ) : (
          <Text style={{ textAlign: 'center', color: '#666' }}>
            Card input is available only on native builds. Use the dev-client on
            a device to test payments.
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.payButton, loading && { opacity: 0.7 }]}
        onPress={handlePay}
        disabled={loading}
      >
        <Text style={styles.payText}>
          {loading ? 'Processing...' : 'Pay ₹1.00'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.secureText}>
        🔒 Payments are securely encrypted via Stripe
      </Text>
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  cardContainer: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 24,
  },
  cardField: {
    height: 120, // 👈 gives enough space for all fields
    width: '100%',
  },

  payButton: {
    backgroundColor: '#0A7AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  payText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secureText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 12,
    color: '#777',
  },
});
