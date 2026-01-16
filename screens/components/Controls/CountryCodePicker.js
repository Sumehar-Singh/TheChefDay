import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const countries = [
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+1', country: 'USA', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+1', country: 'Canada', flag: '🇨🇦' },
    // Add more as needed
];

const CountryCodePicker = ({ selectedCode, onSelect }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const isTablet = Dimensions.get('window').width > 600;

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => {
                onSelect(item.code);
                setModalVisible(false);
            }}
        >
            <Text style={styles.flag}>{item.flag}</Text>
            <Text style={styles.countryName}>{item.country}</Text>
            <Text style={styles.code}>{item.code}</Text>
        </TouchableOpacity>
    );

    return (
        <View>
            <TouchableOpacity
                style={styles.trigger}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.triggerText}>{selectedCode}</Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Select Country Code</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={countries}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => `${item.code}-${index}`}
                            contentContainerStyle={styles.listContent}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#fff',
        height: 50, // Match typical input height
        width: 90,
        marginRight: 10,
    },
    triggerText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        maxHeight: '70%',
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 5,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#f9f9f9',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    listContent: {
        paddingVertical: 10,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    flag: {
        fontSize: 24,
        marginRight: 15,
    },
    countryName: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    code: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
});

export default CountryCodePicker;
