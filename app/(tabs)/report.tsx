import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Camera, MapPin, Image as ImageIcon, Send, X } from 'lucide-react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/services/firebase';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

interface MockUser {
  id: string;
  displayName: string;
  email: string;
}

const MOCK_USER: MockUser = {
  id: 'mock-user-123',
  displayName: 'Test User',
  email: 'test@example.com',
};

type FormData = {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
};

export default function ReportScreen() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    severity: 'medium',
  });
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);

  useEffect(() => {
    getLocationAsync();
  }, []);

  const getLocationAsync = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Permission to access location was denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      const addresses = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (addresses.length > 0) {
        const addr = addresses[0];
        const addressStr = [addr.name, addr.street, addr.city, addr.region].filter(Boolean).join(', ');
        setAddress(addressStr);
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const takePicture = async () => {
    if (!cameraRef) return;
    try {
      const photo = await cameraRef.takePictureAsync();
      if (photo?.uri) {
        setImages(prev => [...prev, photo.uri]);
        setShowCamera(false);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
      });
      if (!result.canceled) {
        setImages(prev => [...prev, ...result.assets.map(asset => asset.uri)]);
      }
    } catch (error) {
      console.error('Pick image error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // const uploadImages = async (): Promise<string[]> => {
  //   const uploadPromises = images.map(async (uri) => {
  //     const response = await fetch(uri);
  //     const blob = await response.blob();
  //     const filename = `reports/${MOCK_USER.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
  //     const imageRef = ref(storage, filename);
  //     await uploadBytes(imageRef, blob);
  //     return getDownloadURL(imageRef);
  //   });
  //   console.log("index screen loaded");

  //   return Promise.all(uploadPromises);
  // };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Collect image metadata (e.g., file names)
      const imageMetadata = images.map((uri) => {
        // Extract file name from URI
        const parts = uri.split('/');
        return {
          name: parts[parts.length - 1],
          type: 'image/jpeg', // or detect from uri if needed
          // You can add more metadata if needed
        };
      });

      // Save report with image metadata only
      await addDoc(collection(db, 'reports'), {
        userId: 'mock-user-id',
        userName: 'Mock User',
        title: formData.title.trim(),
        description: formData.description.trim(),
        severity: formData.severity,
        location: location
          ? {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              address: address,
            }
          : null,
        images: imageMetadata, // Only metadata, not the actual image or URL
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userDisplayName: MOCK_USER.displayName,
        imageUrl: null,
      });

      Alert.alert(
        'Success',
        'Report submitted successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({
                title: '',
                description: '',
                severity: 'medium',
              });
              setImages([]);
              router.push('/(tabs)');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const openCamera = async () => {
    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        Alert.alert('Permission denied', 'Camera permission is required to take photos');
        return;
      }
    }
    setShowCamera(true);
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={facing} ref={setCameraRef}>
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.cameraButton} onPress={() => setShowCamera(false)}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setFacing((facing) => (facing === 'back' ? 'front' : 'back'))}
            >
              <Camera size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Report Water Leak</Text>
        <Text style={styles.subtitle}>Help save Johannesburg's water supply</Text>
      </View>
      console.log("index screen loaded");

      <View style={styles.form}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationCard}>
            <MapPin size={20} color="#0EA5E9" />
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>{address || 'Getting location...'}</Text>
              <TouchableOpacity onPress={getLocationAsync}>
                <Text style={styles.refreshLocation}>Refresh Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Details</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Brief description of the leak"
              value={formData.title}
              onChangeText={(value) => setFormData(prev => ({ ...prev, title: value }))}
              maxLength={100}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detailed info about the leak"
              value={formData.description}
              onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Severity Level</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.severity}
                onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
              >
                <Picker.Item label="Low" value="low" />
                <Picker.Item label="Medium" value="medium" />
                <Picker.Item label="High" value="high" />
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <Text style={styles.sectionSubtitle}>Take or upload photos of the water leak</Text>

          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoButton} onPress={openCamera}>
              <Camera size={24} color="#0EA5E9" />
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <ImageIcon size={24} color="#0EA5E9" />
              <Text style={styles.photoButtonText}>Upload Photos</Text>
            </TouchableOpacity>
          </View>

          {images.length > 0 && (
            <View style={styles.imageGrid}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity style={styles.removeImage} onPress={() => {
                    setImages(prev => prev.filter((_, i) => i !== index));
                  }}>
                    <X size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity onPress={handleSubmit} style={[styles.photoButton, { backgroundColor: '#0EA5E9', borderColor: '#0EA5E9' }]}>
          <Send size={20} color="#fff" />
          <Text style={[styles.photoButtonText, { color: '#fff' }]}>
            Submit Report
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8FAFC' },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#1E293B' },
  subtitle: { fontSize: 16, color: '#64748B' },
  form: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#334155', marginBottom: 8 },
  sectionSubtitle: { fontSize: 14, color: '#64748B', marginBottom: 16 },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
  },
  locationInfo: { marginLeft: 12 },
  locationText: { fontSize: 14, color: '#0EA5E9' },
  refreshLocation: { fontSize: 12, color: '#0EA5E9', textDecorationLine: 'underline' },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#334155', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12, fontSize: 14 },
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerContainer: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12 },
  photoButtons: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#0EA5E9',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  photoButtonText: { color: '#0EA5E9', marginLeft: 8, fontSize: 14, fontWeight: '500' },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  imageContainer: { position: 'relative' },
  image: { width: 100, height: 100, borderRadius: 8 },
  removeImage: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  cameraContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  camera: { flex: 1, width: '100%' },
  cameraControls: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  cameraButton: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 24, padding: 12 },
  captureButton: { backgroundColor: '#fff', borderRadius: 50, padding: 16 },
  captureButtonInner: { backgroundColor: '#FF0000', borderRadius: 50, width: 24, height: 24 },
});
