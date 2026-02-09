'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { trpc } from '@/lib/trpc';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-500',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'invoices'>('overview');

  const budgetSummary = trpc.budgets.summary.useQuery();
  const financialSummary = trpc.invoices.financialSummary.useQuery();
  const campaigns = trpc.campaigns.list.useQuery({ limit: 100, offset: 0 });

  const isLoading = budgetSummary.isLoading || financialSummary.isLoading;

  const budgetData = budgetSummary.data;
  const finData = financialSummary.data;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">💰 Finance</h1>
            <p className="mt-1 text-gray-600">Budget tracking, expenses, and invoices</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-500">Total Budgeted</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : formatCurrency(budgetData?.totalBudgeted || 0)}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {budgetData?.count || 0} campaign budgets
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-500">Total Invoiced</p>
              <p className="text-2xl font-bold text-blue-600">
                {isLoading ? '...' : formatCurrency(finData?.totalInvoiced || 0)}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {finData?.invoiceCount || 0} invoices
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-500">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {isLoading ? '...' : formatCurrency(finData?.totalPaid || 0)}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {finData?.byStatus?.paid || 0} paid invoices
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-500">Outstanding</p>
              <p className="text-2xl font-bold text-red-600">
                {isLoading ? '...' : formatCurrency((finData?.totalOverdue || 0) + (finData?.totalPending || 0))}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {(finData?.byStatus?.overdue || 0) + (finData?.byStatus?.sent || 0)} pending/overdue
              </p>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {(['overview', 'expenses', 'invoices'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-1 py-3 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab budgetData={budgetData} finData={finData} isLoading={isLoading} />
        )}
        {activeTab === 'expenses' && (
          <ExpensesTab campaigns={campaigns.data?.campaigns || []} />
        )}
        {activeTab === 'invoices' && (
          <InvoicesTab campaigns={campaigns.data?.campaigns || []} />
        )}
      </div>
    </AppLayout>
  );
}

interface BudgetItem {
  id: string;
  campaign_id: string;
  original_amount: number;
  current_amount: number;
  currency: string;
  breakdown: Record<string, number> | null;
  status: string;
}

interface BudgetSummary {
  budgets: BudgetItem[];
  totalBudgeted: number;
  totalCurrent: number;
  totalVariance: number;
  count: number;
}

interface FinancialSummary {
  totalInvoiced: number;
  totalPaid: number;
  totalOverdue: number;
  totalPending: number;
  invoiceCount: number;
  byStatus: Record<string, number>;
}

function OverviewTab({
  budgetData,
  finData,
  isLoading,
}: {
  budgetData: BudgetSummary | undefined;
  finData: FinancialSummary | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <p className="text-gray-500">Loading financial overview...</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Budget Allocation */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900">Budget Allocation</h3>
          <div className="mt-4 space-y-3">
            {budgetData?.budgets?.length > 0 ? (
              budgetData.budgets.map((b: BudgetItem) => {
                const usagePercent = b.original_amount > 0
                  ? Math.round(((b.original_amount - b.current_amount) / b.original_amount) * 100)
                  : 0;
                return (
                  <div key={b.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Campaign Budget</span>
                      <span className="text-gray-500">
                        {formatCurrency(b.current_amount)} / {formatCurrency(b.original_amount)}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">{usagePercent}% spent</p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500">No budgets allocated yet.</p>
            )}
          </div>
        </div>
      </Card>

      {/* Invoice Status Distribution */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900">Invoice Status</h3>
          <div className="mt-4 space-y-3">
            {finData?.byStatus &&
              Object.entries(finData.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {status}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{count as number}</span>
                </div>
              ))}
          </div>
        </div>
      </Card>

      {/* Variance Analysis */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900">Budget vs Actual</h3>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Budgeted</span>
              <span className="font-medium">{formatCurrency(budgetData?.totalBudgeted || 0)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-gray-600">Total Invoiced</span>
              <span className="font-medium">{formatCurrency(finData?.totalInvoiced || 0)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-gray-600">Total Paid Out</span>
              <span className="font-medium text-green-600">{formatCurrency(finData?.totalPaid || 0)}</span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-900">Remaining Budget</span>
              <span className="font-bold text-blue-600">
                {formatCurrency((budgetData?.totalBudgeted || 0) - (finData?.totalPaid || 0))}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-500">
              Select a campaign from the Expenses or Invoices tab to manage its finances.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface Campaign {
  id: string;
  name: string;
  client_id: string;
  status: string;
}

function ExpensesTab({ campaigns }: { campaigns: Campaign[] }) {
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');

  const expenses = trpc.expenses.getByCampaign.useQuery(
    { campaignId: selectedCampaign },
    { enabled: !!selectedCampaign }
  );

  const expenseSummary = trpc.expenses.summary.useQuery(
    { campaignId: selectedCampaign },
    { enabled: !!selectedCampaign }
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Campaign:</label>
        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Select a campaign</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {!selectedCampaign && (
        <p className="text-gray-500">Select a campaign to view its expenses.</p>
      )}

      {selectedCampaign && expenseSummary.data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card>
            <div className="p-3">
              <p className="text-xs text-gray-500">Total Expenses</p>
              <p className="text-lg font-bold">{formatCurrency(expenseSummary.data.totalAmount)}</p>
            </div>
          </Card>
          <Card>
            <div className="p-3">
              <p className="text-xs text-gray-500">Approved</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(expenseSummary.data.approvedAmount)}</p>
            </div>
          </Card>
          <Card>
            <div className="p-3">
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-lg font-bold text-yellow-600">{formatCurrency(expenseSummary.data.pendingAmount)}</p>
            </div>
          </Card>
          <Card>
            <div className="p-3">
              <p className="text-xs text-gray-500">Paid Out</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(expenseSummary.data.paidAmount)}</p>
            </div>
          </Card>
        </div>
      )}

      {selectedCampaign && expenses.data && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Approval</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenses.data.expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No expenses recorded yet.
                    </td>
                  </tr>
                ) : (
                  expenses.data.expenses.map((exp: any) => (
                    <tr key={exp.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium capitalize text-gray-900">
                        {exp.category?.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{exp.description || '—'}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(exp.amount, exp.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[exp.approval_status] || ''}`}>
                          {exp.approval_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[exp.payment_status] || ''}`}>
                          {exp.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(exp.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function InvoicesTab({ campaigns }: { campaigns: Campaign[] }) {
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');

  const invoices = trpc.invoices.getByCampaign.useQuery(
    { campaignId: selectedCampaign },
    { enabled: !!selectedCampaign }
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Campaign:</label>
        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Select a campaign</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {!selectedCampaign && (
        <p className="text-gray-500">Select a campaign to view its invoices.</p>
      )}

      {selectedCampaign && invoices.data && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Paid Date</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.data.invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No invoices created yet.
                    </td>
                  </tr>
                ) : (
                  invoices.data.invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-blue-600">{inv.invoice_number}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(inv.amount, inv.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[inv.status] || ''}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {inv.paid_date ? new Date(inv.paid_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
