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
  'Used Mail id Category': string;
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
  'Follow up final': string;
  Responded?: string;
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
