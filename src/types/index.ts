export type ContactStatus = 'lead' | 'prospect' | 'client' | 'churned';
export type ContactSource = 'referral' | 'website' | 'social' | 'direct' | 'event';

export interface Contact {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: ContactStatus;
  source: ContactSource;
  notes: string | null;
}

export type DealStage = 'discovery' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Deal {
  id: string;
  created_at: string;
  title: string;
  value: number;
  stage: DealStage;
  contact_id: string | null;
  expected_close: string | null;
  notes: string | null;
  contact?: Contact; // Joined data
}

export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task';

export interface Activity {
  id: string;
  created_at: string;
  type: ActivityType;
  description: string;
  contact_id: string | null;
  deal_id: string | null;
  completed: boolean;
  due_date: string | null;
  contact?: Contact; // Joined data
  deal?: Deal; // Joined data
}
