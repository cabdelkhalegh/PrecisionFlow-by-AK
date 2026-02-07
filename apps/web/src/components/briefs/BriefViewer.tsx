'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface BriefViewerProps {
  brief: any; // TODO: Type this properly
  onProcessWithAI?: () => void;
  isProcessing?: boolean;
}

export function BriefViewer({ brief, onProcessWithAI, isProcessing }: BriefViewerProps) {
  const structuredData = brief.structured_data;
  const hasStructuredData = structuredData && Object.keys(structuredData).length > 0;

  return (
    <div className="space-y-6">
      {/* Brief Info */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Brief Version {brief.version}
            </h3>
            <p className="text-sm text-gray-500">
              Uploaded on {new Date(brief.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {brief.is_latest && <Badge variant="info">Latest</Badge>}
            {brief.is_approved && <Badge variant="success">Approved</Badge>}
          </div>
        </div>

        {/* Raw Content */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Raw Brief</h4>
          <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm text-gray-700">
            {brief.raw_content || 'No content available'}
          </div>
        </div>

        {/* AI Processing Button */}
        {!hasStructuredData && onProcessWithAI && (
          <div className="mt-4">
            <Button
              onClick={onProcessWithAI}
              variant="primary"
              loading={isProcessing}
            >
              🤖 Process with AI
            </Button>
          </div>
        )}
      </Card>

      {/* Structured Data */}
      {hasStructuredData && (
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            📊 AI-Extracted Information
          </h3>

          <div className="space-y-4">
            {/* Objectives */}
            {structuredData.objectives && structuredData.objectives.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Objectives</h4>
                <ul className="list-disc list-inside space-y-1">
                  {structuredData.objectives.map((obj: string, i: number) => (
                    <li key={i} className="text-gray-700">
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Target Audience */}
            {structuredData.target_audience && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Target Audience</h4>
                <p className="text-gray-700">{structuredData.target_audience}</p>
              </div>
            )}

            {/* Deliverables */}
            {structuredData.deliverables && structuredData.deliverables.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Deliverables</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Type
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Quantity
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Description
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Deadline
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {structuredData.deliverables.map((d: any, i: number) => (
                        <tr key={i}>
                          <td className="px-3 py-2 text-sm text-gray-900">{d.type}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{d.quantity}</td>
                          <td className="px-3 py-2 text-sm text-gray-700">{d.description}</td>
                          <td className="px-3 py-2 text-sm text-gray-700">
                            {d.deadline || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Timeline & Budget */}
            <div className="grid grid-cols-2 gap-4">
              {structuredData.timeline && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                  <p className="text-gray-700">{structuredData.timeline}</p>
                </div>
              )}
              {structuredData.budget && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Budget</h4>
                  <p className="text-gray-700">{structuredData.budget}</p>
                </div>
              )}
            </div>

            {/* KPIs */}
            {structuredData.kpis && structuredData.kpis.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">KPIs</h4>
                <ul className="list-disc list-inside space-y-1">
                  {structuredData.kpis.map((kpi: string, i: number) => (
                    <li key={i} className="text-gray-700">
                      {kpi}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing Information */}
            {structuredData.missing_info && structuredData.missing_info.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
                  ⚠️ Missing Information
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {structuredData.missing_info.map((info: string, i: number) => (
                    <li key={i} className="text-yellow-800">
                      {info}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
