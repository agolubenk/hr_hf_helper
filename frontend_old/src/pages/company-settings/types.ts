export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  category: string;
  lastSync?: string;
  type: 'api' | 'webhook' | 'oauth' | 'smtp' | 'database';
}

