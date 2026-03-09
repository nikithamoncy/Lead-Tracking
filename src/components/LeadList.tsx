import React from 'react';
import type { UILead, FollowUpStatus } from '../types';
import { cn } from '../utils/cn';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const getStatusColors = (status: FollowUpStatus | undefined) => {
  switch (status) {
    case 'uncontacted': return 'text-zinc-400 border-zinc-700 bg-zinc-800/50';
    case 'wait_f1': return 'text-emerald-600 border-emerald-800/50 bg-emerald-900/10'; // dull green
    case 'due_f1': return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/20'; // bright green
    case 'wait_f2': return 'text-amber-600 border-amber-800/50 bg-amber-900/10'; // dull yellow
    case 'due_f2': return 'text-amber-400 border-amber-500/50 bg-amber-500/20'; // bright yellow
    case 'wait_final': return 'text-rose-600 border-rose-800/50 bg-rose-900/10'; // dull red
    case 'due_final': return 'text-rose-400 border-rose-500/50 bg-rose-500/20'; // bright red
    case 'completed': return 'text-blue-400 border-blue-500/50 bg-blue-500/20'; // completed
    default: return 'text-zinc-400 border-zinc-700 bg-zinc-800/50';
  }
};

interface LeadListProps {
  leads: UILead[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const LeadList: React.FC<LeadListProps> = ({ leads, selectedId, onSelect, searchQuery, onSearchChange }) => {
  return (
    <div className="flex flex-col h-full bg-zinc-900">
      <div className="p-4 border-b border-zinc-800 sticky top-0 bg-zinc-900/90 backdrop-blur-sm z-10">
        <input
          type="text"
          placeholder="Search leads..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
        />
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
        {leads.map((lead, index) => {
          const isSelected = selectedId === lead.id;
          const isResponded = lead.Responded?.trim() === 'Responded';

          let cardStyle = "bg-transparent border border-transparent hover:bg-zinc-800 hover:border-zinc-700";
          
          if (isResponded) {
             cardStyle = isSelected 
               ? "bg-emerald-500/20 border border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
               : "bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/15";
          } else if (isSelected) {
             cardStyle = "bg-amber-500/10 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]";
          }

          return (
            <button
              key={lead.id}
              onClick={() => onSelect(lead.id)}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-all duration-200 flex flex-col gap-2 group",
                cardStyle
              )}
            >
              <div className="flex justify-between items-start w-full gap-2">
                <span className={cn(
                  "font-medium truncate",
                  isResponded ? (isSelected ? "text-emerald-300" : "text-emerald-400 group-hover:text-emerald-300") :
                  isSelected ? "text-amber-400" : "text-zinc-200 group-hover:text-zinc-100"
                )}>
                  {index + 1}. {lead.Name || 'Unknown Gym'}
                </span>
                {lead.primaryStatus?.startsWith('due_') && (
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 animate-pulse drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]" />
                )}
                {lead.primaryStatus === 'completed' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                )}
                {(lead.primaryStatus?.startsWith('wait_') || lead.primaryStatus === 'uncontacted') && (
                  <Clock className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                )}
              </div>
              
              <div className="flex justify-between items-center w-full">
                <span className="flex-1 text-xs text-zinc-500 truncate mr-2">
                  {lead.City || 'Unknown City'}
                  {lead['Latest Post'] && (
                    <span className="ml-2 text-zinc-400">
                      • Post: {lead['Latest Post']}
                    </span>
                  )}
                </span>
                <span className={cn(
                  "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0",
                  getStatusColors(lead.primaryStatus)
                )}>
                  {lead.primaryStatusText}
                </span>
              </div>
            </button>
          );
        })}
        {leads.length === 0 && (
          <div className="text-center p-8 text-zinc-500 text-sm">
            No leads found.
          </div>
        )}
      </div>
    </div>
  );
};
