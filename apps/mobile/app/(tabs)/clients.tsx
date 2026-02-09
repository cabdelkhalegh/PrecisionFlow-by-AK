/**
 * Clients List Screen
 */

import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { trpc } from '../../lib/trpc';

export default function ClientsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { data: clientsData, isLoading, refetch } = trpc.clients.list.useQuery({ limit: 50, offset: 0 });

  const clients = clientsData?.clients || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const tierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return '#8b5cf6';
      case 'premium': return '#3b82f6';
      case 'standard': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Clients</Text>
        <Text style={styles.subtitle}>{clients.length} total</Text>
      </View>

      {isLoading ? (
        <Text style={styles.loading}>Loading clients...</Text>
      ) : clients.length > 0 ? (
        clients.map((client: any) => (
          <TouchableOpacity
            key={client.id}
            style={styles.card}
            onPress={() => router.push(`/client/${client.id}` as any)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(client.company_name || client.name || '?')[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{client.company_name || client.name}</Text>
                {client.industry && (
                  <Text style={styles.cardSubtitle}>{client.industry}</Text>
                )}
              </View>
            </View>
            {client.tier && (
              <View style={[styles.tierBadge, { backgroundColor: tierColor(client.tier) }]}>
                <Text style={styles.badgeText}>{client.tier}</Text>
              </View>
            )}
            {client.contact_email && (
              <Text style={styles.email}>{client.contact_email}</Text>
            )}
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No clients yet</Text>
          <Text style={styles.emptySubtext}>Add your first client to get started</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  loading: { textAlign: 'center', color: '#6b7280', padding: 40 },
  card: { backgroundColor: '#fff', margin: 12, padding: 16, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#3b82f6' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  cardSubtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  tierBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginTop: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  email: { fontSize: 13, color: '#6b7280', marginTop: 6 },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  emptySubtext: { fontSize: 14, color: '#9ca3af', marginTop: 8 },
});
