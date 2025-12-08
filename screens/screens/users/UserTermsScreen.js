
import React ,{useEffect,useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDate } from '../../components/utils';
import UserTerms from '../../components/Terms/UserTerms';
const { width } = Dimensions.get('window');
const isTablet = width > 600;
import { useAuth } from '../../../components/contexts/AuthContext';
import CustomStatusBar from '../../components/CustomStatusBar';
const UserTermsScreen = ({ navigation }) => {
  // This would typically come from your backend/state management
  const [acceptanceDate,setAcceptanceDate] = useState('');
  const {profile}=useAuth();

  useEffect(() => {
    const fetchTermDate = async () => {
     
            try {
              const response = await axios.get(`${BASE_URL}shared/get_term_date.php`, {
                params: { UserId: profile.Id, Role:'User' },
              });
        
             
              if (response.data.status === 'success') {
                const acceptedAt = response.data.Terms_Accepted_At;
                setAcceptanceDate(acceptedAt); // use your function here
              } else {
                console.error('Error fetching assigned specialities:', response.data.message);
                return [];
              }
            } catch (error) {
              console.error('Error fetching assigned specialities:', error);
              return [];
            }
        
    };

   
    
        fetchTermDate();
   
 
   
  }, []);
  return (
    <SafeAreaView style={styles.container}>
     <CustomStatusBar title="User Terms & Conditions" includeTopInset={false} />
      
      {/* Header */}
    

      {/* Acceptance Info */}
      <View style={styles.acceptanceContainer}>
        <View style={styles.acceptanceBadge}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.acceptanceText}>Accepted on {formatDate(acceptanceDate)}</Text>
        </View>
      </View>

      {/* Terms Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
       <UserTerms/>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
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
  acceptanceContainer: {
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  acceptanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  acceptanceText: {
    marginLeft: 8,
    color: '#2E7D32',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    padding:20
  },
  
});

export default UserTermsScreen;
