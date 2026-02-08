import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, createMockCampaign, createMockClient } from '../helpers';
import { createMockTRPCClient, mockCampaignListResponse } from '../mocks';

describe('Test Infrastructure', () => {
  describe('Test Utilities', () => {
    it('should create mock campaign data', () => {
      const campaign = createMockCampaign();
      
      expect(campaign).toHaveProperty('id');
      expect(campaign).toHaveProperty('name');
      expect(campaign).toHaveProperty('status');
      expect(campaign.status).toBe('draft');
    });

    it('should create mock campaign with overrides', () => {
      const campaign = createMockCampaign({ name: 'Custom Campaign', status: 'active' });
      
      expect(campaign.name).toBe('Custom Campaign');
      expect(campaign.status).toBe('active');
    });

    it('should create mock client data', () => {
      const client = createMockClient();
      
      expect(client).toHaveProperty('id');
      expect(client).toHaveProperty('name');
      expect(client).toHaveProperty('company');
      expect(client.tier).toBe('gold');
    });
  });

  describe('Mock tRPC Client', () => {
    it('should create mock tRPC client with all endpoints', () => {
      const mockClient = createMockTRPCClient();
      
      expect(mockClient.campaigns).toBeDefined();
      expect(mockClient.campaigns.list).toBeDefined();
      expect(mockClient.campaigns.getById).toBeDefined();
      expect(mockClient.campaigns.create).toBeDefined();
      
      expect(mockClient.clients).toBeDefined();
      expect(mockClient.briefs).toBeDefined();
      expect(mockClient.approvals).toBeDefined();
    });

    it('should allow mocking campaign list response', () => {
      const mockClient = createMockTRPCClient();
      mockClient.campaigns.list.mockResolvedValue(mockCampaignListResponse);
      
      expect(mockClient.campaigns.list).toHaveBeenCalledTimes(0);
      
      // Call the mock
      mockClient.campaigns.list({ page: 1, limit: 10 });
      
      expect(mockClient.campaigns.list).toHaveBeenCalledTimes(1);
      expect(mockClient.campaigns.list).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });

  describe('Render with Providers', () => {
    it('should render component with providers', () => {
      const TestComponent = () => <div>Test Content</div>;
      
      const { getByText } = renderWithProviders(<TestComponent />);
      
      expect(getByText('Test Content')).toBeInTheDocument();
    });
  });
});
