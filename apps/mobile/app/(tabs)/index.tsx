/**
 * Home/Dashboard Screen
 */

import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { trpc } from '../../lib/trpc';

export default function HomeScreen() {
  const router = useRouter();
  const { data: campaigns, isLoading } = trpc.campaigns.list.useQuery({ limit: 5, offset: 0 });
  const { data: clients } = trpc.clients.list.useQuery({ limit: 5, offset: 0 });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome to TiKiT OS</Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{campaigns?.length || 0}</Text>
          <Text style={styles.statLabel}>Campaigns</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{clients?.length || 0}</Text>
          <Text style={styles.statLabel}>Clients</Text>
        </View>
      </View>

      {/* Recent Campaigns */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Campaigns</Text>
        {isLoading ? (
          <Text style={styles.loading}>Loading...</Text>
        ) : campaigns && campaigns.length > 0 ? (
          campaigns.map((campaign: any) => (
            <TouchableOpacity
              key={campaign.id}
              style={styles.card}
              onPress={() => router.push(`/(tabs)/campaigns/${campaign.id}` as any)}
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
  stats: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
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
