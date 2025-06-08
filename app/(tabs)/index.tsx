import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Droplets, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Clock, TrendingUp, MapPin, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
// import { useAuth } from '@/contexts/AuthContext'; // not used for now
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { LeakReport } from '@/types';

export default function HomeScreen() {
  // const { user } = useAuth(); // no user for now
  const [reports, setReports] = useState<LeakReport[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Fetch all reports from Firestore, ordered by creation date desc, limit 10
    const allReportsQuery = query(
      collection(db, 'reports'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(allReportsQuery, (snapshot) => {
      const fetchedReports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        resolvedAt: doc.data().resolvedAt?.toDate(),
      })) as LeakReport[];

      setReports(fetchedReports);

      // Calculate stats from all fetched reports
      const newStats = {
        total: fetchedReports.length,
        pending: fetchedReports.filter(r => r.status === 'pending').length,
        inProgress: fetchedReports.filter(r => r.status === 'in-progress' || r.status === 'assigned').length,
        resolved: fetchedReports.filter(r => r.status === 'resolved' || r.status === 'closed').length,
      };
      setStats(newStats);
    });

    return unsubscribe;
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // Real-time listener auto-updates, so just reset refreshing after 1s
    setTimeout(() => setRefreshing(false), 1000);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} color="#F59E0B" />;
      case 'assigned':
      case 'in-progress':
        return <AlertTriangle size={16} color="#3B82F6" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle size={16} color="#10B981" />;
      default:
        return <Clock size={16} color="#64748B" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={['#0EA5E9', '#0284C7']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Droplets size={32} color="#FFFFFF" />
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>Thokozani</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.quickReportButton}
            onPress={() => router.push('/report')}
          >
            <Plus size={20} color="#0EA5E9" />
            <Text style={styles.quickReportText}>Quick Report</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <TrendingUp size={24} color="#0EA5E9" />
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Reports</Text>
            </View>
            
            <View style={[styles.statCard, styles.statCardWarning]}>
              <Clock size={24} color="#F59E0B" />
              <Text style={styles.statNumber}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardInfo]}>
              <AlertTriangle size={24} color="#3B82F6" />
              <Text style={styles.statNumber}>{stats.inProgress}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            
            <View style={[styles.statCard, styles.statCardSuccess]}>
              <CheckCircle size={24} color="#10B981" />
              <Text style={styles.statNumber}>{stats.resolved}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/report')}
            >
              <View style={styles.actionIcon}>
                <Plus size={24} color="#0EA5E9" />
              </View>
              <Text style={styles.actionTitle}>Report Leak</Text>
              <Text style={styles.actionSubtitle}>Capture and report a new water leak</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/map')}
            >
              <View style={styles.actionIcon}>
                <MapPin size={24} color="#10B981" />
              </View>
              <Text style={styles.actionTitle}>View Map</Text>
              <Text style={styles.actionSubtitle}>See all reported leaks in your area</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Reports */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          {reports.length === 0 ? (
            <View style={styles.emptyState}>
              <Droplets size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateTitle}>No reports yet</Text>
              <Text style={styles.emptyStateText}>
                Start by reporting your first water leak to help save Johannesburg's water supply
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => router.push('/report')}
              >
                <Text style={styles.emptyStateButtonText}>Report Your First Leak</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.reportsContainer}>
              {reports.map((report) => (
                <View key={report.id} style={styles.reportCard}>
                  <View style={styles.reportHeader}>
                    <Text style={styles.reportTitle} numberOfLines={1}>
                      {report.title}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '20' }]}>
                      {getStatusIcon(report.status)}
                      <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('-', ' ')}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.reportDescription} numberOfLines={2}>
                    {report.description}
                  </Text>
                  
                  <View style={styles.reportFooter}>
                    <Text style={styles.reportDate}>
                      {formatDate(report.createdAt)}
                    </Text>
                    <View style={styles.severityBadge}>
                      <Text style={styles.severityText}>
                        {report.severity.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#E0F2FE',
    marginTop: 8,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  quickReportButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickReportText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0EA5E9',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  statsContainer: {
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  statCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  statCardInfo: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  statCardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  statNumber: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#94A3B8',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 24,
  },
  emptyStateButton: {
    marginTop: 24,
    backgroundColor: '#0EA5E9',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 24,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  reportsContainer: {
    marginTop: 8,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  reportDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#475569',
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportDate: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
  },
  severityBadge: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  severityText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});
