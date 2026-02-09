/**
 * Approvals Screen
 */

import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useState } from 'react';
import { trpc } from '../../lib/trpc';
import { getApprovalBadgeVariant } from '@tikit/ui';

export default function ApprovalsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { data: approvals, isLoading, refetch } = trpc.approvals.getPendingForUser.useQuery();

  const approveMutation = trpc.approvals.approve.useMutation({
    onSuccess: () => {
      refetch();
      Alert.alert('Success', 'Approval granted');
    },
    onError: (err) => Alert.alert('Error', err.message),
  });

  const rejectMutation = trpc.approvals.reject.useMutation({
    onSuccess: () => {
      refetch();
      Alert.alert('Success', 'Approval rejected');
    },
    onError: (err) => Alert.alert('Error', err.message),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleApprove = (id: string) => {
    Alert.alert('Confirm', 'Approve this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => approveMutation.mutate({ id, notes: 'Approved via mobile' }) },
    ]);
  };

  const handleReject = (id: string) => {
    Alert.alert('Confirm', 'Reject this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => rejectMutation.mutate({ id, notes: 'Rejected via mobile' }) },
    ]);
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
        <Text style={styles.title}>My Approvals</Text>
        <Text style={styles.subtitle}>{approvals?.length || 0} pending</Text>
      </View>

      {isLoading ? (
        <Text style={styles.loading}>Loading approvals...</Text>
      ) : approvals && approvals.length > 0 ? (
        approvals.map((approval: any) => (
          <View key={approval.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{approval.type}</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: getBadgeColor(getApprovalBadgeVariant(approval.status)) },
                ]}
              >
                <Text style={styles.badgeText}>{approval.status}</Text>
              </View>
            </View>
            
            {approval.campaign_name && (
              <Text style={styles.cardSubtitle}>Campaign: {approval.campaign_name}</Text>
            )}
            
            {approval.requested_by_email && (
              <Text style={styles.cardSubtitle}>Requested by: {approval.requested_by_email}</Text>
            )}

            {approval.notes && (
              <Text style={styles.notes}>{approval.notes}</Text>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={() => handleApprove(approval.id)}
              >
                <Text style={styles.buttonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => handleReject(approval.id)}
              >
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No pending approvals</Text>
          <Text style={styles.emptySubtext}>You're all caught up!</Text>
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
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
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
