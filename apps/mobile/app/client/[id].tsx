/**
 * Client Detail Screen
 */

import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { trpc } from '../../lib/trpc';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: client, isLoading } = trpc.clients.getById.useQuery({ id: id || '' });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Loading client...</Text>
      </View>
    );
  }

  if (!client) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Client not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tierColor: Record<string, string> = {
    enterprise: '#8b5cf6',
    premium: '#3b82f6',
    standard: '#10b981',
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(client.company_name || client.name || '?')[0].toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{client.company_name || client.name}</Text>
            {client.industry && <Text style={styles.industry}>{client.industry}</Text>}
          </View>
        </View>

        {client.tier && (
          <View style={[styles.tierBadge, { backgroundColor: tierColor[client.tier] || '#6b7280' }]}>
            <Text style={styles.badgeText}>{client.tier}</Text>
          </View>
        )}
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.infoCard}>
          {client.contact_email && (
            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => Linking.openURL(`mailto:${client.contact_email}`)}
            >
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={[styles.infoValue, styles.link]}>{client.contact_email}</Text>
            </TouchableOpacity>
          )}
          {client.contact_phone && (
            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => Linking.openURL(`tel:${client.contact_phone}`)}
            >
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={[styles.infoValue, styles.link]}>{client.contact_phone}</Text>
            </TouchableOpacity>
          )}
          {client.website && (
            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => Linking.openURL(client.website)}
            >
              <Text style={styles.infoLabel}>Website</Text>
              <Text style={[styles.infoValue, styles.link]}>{client.website}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Address */}
      {client.address && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <View style={styles.infoCard}>
            {client.address.street && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Street</Text>
                <Text style={styles.infoValue}>{client.address.street}</Text>
              </View>
            )}
            {client.address.city && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>City</Text>
                <Text style={styles.infoValue}>{client.address.city}</Text>
              </View>
            )}
            {client.address.country && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Country</Text>
                <Text style={styles.infoValue}>{client.address.country}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Tags */}
      {client.tags && client.tags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tags}>
            {client.tags.map((tag: string, i: number) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
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
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText: { fontSize: 22, fontWeight: 'bold', color: '#3b82f6' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
  industry: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  tierBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  infoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoLabel: { fontSize: 14, color: '#6b7280' },
  infoValue: { fontSize: 14, color: '#1f2937', fontWeight: '500' },
  link: { color: '#3b82f6' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  tagText: { color: '#3b82f6', fontSize: 13, fontWeight: '500' },
});
