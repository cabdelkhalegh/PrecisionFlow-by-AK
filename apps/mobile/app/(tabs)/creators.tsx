/**
 * Creators List Screen
 */

import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { trpc } from '../../lib/trpc';

export default function CreatorsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { data: creatorsData, isLoading, refetch } = trpc.creators.list.useQuery({ limit: 50, offset: 0 });

  const creators = creatorsData?.creators || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const platformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return '📸';
      case 'tiktok': return '🎵';
      case 'youtube': return '▶️';
      case 'twitter': return '🐦';
      default: return '🌐';
    }
  };

  const formatFollowers = (count: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Creators</Text>
        <Text style={styles.subtitle}>{creators.length} total</Text>
      </View>

      {isLoading ? (
        <Text style={styles.loading}>Loading creators...</Text>
      ) : creators.length > 0 ? (
        creators.map((creator: any) => (
          <TouchableOpacity
            key={creator.id}
            style={styles.card}
            onPress={() => router.push(`/creator/${creator.id}` as any)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(creator.name || '?')[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{creator.name}</Text>
                {creator.primary_platform && (
                  <Text style={styles.platform}>
                    {platformIcon(creator.primary_platform)} {creator.primary_platform}
                  </Text>
                )}
              </View>
              {creator.status && (
                <View style={[styles.statusBadge, { backgroundColor: creator.status === 'active' ? '#10b981' : '#6b7280' }]}>
                  <Text style={styles.badgeText}>{creator.status}</Text>
                </View>
              )}
            </View>

            <View style={styles.statsRow}>
              {creator.follower_count && (
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{formatFollowers(creator.follower_count)}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
              )}
              {creator.engagement_rate && (
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{Number(creator.engagement_rate).toFixed(1)}%</Text>
                  <Text style={styles.statLabel}>Engagement</Text>
                </View>
              )}
              {creator.niche && (
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{creator.niche}</Text>
                  <Text style={styles.statLabel}>Niche</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No creators yet</Text>
          <Text style={styles.emptySubtext}>Add influencers to your roster</Text>
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#faf5ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#8b5cf6' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  platform: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  emptySubtext: { fontSize: 14, color: '#9ca3af', marginTop: 8 },
});
