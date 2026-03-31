import { parse, isValid, startOfDay, differenceInDays } from 'date-fns';
import type { LeadData, FollowUpStatus } from '../types';
import { getLeadField } from './helpers';

export function parseDateString(dateStr: string | null | undefined): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  // Parse DD/MM/YYYY or d/M/yyyy (Day Month Year - from Google Sheet)
  const parsed = parse(dateStr.trim(), 'd/M/yyyy', new Date());
  return isValid(parsed) ? parsed : null;
}

export function checkFollowUpStatus(lead: LeadData): { status: FollowUpStatus; text: string } {
  const today = startOfDay(new Date());

  const email1Date = parseDateString(getLeadField(lead, 'Email 1st date'));
  const f1Date = parseDateString(getLeadField(lead, 'Folloow up 1') || getLeadField(lead, 'Follow up 1'));
  const f2Date = parseDateString(getLeadField(lead, 'Follow up 2'));
  const f3Date = parseDateString(getLeadField(lead, 'Follow up 3'));
  const f4Date = parseDateString(getLeadField(lead, 'Follow up 4'));
  const f5Date = parseDateString(getLeadField(lead, 'Follow up 5'));
  const f6Date = parseDateString(getLeadField(lead, 'Follow up 6'));
  const finalDate = parseDateString(getLeadField(lead, 'Follow up final'));

  if (finalDate) {
    return { status: 'completed', text: 'Finished' };
  }

  if (f6Date) {
    if (differenceInDays(today, f6Date) >= 7) {
      return { status: 'due_final', text: 'Final Follow-up Due' };
    }
    return { status: 'wait_final', text: 'Wait for Final Follow-up' };
  }

  if (f5Date) {
    if (differenceInDays(today, f5Date) >= 7) {
      return { status: 'due_f6', text: 'Follow-up 6 Due' };
    }
    return { status: 'wait_f6', text: 'Wait for Follow-up 6' };
  }

  if (f4Date) {
    if (differenceInDays(today, f4Date) >= 7) {
      return { status: 'due_f5', text: 'Follow-up 5 Due' };
    }
    return { status: 'wait_f5', text: 'Wait for Follow-up 5' };
  }

  if (f3Date) {
    if (differenceInDays(today, f3Date) >= 5) {
      return { status: 'due_f4', text: 'Follow-up 4 Due' };
    }
    return { status: 'wait_f4', text: 'Wait for Follow-up 4' };
  }

  if (f2Date) {
    if (differenceInDays(today, f2Date) >= 4) {
      return { status: 'due_f3', text: 'Follow-up 3 Due' };
    }
    return { status: 'wait_f3', text: 'Wait for Follow-up 3' };
  }

  if (f1Date) {
    if (differenceInDays(today, f1Date) >= 3) {
      return { status: 'due_f2', text: 'Follow-up 2 Due' };
    }
    return { status: 'wait_f2', text: 'Wait for Follow-up 2' };
  }

  if (email1Date) {
    if (differenceInDays(today, email1Date) >= 2) {
      return { status: 'due_f1', text: 'Follow-up 1 Due' };
    }
    return { status: 'wait_f1', text: 'Wait for Follow-up 1' };
  }

  if (!lead['Instagram URL'] || lead['Instagram URL'].trim() === '') {
    return { status: 'uncontacted', text: 'Add Instagram' };
  }
  return { status: 'uncontacted', text: 'Ready to Pitch' };
}
