import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  RefreshControl, 
  ActivityIndicator, 
  Dimensions,
  Image,Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import { BASE_URL } from '../../../config';
import CustomStatusBar from '../../components/CustomStatusBar';
import CustomModal from '../../../components/CustomModal';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../../components/contexts/AuthContext';
// File handling using expo-document-picker only

const { width } = Dimensions.get('window');
const isTablet = width > 600;
//Status: 1 Under Review, 2 Approved, 0 Rejected
const UploadDocuments = () => {
  const [docTypes, setDocTypes] = useState({
    pending: [],    // Documents that need to be uploaded
    uploaded: []    // Documents that are already uploaded
  });
  const [selectedFiles, setSelectedFiles] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const { profile } = useAuth();
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    showCancel: true,
  });

  // Show modal helper function
  const showModal = (title, message, type = 'info', onConfirm = null, showCancel = true) => {
    setModalConfig({
      title,
      message,
      type,
      onConfirm: onConfirm ? () => {
        setModalVisible(false);
        onConfirm();
      } : () => setModalVisible(false),
      showCancel,
    });
    setModalVisible(true);
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
  };

  // Fetch document types from API
  const fetchDocumentTypes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}chefs/get_chef_document_types.php`,{ChefId: profile.Id});
      
      if (response.data && response.data.success) {
        const allDocs = response.data.data || [];
        setDocTypes({
          pending: allDocs.filter(doc => doc.IsExists !== 1),
          uploaded: allDocs.filter(doc => doc.IsExists === 1)
        });
      } else {
        console.log('Failed to fetch document types');
      }
    } catch (error) {
      console.error('Error fetching document types:', error);
      Alert.alert('Error', 'Failed to load document types. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDocumentTypes();
  }, [fetchDocumentTypes]);

  // Initial load
  useEffect(() => {
    fetchDocumentTypes();
  }, [fetchDocumentTypes]);

  // Handle document selection
  const handleDocumentPick = async (docTypeId) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        copyToCacheDirectory: true,
      });

      console.log('Document picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
        
        if (!allowedExtensions.includes(fileExtension)) {
          Alert.alert('Invalid file type', 'Please upload a PDF, JPG, PNG, or Word document');
          return;
        }
        
        // Create a clean file object with the correct structure
        const fileToUpload = {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
          size: file.size
        };
        
        console.log('Selected file:', fileToUpload);
        
        // Update the selected files state
        setSelectedFiles(prev => ({
          ...prev,
          [docTypeId]: fileToUpload
        }));
      }
    } catch (error) {
      console.error('Error picking document:', error);
      if (error.code !== 'E_DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', 'Failed to select document. Please try again.');
      }
    }
  };

  // Format date to a readable format (MM/DD/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status counts from documents
  const getStatusCounts = useCallback(() => {
    const counts = {
      inReview: 0,
      approved: 0,
      rejected: 0,
      total: docTypes.uploaded.length
    };

    docTypes.uploaded.forEach(doc => {
      if (doc.Status === 1) counts.inReview++;
      else if (doc.Status === 2) counts.approved++;
      else if (doc.Status === 0) counts.rejected++;
    });

    return counts;
  }, [docTypes.uploaded]);

  // Get status text and color based on status code
  const getStatusInfo = (status) => {
    switch(status) {
      case 1: return { text: 'In Review', color: '#FFA500', bgColor: '#FFF3E0' }; // Orange
      case 2: return { text: 'Approved', color: '#4CAF50', bgColor: '#E8F5E9' }; // Green
      case 0: return { text: 'Rejected', color: '#f44336', bgColor: '#FFEBEE' }; // Red
      default: return { text: 'Pending', color: '#9E9E9E', bgColor: '#FAFAFA' }; // Gray
    }
  };

  // Render status summary cards
  const renderStatusSummary = () => {
    if (docTypes.uploaded.length === 0) return null;
    
    const counts = getStatusCounts();
    const statuses = [
      { type: 'inReview', label: 'In Review', icon: 'schedule', count: counts.inReview },
      { type: 'approved', label: 'Approved', icon: 'check-circle', count: counts.approved },
      { type: 'rejected', label: 'Rejected', icon: 'cancel', count: counts.rejected },
      { type: 'total', label: 'Total', icon: 'description', count: counts.total }
    ];

    return (
      <View style={styles.summaryContainer}>
        {statuses.map((status) => {
          const statusInfo = getStatusInfo(
            status.type === 'inReview' ? 1 : 
            status.type === 'approved' ? 2 : 
            status.type === 'rejected' ? 0 : -1
          );
          
          return (
            <View 
              key={status.type}
              style={[
                styles.summaryCard, 
                { 
                  backgroundColor: statusInfo.bgColor,
                  borderLeftWidth: 4,
                  borderLeftColor: statusInfo.color,
                  width: isTablet ? '24%' : '48%',
                  marginBottom: isTablet ? 0 : 10
                }
              ]}
            >
              <View style={styles.summaryContent}>
                <View style={[styles.summaryIcon, { backgroundColor: `${statusInfo.color}20` }]}>
                  <MaterialIcons name={status.icon} size={20} color={statusInfo.color} />
                </View>
                <View style={styles.summaryTextContainer}>
                  <Text style={styles.summaryCount}>{status.count}</Text>
                  <Text style={[styles.summaryLabel, { color: statusInfo.color }]}>
                    {status.label}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // Handle document opening
  const handleOpenDocument = async (url) => {
    if (!url) return;
    try {
      await WebBrowser.openBrowserAsync(url, {
        enableBarCollapsing: true,
        showTitle: true,
        toolbarColor: '#ff0000',
        controlsColor: '#ffffff'
      });
    } catch (error) {
      console.error('Error opening document:', error);
      showModal('Error', 'Could not open the document. Please try again.', 'error');
    }
  };

  // Handle document deletion
  const handleDelete = (documentId, docTypeName) => {
    showModal(
      'Delete Document',
      (
        <Text>
          Are you sure you want to delete this <Text style={{ fontWeight: 'bold' }}>{docTypeName}</Text>?
        </Text>
      ),
      'confirm',
      async () => {
        try {
          setUploading(true);
          const response = await axios.post(
            `${BASE_URL}chefs/delete_chef_document.php`,
            { Id: documentId },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.data.success) {
            // Refresh the document list
            await fetchDocumentTypes();
            showModal(
                'Success',
                (
                  <Text>
                    <Text style={{ fontWeight: 'bold' }}>{docTypeName}</Text> has been deleted successfully.
                  </Text>
                ),
                'success',
                null,
                false
              );
              
          } else {
            throw new Error(response.data.message || 'Failed to delete document');
          }
        } catch (error) {
          console.error('Error deleting document:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Failed to delete document';
          showModal('Error', errorMessage, 'error');
        } finally {
          setUploading(false);
        }
      },
      true
    );
  };

  // Handle document upload
  const handleUpload = async (docTypeId, docTypeName) => {
    const file = selectedFiles[docTypeId];
    if (!file) {
      showModal('No File Selected', 'Please select a file to upload.', 'info');
      return;
    }
    
    console.log('Starting upload for file:', file);

    try {
      setUploading(true);
      setUploadProgress(prev => ({
        ...prev,
        [docTypeId]: 0
      }));

      const formData = new FormData();
      formData.append('ChefId', profile.Id);
      formData.append('DocumentTypeId', docTypeId);
      // Create a file object for FormData
      const fileInfo = {
        uri: file.uri,
        name: file.name || `document_${Date.now()}.${file.uri.split('.').pop()}`,
        type: file.type || 'application/octet-stream'
      };
      
      // For React Native, we need to create a proper file object
      const fileToUpload = {
        uri: file.uri,
        name: fileInfo.name,
        type: fileInfo.type
      };
      
      formData.append('File', fileToUpload);

      const response = await axios.post(
        `${BASE_URL}chefs/upload_chef_document.php`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(prev => ({
              ...prev,
              [docTypeId]: progress
            }));
          },
        }
      );

      if (response.data.success) {
        // Refresh the document list
        await fetchDocumentTypes();
        
        // Clear the selected file
        setSelectedFiles(prev => {
          const newFiles = { ...prev };
          delete newFiles[docTypeId];
          return newFiles;
        });
        showModal(
            'Uploaded Success',
            (
              <Text>
                <Text style={{ fontWeight: 'bold' }}>{docTypeName}</Text> uploaded successfully and is in review!
              </Text>
            ),
            'success',
            null,
            false
          );
          
        
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed',
        error.response?.data?.message || 'Failed to upload document. Please try again.'
      );
    } finally {
      setUploading(false);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[docTypeId];
        return newProgress;
      });
    }
  };

  const renderDocumentStatus = (docType) => {
   //console.log(docType);
   // if (!docType.Status) return null;
    
   
    console.log(docType);
    return (
      <View style={styles.statusContainer}>
        
        {docType.Status !== 2 && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDelete(docType.DocumentTypeId, docType.DocumentType)}
            disabled={uploading}
          >
            <MaterialIcons name="delete" size={20} color="#f44336" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <LinearGradient 
      colors={['white', '#f2f2f2', '#e6e6e6']} 
      style={styles.container}
    >
      <CustomStatusBar title="Upload Documents" />
      
      <CustomModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
        showCancel={modalConfig.showCancel}
        confirmText={modalConfig.type === 'confirm' ? 'Delete' : 'OK'}
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff0000" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#ff0000']}
              tintColor="#ff0000"
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {/* Document Status Summary */}
          {docTypes.uploaded.length > 0 && renderStatusSummary()}
          
          {/* Uploaded Documents Section */}
          {docTypes.uploaded.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Uploaded Documents</Text>
              {docTypes.uploaded.map((docType) => {
                const statusInfo = getStatusInfo(docType.Status);
                return (
                  <View key={docType.Id} style={[styles.documentCard, styles.uploadedCard]}>
                    <View style={styles.documentHeader}>
                      <MaterialIcons 
                        name={
                          docType.Status === 2 ? "check-circle" : 
                          docType.Status === 0 ? "cancel" : "schedule"
                        } 
                        size={24} 
                        color={statusInfo.color} 
                      />
                      <Text style={styles.documentTitle}>
                        {docType.DocumentType}
                      </Text>
                    </View>
                    
                    <View style={styles.uploadedInfoContainer}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Status:</Text>
                        <Text style={[styles.infoValue, { color: statusInfo.color }]}>
                          {statusInfo.text}
                        </Text>
                      </View>
                      
                      {docType.UploadDate && (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Uploaded:</Text>
                          <Text style={styles.infoValue}>
                            {formatDate(docType.UploadDate)}
                          </Text>
                        </View>
                      )}
                      
                      {docType.ReviewedDate && (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>
                            {docType.Status === 1 ? 'Review Started:' : 'Reviewed:'}
                          </Text>
                          <Text style={styles.infoValue}>
                            {formatDate(docType.ReviewedDate)}
                          </Text>
                        </View>
                      )}
                      
                      {docType.File && (
                        <TouchableOpacity 
                          style={styles.viewDocumentButton}
                          onPress={() => handleOpenDocument(docType.File)}
                        >
                          <MaterialIcons name="visibility" size={16} color="#fff" />
                          <Text style={styles.viewDocumentText}>View Document</Text>
                        </TouchableOpacity>
                      )}
                      {renderDocumentStatus(docType)}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Pending Documents Section */}
          {docTypes.pending.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Documents to Upload
                <Text style={styles.requiredNote}>
                  {' '}(<Text style={styles.requiredStar}>*</Text> indicates required)
                </Text>
              </Text>
              {docTypes.pending.map((docType) => (
                <View
                  key={docType.Id}
                  style={[
                    styles.documentCard,
                    docType.IsRequired === 1 && styles.documentCardRequired
                  ]}
                >
                  <View style={styles.documentHeader}>
                    <MaterialIcons name="description" size={24} color="#ff0000" />
                    <Text style={styles.documentTitle}>
                      {docType.DocumentType}
                      {docType.IsRequired === 1 && <Text style={styles.requiredStar}> *</Text>}
                    </Text>
                  </View>
                  
                  <View style={styles.fileInfoContainer}>
                    <Text 
                      style={[
                        styles.fileName, 
                        !selectedFiles[docType.Id] && styles.noFileText
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="middle"
                    >
                      {selectedFiles[docType.Id]?.name || 'No file selected'}
                    </Text>
                    
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.chooseButton, (uploading && uploadProgress[docType.Id] !== undefined) && styles.disabledButton]}
                        onPress={() => handleDocumentPick(docType.Id)}
                        disabled={uploading && uploadProgress[docType.Id] !== undefined}
                      >
                        <Text style={styles.buttonText}>
                          {selectedFiles[docType.Id] ? 'Change File' : 'Choose File'}
                        </Text>
                      </TouchableOpacity>
                      
                      <View style={styles.uploadButtonContainer}>
                        <TouchableOpacity 
                          style={[
                            styles.actionButton, 
                            styles.uploadButton, 
                            (!selectedFiles[docType.Id] || uploading) && styles.uploadButtonDisabled,
                            uploadProgress[docType.Id] && { paddingHorizontal: 0 }
                          ]}
                          onPress={() => {
                            
                            handleUpload(docType.Id, docType.DocumentType);
                          }}
                          disabled={!selectedFiles[docType.Id] || uploading}
                        >
                          {uploadProgress[docType.Id] !== undefined ? (
                            <View style={styles.progressContainer}>
                              <View 
                                style={[
                                  styles.progressBar,
                                  { width: `${uploadProgress[docType.Id]}%` }
                                ]} 
                              />
                              <Text style={styles.progressText}>
                                {uploadProgress[docType.Id]}%
                              </Text>
                            </View>
                          ) : (
                            <>
                              <MaterialIcons name="cloud-upload" size={18} color="white" style={styles.uploadIcon} />
                              <Text style={styles.uploadButtonText}>
                                {uploading ? 'Uploading...' : 'Upload'}
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                        {uploadProgress[docType.Id] === 100 && (
                          <ActivityIndicator size="small" color="#fff" style={styles.uploadingIndicator} />
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            docTypes.uploaded.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialIcons name="check-circle" size={48} color="#4CAF50" />
                <Text style={styles.emptyText}>No documents to upload</Text>
              </View>
            )
          )}
        </ScrollView>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: isTablet ? 20 : 15,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: isTablet ? 20 : 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  documentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: isTablet ? 20 : 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadedCard: {
    backgroundColor: '#f8fff8',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    padding: 15,
  },
  uploadedInfoContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  viewDocumentButton: {
    flexDirection: 'row',
    backgroundColor: '#ff0000',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  viewDocumentText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '500',
    fontSize: 14,
  },
  documentCardRequired: {
    borderLeftWidth: 4,
    borderLeftColor: '#ff0000',
  },
  uploadButtonContainer: {
    flex: 1,
    marginLeft: 10,
    overflow: 'hidden',
    borderRadius: 8,
  },
  progressContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff4444',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#2ecc71',
  },
  progressText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
    zIndex: 1,
  },
  disabledButton: {
    opacity: 0.6,
  },
  uploadingIndicator: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  documentTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  requiredStar: {
    color: '#ff0000',
    marginLeft: 2,
  },
  requiredNote: {
    fontSize: isTablet ? 14 : 12,
    color: '#666',
    fontWeight: 'normal',
  },
  fileInfoContainer: {
    marginTop: 10,
  },
  fileName: {
    fontSize: isTablet ? 15 : 13,
    color: '#333',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  noFileText: {
    color: '#999',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusContainer: {
    
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    minWidth: 40,
  },
  chooseButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    flex: 1,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#ff0000',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  buttonText: {
    fontSize: isTablet ? 15 : 13,
    fontWeight: '600',
    color: '#333',
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
    fontSize: isTablet ? 15 : 13,
  },
  uploadIcon: {
    marginRight: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  uploadedText: {
    color: '#4CAF50',
    marginTop: 8,
    fontSize: isTablet ? 15 : 13,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  uploadedInfo: {
    marginLeft: 12,
    flex: 1,
  },
  uploadedName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  uploadedMeta: {
    fontSize: isTablet ? 14 : 12,
    color: '#666',
  },
  jsonContainer: {
    marginTop: 20,
  },
  jsonTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  jsonBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  jsonText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: isTablet ? 14 : 12,
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  uploadedList: {
    marginTop: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  uploadedInfo: {
    marginLeft: 12,
    flex: 1,
  },
  uploadedName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  uploadedMeta: {
    fontSize: isTablet ? 14 : 12,
    color: '#666',
  },
  jsonContainer: {
    marginTop: 20,
  },
  jsonTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  jsonBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  jsonText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: isTablet ? 14 : 12,
    color: '#333',
  },
});

export default UploadDocuments;