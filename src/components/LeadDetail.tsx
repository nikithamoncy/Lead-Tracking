import React, { useState } from 'react';
import type { UILead } from '../types';
import { ExternalLink, MapPin, Phone, Globe, Instagram, Star, Image as ImageIcon, Calendar, Trash2, X, Save, Check, MessageCircle, Edit2, ArrowLeft, Copy, Link as LinkIcon } from 'lucide-react';
import { getLeadField } from '../utils/helpers';

interface LeadDetailProps {
  lead: UILead | null;
  onLeadUpdate: (updatedLead: Partial<UILead>) => Promise<void>;
  onLeadDelete: (leadName: string) => Promise<void>;
  onBack?: () => void;
}

export const LeadDetail: React.FC<LeadDetailProps> = ({ lead, onLeadUpdate, onLeadDelete, onBack }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 bg-zinc-950">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 shadow-xl">
          <Star className="w-8 h-8 text-zinc-700" />
        </div>
        <p className="text-lg font-medium text-zinc-400">Select a lead to view details</p>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${lead.Name}? This will permanently remove it from the Google Sheet.`)) {
      setIsDeleting(true);
      await onLeadDelete(lead.Name);
      setIsDeleting(false);
    }
  };

  const handleCopyRow = () => {
    if (!lead) return;
    const fieldsToCopy = [
      'Name', 'Total Score', 'Review Count', 'Image Count', 'Address', 'City', 'Country', 'Number',
      'Website', 'Root url', 'Email quality', 'Map Url', 'Instagram URL', 'Email', 'Email Subject',
      'Email Content', 'Email 1st date', 'Used Mail id', 'Info', 'Insta Bio', 'p1', 'p2', 'p3',
      'latest post', 'personalization', 'Status', 'Folloow up 1', 'Follow up 2', 'Follow up 3',
      'Follow up 4', 'Follow up 5', 'Follow up 6', 'Follow up final', 'Responded'
    ];
    
    let text = '';
    fieldsToCopy.forEach(field => {
      const value = lead[field as keyof UILead];
      if (value !== undefined && value !== null && value !== '') {
        text += `${field} : ${value}\n`;
      }
    });

    navigator.clipboard.writeText(text.trim());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-zinc-950 p-4 md:p-6 custom-scrollbar relative">
      {/* Top left back button (mobile only) */}
      {onBack && (
        <div className="absolute top-6 left-6 z-10 md:hidden">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors backdrop-blur-sm shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      )}
      {/* Top right action buttons */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
        <button 
          onClick={handleCopyRow}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors backdrop-blur-sm shadow-md"
        >
          {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />} {isCopied ? 'Copied!' : 'Copy Row'}
        </button>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 rounded-lg text-sm text-rose-500 transition-colors disabled:opacity-50"
        >
          {isDeleting ? '...' : <Trash2 className="w-4 h-4" />} Delete
        </button>
      </div>
      <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-10 md:pt-0">
        
        {/* Header Section */}
        <div className="space-y-4 relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl" />
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white drop-shadow-sm">
            {lead.Name}
          </h1>
          
          <div className="flex flex-wrap gap-3">
            <span className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-sm text-zinc-400 shadow-sm cursor-default">
              {lead.Country || 'Unknown Country'}
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard icon={<Star className="w-5 h-5 text-amber-400" />} label="Score" value={lead['Total Score'] || '-'} />
          <MetricCard icon={<CheckCircle className="w-5 h-5 text-blue-400" />} label="Reviews" value={lead['Review Count'] || '-'} />
          <MetricCard icon={<ImageIcon className="w-5 h-5 text-purple-400" />} label="Images" value={lead['Image Count'] || '-'} />
          <MetricCard icon={<Phone className="w-5 h-5 text-emerald-400" />} label="Phone" value={lead.Number?.split('\n')[0] || '-'} />
        </div>

        {/* Location Section */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-zinc-800 rounded-xl shadow-inner">
              <MapPin className="w-6 h-6 text-zinc-300" />
            </div>
            <div className="space-y-3 w-full">
              <h3 className="text-lg font-medium text-zinc-200">Location Details</h3>
              <div>
                <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Address</label>
                <div className="mt-1">
                  <EditableTextarea value={getLeadField(lead, 'Address') || ''} label="Address" onSave={async (val) => await onLeadUpdate({Address: val})} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1 group">
                  <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider group-hover:text-amber-500 transition-colors">Country</label>
                  <CopyButton text={getLeadField(lead, 'Country') || ''} title="Copy Country" />
                </div>
                <EditableTextarea value={getLeadField(lead, 'Country') || ''} label="Country" onSave={async (val) => await onLeadUpdate({Country: val})} />
              </div>
            </div>
          </div>
        </div>

        {/* Info & Notes Section */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/40 border border-zinc-800 rounded-2xl p-4 backdrop-blur-sm shadow-lg space-y-4">
          <div className="border-b border-zinc-800/50 pb-2 mb-2">
            <h3 className="text-lg font-medium text-zinc-200">Info & Notes</h3>
          </div>
          
          <div>
            <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Info</label>
            <EditableTextarea value={getLeadField(lead, 'Info') || ''} label="Info" onSave={async (val) => await onLeadUpdate({Info: val})} />
          </div>
          
          <div>
            <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Personalization</label>
            <EditableTextarea value={getLeadField(lead, 'personalization') || ''} label="Personalization" onSave={async (val) => await onLeadUpdate({personalization: val})} />
          </div>
        </div>

        {/* Links & Social Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-pink-500" />
            Links & Social
          </h3>
          <div className="bg-zinc-900/30 border border-zinc-800/30 rounded-2xl p-4 backdrop-blur-sm flex flex-col gap-4">
            <div className="flex flex-wrap gap-4 items-center">
              <EditableLinkBadge url={lead['Instagram URL'] || ''} onSave={async (val) => await onLeadUpdate({'Instagram URL': val})} />
              
              {lead['Map Url'] && (
                <a href={lead['Map Url']} target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full text-sm text-zinc-300 transition-colors shadow-sm cursor-pointer">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  Map URL
                </a>
              )}
              {lead.Website && (
                <a href={lead.Website} target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full text-sm text-zinc-300 transition-colors shadow-sm cursor-pointer">
                  <Globe className="w-4 h-4 text-amber-500" />
                  Website
                </a>
              )}
              {lead['Root url'] && (
                <a href={lead['Root url']} target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full text-sm text-zinc-300 transition-colors shadow-sm cursor-pointer">
                  <ExternalLink className="w-4 h-4 text-blue-500" />
                  Root URL
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Email Content Section */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/40 border border-zinc-800 rounded-2xl p-4 backdrop-blur-sm shadow-lg space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2 mb-2">
            <h3 className="text-lg font-medium text-zinc-200">Email Details</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1 group">
                <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider group-hover:text-amber-500 transition-colors">Target Email</label>
                <CopyButton text={lead.Email || ''} title="Copy Target Email" />
              </div>
              <EditableTextarea value={lead.Email || ''} label="Email" onSave={async (val) => await onLeadUpdate({Email: val})} />
            </div>
            <div>
               <EditableDropdown 
                 label="Used Mail ID" 
                 value={getLeadField(lead, 'Used Mail id') || ''} 
                 options={['nm', 'nk', 'ndw']} 
                 onSave={async (val) => await onLeadUpdate({'Used Mail id': val})} 
               />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1 group">
              <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider group-hover:text-amber-500 transition-colors">Email Subject</label>
              <CopyButton text={lead['Email Subject'] || ''} title="Copy Subject" />
            </div>
            <EditableTextarea value={lead['Email Subject'] || ''} label="Subject" onSave={async (val) => await onLeadUpdate({'Email Subject': val})} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1 group">
              <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider group-hover:text-amber-500 transition-colors">Email Content</label>
              <CopyButton text={lead['Email Content'] || ''} title="Copy Content" />
            </div>
            <EditableTextarea value={lead['Email Content'] || ''} label="Content" onSave={async (val) => await onLeadUpdate({'Email Content': val})} />
          </div>
        </div>

        {/* Outreach Timeline */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            Outreach Timeline
          </h3>
          <div className="bg-zinc-900/30 border border-zinc-800/30 rounded-2xl p-4 backdrop-blur-sm">
            <div className="grid md:grid-cols-2 gap-4 relative">
              <TimelineItem label="Email 1st Date" date={getLeadField(lead, 'Email 1st date')} isActive={!!getLeadField(lead, 'Email 1st date')} onSave={async (val) => {
                const updates: any = { 'Email 1st date': val };
                if (val && !getLeadField(lead, 'Responded')) {
                  updates['Responded'] = 'Pending';
                }
                await onLeadUpdate(updates);
              }} />
              <TimelineItem label="Follow Up 1" date={getLeadField(lead, 'Folloow up 1') || getLeadField(lead, 'Follow up 1')} isActive={!!(getLeadField(lead, 'Folloow up 1') || getLeadField(lead, 'Follow up 1'))} onSave={async (val) => await onLeadUpdate({'Folloow up 1': val})} disabled={!getLeadField(lead, 'Email 1st date')} />
              <TimelineItem label="Follow Up 2" date={getLeadField(lead, 'Follow up 2')} isActive={!!getLeadField(lead, 'Follow up 2')} onSave={async (val) => await onLeadUpdate({'Follow up 2': val})} disabled={!(getLeadField(lead, 'Folloow up 1') || getLeadField(lead, 'Follow up 1'))} />
              <TimelineItem label="Follow Up 3" date={getLeadField(lead, 'Follow up 3')} isActive={!!getLeadField(lead, 'Follow up 3')} onSave={async (val) => await onLeadUpdate({'Follow up 3': val})} disabled={!getLeadField(lead, 'Follow up 2')} />
              <TimelineItem label="Follow Up 4" date={getLeadField(lead, 'Follow up 4')} isActive={!!getLeadField(lead, 'Follow up 4')} onSave={async (val) => await onLeadUpdate({'Follow up 4': val})} disabled={!getLeadField(lead, 'Follow up 3')} />
              <TimelineItem label="Follow Up 5 (Final)" date={getLeadField(lead, 'Follow up final')} isActive={!!getLeadField(lead, 'Follow up final')} onSave={async (val) => await onLeadUpdate({'Follow up final': val})} disabled={!getLeadField(lead, 'Follow up 4')} />
            </div>
          </div>
        </div>

        {/* Response Section */}
        <div className="max-w-sm space-y-3">
          <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            Response
          </h3>
          <div className="bg-zinc-900/30 border border-zinc-800/30 rounded-2xl p-4 backdrop-blur-sm min-h-[100px]">
            <EditableDropdown 
              label="Responded" 
              value={getLeadField(lead, 'Responded') || ''} 
              options={['Pending', 'Responded', 'auto response', 'Stop']} 
              onSave={async (val) => await onLeadUpdate({Responded: val})} 
            />
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper function to convert D/M/YYYY to YYYY-MM-DD for native date input
const formatDateForInput = (dateStr: string | undefined) => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    // Sheet is D/M/YYYY
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return dateStr;
};

// Helper function to convert YYYY-MM-DD from input back to D/M/YYYY for CSV/AppLogic bridging
const parseDateFromInput = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}/${parts[0]}`;
  }
  return dateStr;
};

