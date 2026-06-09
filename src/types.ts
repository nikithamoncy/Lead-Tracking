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
  'Insta Url': string;
  Email: string;
  'Email Subject': string;
  'Email Content': string;
  '1st dm': string;
  'Used Mail id': string;
  Info: string;
  'Insta Bio': string;
  p1: string;
  p2: string;
  p3: string;
  'latest post'?: string;
  personalization?: string;
  Status: string;
  'followup 1': string;
  'followup 2': string;
  'Final': string;
  Response?: string;
  auto?: string;
}

export type FollowUpStatus = 
  | 'uncontacted' 
  | 'wait_f1' | 'due_f1' 
  | 'wait_f2' | 'due_f2' 
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
