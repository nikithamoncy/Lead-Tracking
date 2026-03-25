import { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import type { LeadData, UILead } from './types';
import { checkFollowUpStatus } from './utils/dateLogic';
import { getLeadField } from './utils/helpers';
import { LeadList } from './components/LeadList';
import { LeadDetail } from './components/LeadDetail';
import { Activity } from 'lucide-react';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1v9p-muUA2bh1kb_17ImBmhFFsDaREldO0d9ve6418Wc/export?format=csv&gid=310390165';

function App() {
  const [leads, setLeads] = useState<UILead[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        Papa.parse(SHEET_URL, {
          download: true,
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedData = results.data as LeadData[];
            const uiLeads: UILead[] = parsedData.map((lead, index) => {
              const { status, text } = checkFollowUpStatus(lead);
              return {
                ...lead,
                id: `lead-${index}-${lead.Name?.replace(/\s+/g, '-').toLowerCase()}`,
                primaryStatus: status,
                primaryStatusText: text,
                latestPostDate: lead['latest post'] ? new Date(lead['latest post']) : null,
                originalIndex: index,
              };
            });
            setLeads(uiLeads);
            if (uiLeads.length > 0) {
              setSelectedId(uiLeads[0].id);
            }
            setLoading(false);
          },
          error: (err: any) => {
            setError('Failed to load data from Google Sheets: ' + err.message);
            setLoading(false);
          }
        });
      } catch (err) {
        setError('An unexpected error occurred.');
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    let result = leads.filter(lead => 
      (statusFilter === '' || lead.primaryStatusText === statusFilter) &&
      (lead.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       lead.City?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       lead.Email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       lead.primaryStatusText?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (sortBy === 'response') {
       result.sort((a, b) => {
          const aRes = a.Responded || '';
          const bRes = b.Responded || '';
          return bRes.localeCompare(aRes);
       });
    } else if (sortBy === 'mailId') {
       result.sort((a, b) => {
          const aMail = getLeadField(a, 'Used Mail id') || '';
          const bMail = getLeadField(b, 'Used Mail id') || '';
          if (!aMail && bMail) return 1;
          if (aMail && !bMail) return -1;
          return aMail.localeCompare(bMail);
       });
    }

    return result;
  }, [leads, searchQuery, statusFilter, sortBy]);

  const selectedLead = useMemo(() => {
    return leads.find(l => l.id === selectedId) || null;
  }, [leads, selectedId]);

  if (loading) {
    return (
      <div className="flex bg-zinc-950 items-center justify-center h-screen w-screen text-amber-500 flex-col gap-4">
        <Activity className="w-12 h-12 animate-pulse" />
        <p className="font-mono text-sm tracking-widest uppercase">Initializing CRM...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-zinc-950 items-center justify-center h-screen w-screen text-rose-500 flex-col px-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Connection Error</h1>
        <p className="text-zinc-400 max-w-md">{error}</p>
        <p className="text-zinc-500 mt-4 text-sm">Please ensure the Google Sheet is published to the web or accessible via link.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-zinc-950 overflow-hidden font-sans">
      <div className="w-full md:w-[350px] lg:w-[400px] h-full flex-shrink-0 border-r border-zinc-800">
        <LeadList 
          leads={filteredLeads}
          selectedId={selectedId}
          onSelect={setSelectedId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />
      </div>
      <div className="hidden md:flex flex-1 h-full relative">
        <LeadDetail 
          lead={selectedLead} 
          onLeadUpdate={async () => {}} 
          onLeadDelete={async () => {}} 
        />
      </div>
    </div>
  );
}

export default App;
