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

  const email1Date = parseDateString(getLeadField(lead, '1st dm'));
  const f1Date = parseDateString(getLeadField(lead, 'followup 1'));
  const f2Date = parseDateString(getLeadField(lead, 'followup 2'));
  const finalDate = parseDateString(getLeadField(lead, 'Final'));

  if (finalDate) {
    return { status: 'completed', text: 'Finished' };
  }

  if (f2Date) {
    if (differenceInDays(today, f2Date) >= 4) {
      return { status: 'due_final', text: 'Final Follow-up Due' };
    }
    return { status: 'wait_final', text: 'Wait for Final' };
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

  if (!getLeadField(lead, 'Insta Url') || getLeadField(lead, 'Insta Url').trim() === '') {
    return { status: 'uncontacted', text: 'Add Instagram' };
  }

  return { status: 'uncontacted', text: 'Ready to Pitch' };
}
