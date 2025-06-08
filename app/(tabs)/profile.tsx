import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Settings, LogOut } from 'lucide-react-native';

// Mock user data with stats
const MOCK_USER = {
  id: 'mock-user-123',
  displayName: 'Thokozani Mtshali',
  email: 'Thokozani@gmail.com',
  phoneNumber: '+27 123 456 789',
  role: 'Resident',
  avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff',
  stats: {
    totalReports: 15,
    pendingReports: 3,
    resolvedReports: 12,
    avgResolutionTime: 48, // hours
  },
  createdAt: '2024-01-01',
};

export default function ProfileScreen() {
  const [user] = useState(MOCK_USER);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    avgResolutionTime: 0,
  });
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMockStats = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      setStats(user.stats);
      setLoading(false);
    };
    loadMockStats();
  }, [user.stats]);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: () => router.replace('/auth/login'),
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#0EA5E9', '#0284C7', '#0369A1']}
        style={styles.header}
        >
        console.log("index screen loaded");
        <View style={styles.profileInfo}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{user.displayName}</Text>
          <Text style={styles.role}>{user.role}</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalReports}</Text>
            <Text style={styles.statLabel}>Reports</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.pendingReports}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.resolvedReports}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.avgResolutionTime}h</Text>
            <Text style={styles.statLabel}>Avg. Resolution</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.card}>
            <View style={styles.cardItem}>
              <Text style={styles.cardLabel}>Email</Text>
              <Text style={styles.cardValue}>{user.email}</Text>
            </View>
            <View style={styles.cardDivider} />
            <View style={styles.cardItem}>
              <Text style={styles.cardLabel}>Phone Number</Text>
              <Text style={styles.cardValue}>{user.phoneNumber}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
            />
          </View>
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Location Sharing</Text>
            <Switch
              value={locationSharing}
              onValueChange={setLocationSharing}
            />
          </View>
        </View>

        {/* <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings')}>
          <Settings size={24} color="#64748B" />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity> */}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={24} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748B',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#E0F2FE',
  },
  content: {
    padding: 20,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: -30,
    marginHorizontal: 20,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0EA5E9',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  cardItem: {
    paddingVertical: 12,
  },
  cardLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    color: '#334155',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#334155',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#334155',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 12,
    fontWeight: '600',
  },
});
