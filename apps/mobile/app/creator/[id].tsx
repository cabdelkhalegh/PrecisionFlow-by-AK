/**
 * Creator Detail Screen
 */

import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { trpc } from '../../lib/trpc';

export default function CreatorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: creator, isLoading } = trpc.creators.getById.useQuery({ id: id || '' });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Loading creator...</Text>
      </View>
    );
  }

  if (!creator) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Creator not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatFollowers = (count: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(creator.name || '?')[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{creator.name}</Text>
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
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{formatFollowers(creator.follower_count || 0)}</Text>
          <Text style={styles.metricLabel}>Followers</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>
            {creator.engagement_rate ? `${Number(creator.engagement_rate).toFixed(1)}%` : 'N/A'}
          </Text>
          <Text style={styles.metricLabel}>Engagement</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{creator.niche || 'N/A'}</Text>
          <Text style={styles.metricLabel}>Niche</Text>
        </View>
      </View>

      {/* Social Handles */}
      {creator.social_handles && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Profiles</Text>
          <View style={styles.infoCard}>
            {Object.entries(creator.social_handles as Record<string, string>).map(([platform, handle]) => (
              <View key={platform} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{platformIcon(platform)} {platform}</Text>
                <Text style={styles.infoValue}>@{handle}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.infoCard}>
          {creator.email && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{creator.email}</Text>
            </View>
          )}
          {creator.location && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{creator.location}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Rate Card */}
      {creator.rate_card && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rate Card</Text>
          <View style={styles.infoCard}>
            {Object.entries(creator.rate_card as Record<string, number>).map(([type, rate]) => (
              <View key={type} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{type}</Text>
                <Text style={[styles.infoValue, { color: '#10b981' }]}>
                  ${Number(rate).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Notes */}
      {creator.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.notesCard}>
            <Text style={styles.notesText}>{creator.notes}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loading: { fontSize: 16, color: '#6b7280' },
  errorText: { fontSize: 18, color: '#ef4444', marginBottom: 16 },
  backBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: '600' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backLink: { marginBottom: 12 },
  backLinkText: { color: '#3b82f6', fontSize: 16 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#faf5ff', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: '#8b5cf6' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
  platform: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  metricsRow: { flexDirection: 'row', padding: 16, gap: 12 },
  metric: { flex: 1, backgroundColor: '#fff', padding: 14, borderRadius: 12, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  metricValue: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  metricLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  infoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoLabel: { fontSize: 14, color: '#6b7280', textTransform: 'capitalize' },
  infoValue: { fontSize: 14, color: '#1f2937', fontWeight: '500' },
  notesCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  notesText: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
});
