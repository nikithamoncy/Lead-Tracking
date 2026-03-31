export interface LeadData {
  Name: string;
  'Total Score': string;
  'Review Count': string;
  'Image Count': string;
  Address: string;
  City: string;
  Country: string;
  Number: string;
  Website: string;
  'Root url': string;
  'Email quality': string;
  'Map Url': string;
  'Instagram URL': string;
  Email: string;
  'Email Subject': string;
  'Email Content': string;
  'Email 1st date': string;
  'Used Mail id': string;
  Info: string;
  'Insta Bio': string;
  p1: string;
  p2: string;
  p3: string;
  'latest post'?: string;
  personalization?: string;
  Status: string;
  'Folloow up 1': string;
  'Follow up 2': string;
  'Follow up 3'?: string;
  'Follow up 4'?: string;
  'Follow up 5'?: string;
  'Follow up 6'?: string;
  'Follow up final': string;
  Responded?: string;
}

export type FollowUpStatus = 
  | 'uncontacted' 
  | 'wait_f1' | 'due_f1' 
  | 'wait_f2' | 'due_f2' 
  | 'wait_f3' | 'due_f3' 
  | 'wait_f4' | 'due_f4' 
  | 'wait_f5' | 'due_f5' 
  | 'wait_f6' | 'due_f6' 
  | 'wait_final' | 'due_final' 
  | 'completed'
  | 'stopped';

export interface UILead extends LeadData {
  id: string;
  primaryStatus: FollowUpStatus;
  primaryStatusText: string;
  latestPostDate: Date | null;
  originalIndex: number;
}
