import { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import type { LeadData, UILead } from './types';
import { checkFollowUpStatus, parseDateString } from './utils/dateLogic';
import { getLeadField } from './utils/helpers';
import { LeadList } from './components/LeadList';
import { LeadDetail } from './components/LeadDetail';
import { Activity, ArrowLeft } from 'lucide-react';

const getSheetUrl = (spreadsheetId: string, gid: string) => `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;

export function CRM() {
  const { spreadsheetId, gid } = useParams<{ spreadsheetId: string, gid: string }>();
  const [searchParams] = useSearchParams();
  const projectName = searchParams.get('name') || 'CRM Dashboard';
  const navigate = useNavigate();

  const [leads, setLeads] = useState<UILead[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [responseFilter, setResponseFilter] = useState('');
  const [mailIdFilter, setMailIdFilter] = useState('');
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gid || !spreadsheetId) return;

    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError(null);
        Papa.parse(getSheetUrl(spreadsheetId, gid), {
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
                latestPostDate: parseDateString(lead['latest post']),
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
  }, [gid]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchSearch = (
        lead.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.City?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.Email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.primaryStatusText?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchStatus = statusFilter === '' || lead.primaryStatusText === statusFilter;
      
      const leadResponse = getLeadField(lead, 'Responded') || '';
      let matchResponse = true;
      if (responseFilter === 'None') matchResponse = leadResponse === '';
      else if (responseFilter !== '') matchResponse = leadResponse.toLowerCase().includes(responseFilter.toLowerCase());

      const leadMail = getLeadField(lead, 'Used Mail id') || '';
      const matchMail = mailIdFilter === '' || leadMail.toLowerCase() === mailIdFilter.toLowerCase();

      return matchSearch && matchStatus && matchResponse && matchMail;
    });
  }, [leads, searchQuery, statusFilter, responseFilter, mailIdFilter]);

  const selectedLead = useMemo(() => {
    return leads.find(l => l.id === selectedId) || null;
  }, [leads, selectedId]);

  if (loading) {
    return (
      <div className="flex bg-zinc-950 items-center justify-center h-screen w-screen text-indigo-500 flex-col gap-4">
        <Activity className="w-12 h-12 animate-pulse" />
        <p className="font-mono text-sm tracking-widest uppercase text-zinc-400">Loading {projectName}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-zinc-950 items-center justify-center h-screen w-screen text-rose-500 flex-col px-4 text-center gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Connection Error</h1>
          <p className="text-zinc-400 max-w-md">{error}</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return Home
        </button>
      </div>
    );
  }

  const handleLeadUpdate = async (updates: Partial<UILead>) => {
    if (!selectedLead || !projectName) return;
    
    // Use the actual Web App URL provided by the user
    const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyFEm9x5qTzIGi45ZLnzjD49DKgHu98BS36a8NU2qhU3H62ooVvrwoAnpPGHs2rBZeB/exec'; 

    try {
      if (WEBAPP_URL) {
        await fetch(WEBAPP_URL, {
          method: 'POST',
          mode: 'no-cors', // Required for Google Apps Script
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'edit',
            sheetName: projectName,
            LeadName: selectedLead.Name,
            updates: updates
          })
        });
      }

      // Optimistically update the UI
      setLeads(prev => prev.map(l => {
        if (l.id === selectedLead.id) {
          const updated = { ...l, ...updates };
          const { status, text } = checkFollowUpStatus(updated);
          return {
            ...updated,
            primaryStatus: status,
            primaryStatusText: text,
            latestPostDate: parseDateString(updated['latest post']),
          };
        }
        return l;
      }));
    } catch (err) {
      console.error(err);
      alert('Failed to update lead');
    }
  };

  const handleLeadDelete = async (leadName: string) => {
    if (!projectName) return;
    
    const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyFEm9x5qTzIGi45ZLnzjD49DKgHu98BS36a8NU2qhU3H62ooVvrwoAnpPGHs2rBZeB/exec'; 

    try {
      if (WEBAPP_URL) {
        await fetch(WEBAPP_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete',
            sheetName: projectName,
            LeadName: leadName
          })
        });
      }

      // Optimistically remove from UI
      setLeads(prev => prev.filter(l => l.Name !== leadName));
      setSelectedId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete lead');
    }
  };

  return (
    <div className="flex h-screen w-screen bg-zinc-950 overflow-hidden font-sans relative">
      <div className={`w-full md:w-[350px] lg:w-[400px] h-full flex-shrink-0 border-r border-zinc-800 flex flex-col absolute md:static inset-0 bg-zinc-950 z-10 transition-transform duration-300 ease-in-out ${isMobileDetailOpen ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
        {/* CRM Header with Back Navigation */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-sm z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => navigate('/')}
                    className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-zinc-100"
                    title="Return to Projects"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="font-semibold text-zinc-100 truncate">{projectName}</h2>
            </div>
            <div className="text-xs font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded inline-block border border-zinc-800/50">
                {filteredLeads.length} leads
            </div>
        </div>

        {/* Lead List Area */}
        <div className="flex-1 overflow-hidden relative">
          <LeadList 
            leads={filteredLeads}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              setIsMobileDetailOpen(true);
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            responseFilter={responseFilter}
            onResponseFilterChange={setResponseFilter}
            mailIdFilter={mailIdFilter}
            onMailIdFilterChange={setMailIdFilter}
          />
        </div>
      </div>
      
      <div className={`flex-1 h-full relative w-full absolute md:static inset-0 bg-zinc-950 z-20 transition-transform duration-300 ease-in-out ${isMobileDetailOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} flex`}>
        <LeadDetail 
          lead={selectedLead} 
          onLeadUpdate={handleLeadUpdate} 
          onLeadDelete={handleLeadDelete} 
          onBack={() => setIsMobileDetailOpen(false)}
        />
      </div>
    </div>
  );
}
