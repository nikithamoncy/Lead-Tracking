export const getLeadField = (lead: any, key: string): string => {
  if (!lead) return '';
  if (lead[key] !== undefined) return lead[key];
  
  const searchLower = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  const actualKey = Object.keys(lead).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === searchLower);
  
  return actualKey ? lead[actualKey] : '';
};
