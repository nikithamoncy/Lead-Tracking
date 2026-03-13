export interface LeadData {
  Name: string;
  'Total Score': string;
  'Review Count': string;
  'Image Count': string;
  Address: string;
  City: string;
  Country: string;
  Number: string;
  'Map Url': string;
  Website: string;
  'Instagram URL': string;
  Category: string;
  Info: string;
  Status: string;
  '1st DM': string;
  'Folloow up 1': string; // Note: spelling matches CSV exactly
  'Follow up 2': string;
  'Follow up final': string;
  'Latest Post'?: string;
  'Responded'?: string;
}

export type FollowUpStatus = 
  | 'uncontacted' 
  | 'wait_f1' | 'due_f1' 
  | 'wait_f2' | 'due_f2' 
  | 'wait_final' | 'due_final' 
  | 'completed';

export interface UILead extends LeadData {
  id: string;
  primaryStatus: FollowUpStatus;
  primaryStatusText: string;
  latestPostDate: Date | null;
  originalIndex: number;
}
