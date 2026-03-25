import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Link as LinkIcon, ArrowRight, Loader2, AlertCircle, FolderSync } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [inputUrl, setInputUrl] = useState('');
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheets, setSheets] = useState<{name: string, gid: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load from local storage on mount
  useEffect(() => {
    const savedId = localStorage.getItem('leadTrackingSheetId');
    if (savedId) {
       fetchSheets(savedId);
    }
  }, []);

  const extractId = (input: string) => {
    const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : input.trim();
  };

  const handleFetch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const id = extractId(inputUrl);
    if (!id) {
       setError("Please enter a valid Google Sheet URL or ID");
       return;
    }
    fetchSheets(id);
  };

  const fetchSheets = async (id: string) => {
    setLoading(true);
    setError('');
    setSpreadsheetId(id);
    try {
      const url = `https://script.google.com/macros/s/AKfycbyFEm9x5qTzIGi45ZLnzjD49DKgHu98BS36a8NU2qhU3H62ooVvrwoAnpPGHs2rBZeB/exec?action=getSheets&id=${id}`;
      const res = await fetch(url);
      
      const data = await res.json();
      if (data.error) {
         setError(data.error);
         setSheets([]);
      } else {
         setSheets(data);
         localStorage.setItem('leadTrackingSheetId', id);
         setInputUrl(''); // Clear input after successful fetch
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch sheets. Ensure the Google Apps Script 'getSheets' function is deployed.");
    } finally {
      setLoading(false);
    }
  };

  const getStyleForIndex = (index: number) => {
    const colors = ['amber', 'pink', 'indigo', 'emerald', 'sky', 'rose'];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />

      <header className="border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-3">
          <Database className="w-6 h-6 text-indigo-500" />
          <h1 className="text-xl font-bold tracking-tight">Antigravity CRM</h1>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 md:py-20 relative z-10">
        <div className="max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 drop-shadow-sm">Select a Project</h2>
          <p className="text-lg text-zinc-400 leading-relaxed mb-8">
            Enter your Google Sheet URL to load your lead tracking databases. Make sure your Google Apps script has the `getSheets` action deployed.
          </p>
          
          <form onSubmit={handleFetch} className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inputUrl.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Load Sheets'}
            </button>
          </form>

          {error && (
            <div className="flex items-start gap-3 text-rose-400 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {loading && !sheets.length && (
          <div className="flex items-center justify-center p-12 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          {sheets.map((sheet, index) => {
            const color = getStyleForIndex(index);
            return (
              <button
                key={sheet.gid}
                onClick={() => navigate(`/crm/${spreadsheetId}/${sheet.gid}?name=${encodeURIComponent(sheet.name)}`)}
                className={`text-left group bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-8 hover:bg-zinc-900/80 transition-all duration-300 relative overflow-hidden`}
              >
                <div className={`absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity bg-${color}-500`} />
                
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 bg-zinc-950 rounded-xl shadow-inner border border-zinc-800 transition-colors group-hover:border-${color}-500/30`}>
                    <FolderSync className={`w-8 h-8 text-${color}-500`} />
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-zinc-950 border border-zinc-800 transition-colors group-hover:bg-${color}-500 group-hover:border-${color}-500`}>
                    <ArrowRight className={`w-5 h-5 text-zinc-500 group-hover:text-zinc-950 transition-colors`} />
                  </div>
                </div>
                
                <h3 className="text-2xl font-semibold mb-3 text-zinc-100">{sheet.name}</h3>
                <p className="text-zinc-500 text-sm font-mono truncate">GID: {sheet.gid}</p>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};

