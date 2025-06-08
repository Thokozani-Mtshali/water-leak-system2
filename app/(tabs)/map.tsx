import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { Filter, X, MapPin, Calendar, User, TriangleAlert as AlertTriangle, Droplets } from 'lucide-react-native';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { LeakReport } from '@/types';
import * as Location from 'expo-location';

export default function MapScreen() {
  const [reports, setReports] = useState<LeakReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<LeakReport | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
  });
  const [region, setRegion] = useState<Region>({
    latitude: -26.2041,
    longitude: 28.0473,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  useEffect(() => {
    // Get user's current location
    getCurrentLocation();

    // Listen to all reports
    const reportsQuery = query(
      collection(db, 'reports'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(reportsQuery, (snapshot) => {
      const allReports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        resolvedAt: doc.data().resolvedAt?.toDate(),
      })) as LeakReport[];

      setReports(allReports);
    });

    return unsubscribe;
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const getFilteredReports = () => {
    return reports.filter(report => {
      if (filters.status !== 'all' && report.status !== filters.status) {
        return false;
      }
      if (filters.severity !== 'all' && report.severity !== filters.severity) {
        return false;
      }
      return true;
    });
  };

  const getMarkerColor = (severity: string, status: string) => {
    if (status === 'resolved' || status === 'closed') {
      return '#10B981'; // Green
    }
    
    switch (severity) {
      case 'critical':
        return '#EF4444'; // Red
      case 'high':
        return '#F59E0B'; // Orange
      case 'medium':
        return '#3B82F6'; // Blue
      case 'low':
        return '#8B5CF6'; // Purple
      default:
        return '#64748B'; // Gray
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'assigned':
      case 'in-progress':
        return '#3B82F6';
      case 'resolved':
      case 'closed':
        return '#10B981';
      default:
        return '#64748B';
    }
  };

  const filteredReports = getFilteredReports();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Leak Map</Text>
          <Text style={styles.subtitle}>{filteredReports.length} reports found</Text>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={20} color="#0EA5E9" />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {filteredReports.map((report) => {
          if (
            !report.location ||
            typeof report.location.latitude !== 'number' ||
            typeof report.location.longitude !== 'number'
          ) {
            return null;
          }
          return (
            <Marker
              key={report.id}
              coordinate={{
                latitude: report.location.latitude,
                longitude: report.location.longitude,
              }}
              pinColor={getMarkerColor(report.severity, report.status)}
              onPress={() => {
                setSelectedReport(report);
                setShowModal(true);
              }}
            >
              <Callout>
                <View style={styles.callout}>
                  <Droplets size={32} color="#0EA5E9" style={{ marginBottom: 8 }} />
                  <Text style={styles.calloutTitle}>{report.title}</Text>
                  <Text style={styles.calloutStatus}>{report.status.toUpperCase()}</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Severity Levels</Text>
        <View style={styles.legendItems}>
          {[
            { label: 'Critical', color: '#EF4444' },
            { label: 'High', color: '#F59E0B' },
            { label: 'Medium', color: '#3B82F6' },
            { label: 'Low', color: '#8B5CF6' },
            { label: 'Resolved', color: '#10B981' },
          ].map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filter Reports</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.filterOptions}>
                {[
                  { value: 'all', label: 'All' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'in-progress', label: 'In Progress' },
                  { value: 'resolved', label: 'Resolved' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      filters.status === option.value && styles.filterOptionActive,
                    ]}
                    onPress={() => setFilters(prev => ({ ...prev, status: option.value }))}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filters.status === option.value && styles.filterOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Severity</Text>
              <View style={styles.filterOptions}>
                {[
                  { value: 'all', label: 'All' },
                  { value: 'critical', label: 'Critical' },
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      filters.severity === option.value && styles.filterOptionActive,
                    ]}
                    onPress={() => setFilters(prev => ({ ...prev, severity: option.value }))}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filters.severity === option.value && styles.filterOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Report Detail Modal */}
      <Modal
        visible={showModal && selectedReport !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reportModal}>
            <ScrollView>
              <View style={styles.reportHeader}>
                <View style={styles.reportTitleSection}>
                  <Text style={styles.reportTitle}>{selectedReport?.title}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(selectedReport?.status || '') + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(selectedReport?.status || '') },
                      ]}
                    >
                      {selectedReport?.status.toUpperCase().replace('-', ' ')}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <X size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.reportContent}>
                <View style={styles.reportInfoRow}>
                  <View style={styles.reportInfoItem}>
                    <User size={16} color="#64748B" />
                    <Text style={styles.reportInfoText}>
                      Reported by {selectedReport?.userName}
                    </Text>
                  </View>
                  <View style={styles.reportInfoItem}>
                    <Calendar size={16} color="#64748B" />
                    <Text style={styles.reportInfoText}>
                      {selectedReport?.createdAt && formatDate(selectedReport.createdAt)}
                    </Text>
                  </View>
                </View>

                <View style={styles.reportInfoRow}>
                  <View style={styles.reportInfoItem}>
                    <MapPin size={16} color="#64748B" />
                    <Text style={styles.reportInfoText}>
                      {selectedReport?.location.address || 'Location not available'}
                    </Text>
                  </View>
                  <View style={styles.reportInfoItem}>
                    <AlertTriangle size={16} color="#64748B" />
                    <Text style={styles.reportInfoText}>
                      {selectedReport?.severity.toUpperCase()} severity
                    </Text>
                  </View>
                </View>

                <View style={styles.descriptionSection}>
                  <Text style={styles.descriptionTitle}>Description</Text>
                  <Text style={styles.descriptionText}>
                    {selectedReport?.description}
                  </Text>
                </View>

                {selectedReport?.images && selectedReport.images.length > 0 && (
                  <View style={styles.imagesSection}>
                    <Text style={styles.imagesTitle}>Photos</Text>
                    {/* Instead of rendering <Image />, just show an icon or file name */}
                    {selectedReport.images.map((img, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Droplets size={20} color="#0EA5E9" />
                        <Text style={{ marginLeft: 8 }}>{img.name}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {selectedReport?.resolution && (
                  <View style={styles.resolutionSection}>
                    <Text style={styles.resolutionTitle}>Resolution</Text>
                    <Text style={styles.resolutionText}>
                      {selectedReport.resolution}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 4,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  callout: {
    padding: 8,
    maxWidth: 200,
  },
  calloutTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  calloutStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legendTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  legendItems: {
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '70%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterOptionActive: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  filterOptionTextActive: {
    color: '#FFFFFF',
  },
  applyButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  reportModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingBottom: 16,
  },
  reportTitleSection: {
    flex: 1,
    marginRight: 16,
  },
  reportTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  reportContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  reportInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reportInfoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportInfoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginLeft: 8,
    flex: 1,
  },
  descriptionSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
  },
  imagesSection: {
    marginBottom: 16,
  },
  imagesTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  reportImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  resolutionSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
  },
  resolutionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#166534',
    marginBottom: 8,
  },
  resolutionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#166534',
    lineHeight: 20,
  },
});