// Returns D/M/YYYY for the Quick Pickers
const getRelativeDateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

// Display format on UI 
const displayDate = (dateStr: string | undefined) => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    // D/M/YYYY incoming -> DD/MM/YYYY outgoing
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

const QuickDatePickers = ({ onChange, onOpenCalendar }: { onChange: (v: string) => void, onOpenCalendar?: () => void }) => (
  <div className="flex flex-wrap gap-1.5 mt-2 items-center">
    {onOpenCalendar && (
      <button type="button" onClick={onOpenCalendar} className="text-zinc-400 hover:text-amber-500 bg-zinc-800 hover:bg-zinc-700 p-1.5 rounded transition-colors" title="Open Calendar">
        <Calendar className="w-3.5 h-3.5" />
      </button>
    )}
    <button type="button" onClick={() => onChange(getRelativeDateStr(0))} className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors">Today</button>
    <button type="button" onClick={() => onChange(getRelativeDateStr(1))} className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors">1d</button>
    <button type="button" onClick={() => onChange(getRelativeDateStr(2))} className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors">2d</button>
    <button type="button" onClick={() => onChange(getRelativeDateStr(3))} className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors">3d</button>
    <button type="button" onClick={() => onChange(getRelativeDateStr(4))} className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors">4d</button>
    <button type="button" onClick={() => onChange(getRelativeDateStr(5))} className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors">5d</button>
    <button type="button" onClick={() => onChange(getRelativeDateStr(6))} className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors">6d</button>
    <button type="button" onClick={() => onChange(getRelativeDateStr(7))} className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors">1w</button>
  </div>
);


const MetricCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-3 flex flex-col gap-1.5 backdrop-blur-sm hover:bg-zinc-900/50 transition-colors">
    <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
      {icon} {label}
    </div>
    <div className="text-xl md:text-2xl font-semibold text-zinc-100 truncate">{value}</div>
  </div>
);

const TimelineItem = ({ 
  label, 
  date, 
  isActive, 
  onSave,
  disabled = false
}: { 
  label: string, 
  date: string, 
  isActive: boolean,
  onSave: (val: string) => Promise<void>,
  disabled?: boolean
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(formatDateForInput(date));
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsSaving(true);
    const finalVal = parseDateFromInput(editVal);
    if (finalVal !== date) {
      await onSave(finalVal);
    }
    setIsEditing(false);
    setIsSaving(false);
  };

  if (isEditing) {
    return (
      <div className="p-3 bg-zinc-900 border border-amber-500/50 rounded-xl space-y-2 relative z-20">
        <label className="text-[10px] font-bold uppercase tracking-wider text-amber-500">{label}</label>
        <input 
          ref={inputRef}
          type="date"
          className="w-full bg-zinc-950 border border-zinc-700 rounded text-sm px-2 py-1 text-zinc-200 focus:outline-none focus:border-amber-500"
          value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSave();
            }
          }}
        />
        <QuickDatePickers 
          onChange={(v) => setEditVal(formatDateForInput(v))} 
          onOpenCalendar={() => {
            if (inputRef.current) {
              try {
                if ('showPicker' in HTMLInputElement.prototype) {
                  inputRef.current.showPicker();
                } else {
                  inputRef.current.focus();
                }
              } catch (e) {
                inputRef.current.focus();
              }
            }
          }}
        />
        <div className="flex gap-2 justify-end mt-2">
          <button onClick={() => setIsEditing(false)} className="text-xs text-zinc-400 hover:text-white">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="text-xs bg-amber-500 text-zinc-950 px-2 py-1 rounded font-medium">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => {
        if (!disabled) {
          setEditVal(formatDateForInput(date));
          setIsEditing(true);
        }
      }}
      className={`group p-3 rounded-xl border transition-colors relative ${
      disabled ? 'bg-zinc-950 border-zinc-900 opacity-40 cursor-not-allowed hidden-hover' : isActive ? 'bg-amber-500/10 border-amber-500/30 cursor-pointer hover:bg-amber-500/15' : 'bg-zinc-900 max-w border-zinc-800/50 opacity-60 cursor-pointer hover:opacity-80'
    }`}>
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: isActive ? '#f59e0b' : '#71717a' }}>
          {label}
        </div>
        {disabled && <div className="text-[10px] text-zinc-600 font-medium">Locked</div>}
      </div>
      <div className={`font-medium ${isActive ? 'text-zinc-200' : 'text-zinc-600'}`}>
        {displayDate(date) || 'Pending'}
      </div>
    </div>
  );
};

