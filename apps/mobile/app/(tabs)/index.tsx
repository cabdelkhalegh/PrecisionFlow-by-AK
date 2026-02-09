/**
 * Home/Dashboard Screen
 */

import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { trpc } from '../../lib/trpc';

export default function HomeScreen() {
  const router = useRouter();
  const { data: campaignsData, isLoading } = trpc.campaigns.list.useQuery({ limit: 5, offset: 0 });
  const { data: clientsData } = trpc.clients.list.useQuery({ limit: 5, offset: 0 });
  const { data: creatorsData } = trpc.creators.list.useQuery({ limit: 5, offset: 0 });
  const { data: pendingCount } = trpc.approvals.countPending.useQuery();

  const campaigns = campaignsData?.campaigns || [];
  const clients = clientsData?.clients || [];
  const creators = creatorsData?.creators || [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome to PrecisionFlow</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/campaigns')}>
          <Text style={styles.statValue}>{campaigns.length || 0}</Text>
          <Text style={styles.statLabel}>Campaigns</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/clients')}>
          <Text style={styles.statValue}>{clients.length || 0}</Text>
          <Text style={styles.statLabel}>Clients</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/creators')}>
          <Text style={[styles.statValue, { color: '#8b5cf6' }]}>{creators.length || 0}</Text>
          <Text style={styles.statLabel}>Creators</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/approvals')}>
          <Text style={[styles.statValue, { color: pendingCount ? '#f59e0b' : '#10b981' }]}>
            {pendingCount || 0}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Campaigns */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Campaigns</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/campaigns')}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>
        {isLoading ? (
          <Text style={styles.loading}>Loading...</Text>
        ) : campaigns.length > 0 ? (
          campaigns.map((campaign: any) => (
            <TouchableOpacity
              key={campaign.id}
              style={styles.card}
              onPress={() => router.push(`/campaign/${campaign.id}` as any)}
            >
              <Text style={styles.cardTitle}>{campaign.name}</Text>
              <Text style={styles.cardSubtitle}>{campaign.status}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.empty}>No campaigns yet</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  seeAll: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  loading: {
    textAlign: 'center',
    color: '#6b7280',
    padding: 20,
  },
  empty: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: 20,
  },
});
