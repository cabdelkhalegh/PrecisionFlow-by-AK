/**
 * Campaigns List Screen
 */

import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { trpc } from '../../lib/trpc';
import { getRiskBadgeVariant, getStatusBadgeVariant } from '@precisionflow/ui';

export default function CampaignsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { data: campaigns, isLoading, refetch } = trpc.campaigns.list.useQuery({ limit: 50, offset: 0 });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getBadgeColor = (variant: string) => {
    switch (variant) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'danger': return '#ef4444';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Campaigns</Text>
        <Text style={styles.subtitle}>{campaigns?.length || 0} total</Text>
      </View>

      {isLoading ? (
        <Text style={styles.loading}>Loading campaigns...</Text>
      ) : campaigns && campaigns.length > 0 ? (
        campaigns.map((campaign: any) => (
          <TouchableOpacity
            key={campaign.id}
            style={styles.card}
            onPress={() => router.push(`/campaign/${campaign.id}` as any)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{campaign.name}</Text>
              <View style={styles.badges}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: getBadgeColor(getStatusBadgeVariant(campaign.status)) },
                  ]}
                >
                  <Text style={styles.badgeText}>{campaign.status}</Text>
                </View>
              </View>
            </View>
            
            {campaign.client_name && (
              <Text style={styles.cardSubtitle}>Client: {campaign.client_name}</Text>
            )}
            
            {campaign.risk_level && (
              <View
                style={[
                  styles.riskBadge,
                  { backgroundColor: getBadgeColor(getRiskBadgeVariant(campaign.risk_level)) },
                ]}
              >
                <Text style={styles.badgeText}>Risk: {campaign.risk_level}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No campaigns found</Text>
          <Text style={styles.emptySubtext}>Create your first campaign to get started</Text>
        </View>
      )}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  loading: {
    textAlign: 'center',
    color: '#6b7280',
    padding: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
});