const EditableTextarea = ({ value, label, onSave }: { value: string, label: string, onSave: (val: string) => Promise<void> }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    if (editVal !== value) await onSave(editVal);
    setIsEditing(false);
    setIsSaving(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2 mt-2">
        <textarea 
          className="w-full bg-zinc-950 border border-zinc-700 rounded p-3 text-sm text-zinc-200 min-h-[100px] focus:outline-none focus:border-amber-500"
          value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSave();
            }
          }}
          placeholder={`Enter ${label}...`}
        />
        <div className="flex gap-2 justify-end">
          <button onClick={() => setIsEditing(false)} className="text-xs text-zinc-400 hover:text-white px-3 py-1.5">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="text-xs bg-amber-500 text-zinc-950 px-4 py-1.5 rounded font-medium flex items-center gap-2">
            {isSaving ? 'Saving...' : <><Save className="w-3 h-3" /> Save</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => { setEditVal(value); setIsEditing(true); }}
      className="group relative cursor-pointer hover:bg-zinc-900/50 p-2 -m-2 rounded transition-colors"
    >
      <p className="text-zinc-300 whitespace-pre-line leading-relaxed text-sm md:text-base pr-8">
        {value || <span className="text-zinc-600 italic">No notes added. Click to edit.</span>}
      </p>
    </div>
  );
};

