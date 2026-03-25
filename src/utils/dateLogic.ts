import { parse, isValid, startOfDay, differenceInDays } from 'date-fns';
import type { LeadData, FollowUpStatus } from '../types';

export function parseDateString(dateStr: string | null | undefined): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  // Parse MM/DD/YYYY or M/D/YYYY (Month Day Year - from Google Sheet)
  const parsed = parse(dateStr.trim(), 'M/d/yyyy', new Date());
  return isValid(parsed) ? parsed : null;
}

export function checkFollowUpStatus(lead: LeadData): { status: FollowUpStatus; text: string } {
  const today = startOfDay(new Date());

  const email1Date = parseDateString(lead['Email 1st date']);
  const f1Date = parseDateString(lead['Folloow up 1']); // Using CSV typo
  const f2Date = parseDateString(lead['Follow up 2']);
  const finalDate = parseDateString(lead['Follow up final']);

  if (finalDate) {
    return { status: 'completed', text: 'Finished' };
  }

  if (f2Date) {
    if (differenceInDays(today, f2Date) >= 7) {
      return { status: 'due_final', text: 'Final Follow-up Due' };
    }
    return { status: 'wait_final', text: 'Wait for Final' };
  }

  if (f1Date) {
    if (differenceInDays(today, f1Date) >= 7) {
      return { status: 'due_f2', text: 'Follow-up 2 Due' };
    }
    return { status: 'wait_f2', text: 'Wait for Follow-up 2' };
  }

  if (email1Date) {
    if (differenceInDays(today, email1Date) >= 4) {
      return { status: 'due_f1', text: 'Follow-up 1 Due' };
    }
    return { status: 'wait_f1', text: 'Wait for Follow-up 1' };
  }

  if (!lead['Instagram URL'] || lead['Instagram URL'].trim() === '') {
    return { status: 'uncontacted', text: 'Add Instagram' };
  }
  return { status: 'uncontacted', text: 'Ready to Pitch' };
}
