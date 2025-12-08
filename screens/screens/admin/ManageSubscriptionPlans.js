import React, { useState, useEffect,useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../../../config';
import { SafeAreaView } from 'react-native-safe-area-context';
import DropDownPicker from 'react-native-dropdown-picker';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const ManageSubscriptionPlans = () => {
    const [refreshing, setRefreshing] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    Duration: '',
    Price: '',
    Header: '',
    Desc: '',
    Recommended: false,
    Special: false,
  });
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(formData.Duration || null);
  const [items, setItems] = useState([
    { label: '1 Month', value: '1 Month' },
    { label: '2 Months', value: '2 Months' },
    { label: '3 Months', value: '3 Months' },
    { label: '6 Months', value: '6 Months' },
    { label: '1 Year', value: '1 Year' },
    { label: '2 Years', value: '2 Years' },
  ]);
  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    setValue(formData.Duration); // Sync when formData updates (e.g. on edit)
  }, [formData.Duration]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      await fetchPlans();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/get_subscription_plans.php`);
      if (response.data.status === 'success') {
        setPlans(response.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingPlan(null);
    setFormData({
      Duration: '',
      Price: '',
      Header: '',
      Desc: '',
      Recommended: false,
      Special: false,
    });
    setModalVisible(true);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      Duration: plan.Duration,
      Price: plan.Price.toString(),
      Header: plan.Header,
      Desc: plan.Desc,
      Recommended: plan.Recommended === '1' || plan.Recommended === 1,
  Special: plan.Special === '1' || plan.Special === 1,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this subscription plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.post(`${BASE_URL}/admin/delete_subscription_plan.php`, {
                Id: id,
              });
              if (response.data.success) {
                //Alert.alert('Success', 'Plan deleted successfully');
                fetchPlans();
              } else {
                Alert.alert('Error', response.data.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete plan');
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    try {
      const url = editingPlan
        ? `${BASE_URL}/admin/update_subscription_plan.php`
        : `${BASE_URL}/admin/add_subscription_plan.php`;


       
      const fData={
        Id: editingPlan?.Id,
        Duration: formData.Duration,
        Price: formData.Price,
        Header: formData.Header,
        Desc: formData.Desc,
        Recommended: formData.Recommended ? '1' : '0',
        Special: formData.Special ? '1' : '0',
      }

     
      const response = await axios.post(url, fData);
      
      if (response.data.success) {
        //Alert.alert('Success', `Plan ${editingPlan ? 'updated' : 'added'} successfully`);
     
        setModalVisible(false);
        fetchPlans();
      } else {
      
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${editingPlan ? 'update' : 'add'} plan`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#805500" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Subscription Plans</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
          <Ionicons name="add-circle-outline" size={isTablet ? 32 : 24} color="#805500" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}
      
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#805500']}
          tintColor="#805500"
        />
      }
      >
        {plans.map((plan) => (
          <View key={plan.Id} style={styles.planCard}>
            <View style={styles.planHeader}>
              <View style={styles.planTitleContainer}>
                <Text style={styles.planTitle}>{plan.Header}</Text>
               
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => handleEdit(plan)} style={styles.actionButton}>
                  <Ionicons name="pencil" size={isTablet ? 24 : 20} color="#805500" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(plan.Id)} style={styles.actionButton}>
                  <Ionicons name="trash" size={isTablet ? 24 : 20} color="#FF4F4F" />
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={styles.planDuration}>Duration: {plan.Duration}</Text>
            <Text style={styles.planPrice}>Price: ${plan.Price}</Text>
            <Text style={styles.planDesc}>{plan.Desc}</Text>
            <View style={styles.planFooterContainer}>
              
                {plan.Recommended && (
                  <View style={[styles.badge, styles.recommendedBadge]}>
                    <Text style={styles.badgeText}>Recommended</Text>
                  </View>
                )}
                {plan.Special && (
                  <View style={[styles.badge, styles.specialBadge]}>
                    <Text style={styles.badgeText}>Special</Text>
                  </View>
                )}
              </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingPlan ? 'Edit Subscription Plan' : 'Add New Plan'}
            </Text>



            <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={(callback) => {
          const selectedValue = callback(value);
          setValue(selectedValue);
          setFormData({ ...formData, Duration: selectedValue });
        }}
        setItems={setItems}
        placeholder="Select Duration"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        textStyle={styles.dropdownText}
        placeholderStyle={styles.placeholderStyle}
      />


            {/* <TextInput
              style={styles.input}
              placeholder="Duration (e.g., 1 Month)"
              value={formData.Duration}
              onChangeText={(text) => setFormData({ ...formData, Duration: text })}
            /> */}

            <TextInput
              style={styles.input}
              placeholder="Price"
              value={formData.Price}
              keyboardType="numeric"
              onChangeText={(text) => setFormData({ ...formData, Price: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Header"
              value={formData.Header}
              onChangeText={(text) => setFormData({ ...formData, Header: text })}
            />

            <TextInput
              style={[styles.input, styles.descInput]}
              placeholder="Description"
              value={formData.Desc}
              multiline
              numberOfLines={4}
              onChangeText={(text) => setFormData({ ...formData, Desc: text })}
            />

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Recommended</Text>
              <Switch
                value={formData.Recommended}
                onValueChange={(value) => setFormData({ ...formData, Recommended: value })}
                trackColor={{ false: '#767577', true: '#805500' }}
                thumbColor={formData.Recommended ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Special</Text>
              <Switch
                value={formData.Special}
                onValueChange={(value) => setFormData({ ...formData, Special: value })}
                trackColor={{ false: '#767577', true: '#805500' }}
                thumbColor={formData.Special ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={[styles.buttonText, styles.submitButtonText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    
   
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isTablet ? 20 : 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
   
 
  },
  headerTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: '#805500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: isTablet ? 12 : 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#805500',
  },
  addButtonText: {
    color: '#805500',
    marginLeft: 8,
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: isTablet ? 20 : 15,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: isTablet ? 20 : 15,
    marginBottom: isTablet ? 35 : 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  planTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  planFooterContainer:{
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop:10
  },
  planTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  recommendedBadge: {
    backgroundColor: '#4CAF5020',
  },
  specialBadge: {
    backgroundColor: '#80550020',
  },
  badgeText: {
    fontSize: isTablet ? 12 : 10,
    color: '#333',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  planDuration: {
    fontSize: isTablet ? 16 : 14,
    color: '#666',
    marginBottom: 5,
  },
  planPrice: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: '#805500',
    marginBottom: 10,
  },
  planDesc: {
    fontSize: isTablet ? 16 : 14,
    color: '#666',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: isTablet ? 30 : 20,
    width: isTablet ? '60%' : '90%',
    maxWidth: 600,
  },
  modalTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: isTablet ? 15 : 12,
    marginBottom: 15,
    fontSize: isTablet ? 16 : 14,
  },
  descInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: isTablet ? 16 : 14,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: isTablet ? 15 : 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#805500',
  },
  buttonText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  submitButtonText: {
    color: '#FFFFFF',
  },

  dropdown: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  dropdownContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderStyle: {
    color: '#999',
    fontSize: 16,
  },
});

export default ManageSubscriptionPlans;