const EditableDropdown = ({ value, label, options, onSave }: { value: string, label: string, options: string[], onSave: (val: string) => Promise<void> }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    if (editVal !== value) await onSave(editVal);
    setIsEditing(false);
    setIsSaving(false);
  };

  if (isEditing) {
    return (
      <div className="flex gap-2 items-center">
        <select
          className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1 text-sm text-zinc-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSave();
            }
          }}
        >
          <option value="">None</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <button onClick={handleSave} disabled={isSaving} className="text-xs bg-amber-500 text-zinc-950 px-3 py-1.5 rounded font-medium flex items-center gap-2">
          {isSaving ? '...' : <Save className="w-3 h-3" />}
        </button>
        <button onClick={() => setIsEditing(false)} className="text-xs text-zinc-400 hover:text-white px-2 py-1">Cancel</button>
      </div>
    );
  }

  return (
    <div 
      onClick={() => { setEditVal(value || ''); setIsEditing(true); }}
      className="group relative flex flex-col gap-2 cursor-pointer hover:bg-zinc-900/50 p-2 -m-2 rounded transition-colors"
    >
      <span className="font-semibold uppercase text-xs tracking-wider text-zinc-500">
        {label}
      </span>
      <span className={`text-lg font-semibold ${value === 'Responded' ? 'text-blue-400' : 'text-zinc-300'}`}>
        {value || 'None'}
      </span>
    </div>
  );
};



const CopyButton = ({ text, title }: { text: string, title?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy} 
      className="text-zinc-500 hover:text-amber-500 p-1 bg-zinc-800/50 hover:bg-zinc-800 rounded transition-colors" 
      title={title || "Copy"}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

const EditableLinkBadge = ({ url, onSave }: { url: string, onSave: (val: string) => Promise<void> }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(url);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    if (editVal !== url) await onSave(editVal);
    setIsEditing(false);
    setIsSaving(false);
  };

  if (isEditing) {
    return (
      <div className="flex gap-2 items-center p-1 bg-zinc-900 border border-zinc-700 rounded-lg">
        <input 
          type="url"
          className="bg-zinc-950 px-2 py-1 text-sm text-zinc-200 border border-zinc-800 rounded focus:outline-none focus:border-amber-500 w-48"
          value={editVal}
          onChange={e => setEditVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSave();
            }
          }}
          placeholder="https://instagram.com/..."
        />
        <button onClick={handleSave} disabled={isSaving} className="text-amber-500 hover:text-amber-400 p-1"><Check className="w-4 h-4" /></button>
        <button onClick={() => setIsEditing(false)} className="text-zinc-500 hover:text-zinc-400 p-1"><X className="w-4 h-4" /></button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2">
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer"
           className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full text-sm text-zinc-300 transition-colors shadow-sm">
          <Instagram className="w-4 h-4 text-pink-500" />
          Instagram
        </a>
      ) : null}
      <button onClick={() => { setEditVal(url || ''); setIsEditing(true); }} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 border-dashed rounded-full text-sm text-zinc-500 transition-colors shadow-sm cursor-pointer">
        {url ? <Edit2 className="w-3.5 h-3.5" /> : <><Instagram className="w-4 h-4 opacity-50" /> Add Instagram</>}
      </button>
    </div>
  );
};

const CheckCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
