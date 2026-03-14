import React, { useState } from 'react';
import type { UILead, FollowUpStatus } from '../types';
import { ExternalLink, MapPin, Phone, Globe, Instagram, Star, Image as ImageIcon, Calendar, Trash2, X, Save, Check, Activity, MessageCircle, Edit2, ArrowLeft } from 'lucide-react';

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

interface LeadDetailProps {
  lead: UILead | null;
  onLeadUpdate: (updatedLead: Partial<UILead>) => Promise<void>;
  onLeadDelete: (leadName: string) => Promise<void>;
  onBack?: () => void;
}

export const LeadDetail: React.FC<LeadDetailProps> = ({ lead, onLeadUpdate, onLeadDelete, onBack }) => {
  const [isDeleting, setIsDeleting] = useState(false);
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
              {lead.Category || 'Unknown Category'}
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
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-zinc-200">Location Details</h3>
              <p className="text-zinc-400 whitespace-pre-line leading-relaxed">{lead.Address}</p>
              <div className="pt-2">
                <a href={lead['Map Url']} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-amber-500 hover:text-amber-400 transition-colors">
                  View on Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Info & Notes Section */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/40 border border-zinc-800 rounded-2xl p-4 backdrop-blur-sm shadow-lg">
          <h3 className="text-lg font-medium text-zinc-200 mb-2 pb-2 border-b border-zinc-800/50">Info & Notes</h3>
          <EditableTextarea value={lead.Info} label="Info/Notes" onSave={async (val) => await onLeadUpdate({Info: val})} />
        </div>

        {/* Social Activity Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Instagram className="w-5 h-5 text-pink-500" />
            Social Activity
          </h3>
          <div className="bg-zinc-900/30 border border-zinc-800/30 rounded-2xl p-4 backdrop-blur-sm flex flex-col gap-4">
            <div className="flex flex-wrap gap-4 items-center">
              <EditableLinkBadge url={lead['Instagram URL'] || ''} onSave={async (val) => await onLeadUpdate({'Instagram URL': val})} />
              
              {lead.Website && (
                <a href={lead.Website} target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full text-sm text-zinc-300 transition-colors shadow-sm cursor-pointer">
                  <Globe className="w-4 h-4 text-amber-500" />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>

        {/* DM Content Section */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/40 border border-zinc-800 rounded-2xl p-4 backdrop-blur-sm shadow-lg">
          <h3 className="text-lg font-medium text-zinc-200 mb-2 pb-2 border-b border-zinc-800/50">DM Draft / Content</h3>
          <EditableTextarea value={lead.DM || ''} label="DM Content" onSave={async (val) => await onLeadUpdate({DM: val})} />
        </div>

        {/* Outreach Timeline */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            Outreach Timeline
          </h3>
          <div className="bg-zinc-900/30 border border-zinc-800/30 rounded-2xl p-4 backdrop-blur-sm">
            <div className="grid md:grid-cols-2 gap-4 relative">
              <TimelineItem label="1st DM" date={lead['1st DM']} isActive={!!lead['1st DM']} onSave={async (val) => await onLeadUpdate({'1st DM': val})} />
              <TimelineItem label="Follow Up 1" date={lead['Folloow up 1']} isActive={!!lead['Folloow up 1']} onSave={async (val) => await onLeadUpdate({'Folloow up 1': val})} disabled={!lead['1st DM']} />
              <TimelineItem label="Follow Up 2" date={lead['Follow up 2']} isActive={!!lead['Follow up 2']} onSave={async (val) => await onLeadUpdate({'Follow up 2': val})} disabled={!lead['Folloow up 1']} />
              <TimelineItem label="Final Follow Up" date={lead['Follow up final']} isActive={!!lead['Follow up final']} onSave={async (val) => await onLeadUpdate({'Follow up final': val})} disabled={!lead['Follow up 2']} />
            </div>
          </div>
        </div>

        {/* Status & Response Section */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Current Status
            </h3>
            <div className={`bg-zinc-900/30 border border-zinc-800/30 rounded-2xl p-4 backdrop-blur-sm min-h-[100px] ${getStatusColors(lead.primaryStatus)}`}>
              <EditableMultiSelect 
                 value={lead.Status} 
                 onSave={async (val) => await onLeadUpdate({Status: val})} 
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              Response
            </h3>
            <div className="bg-zinc-900/30 border border-zinc-800/30 rounded-2xl p-4 backdrop-blur-sm min-h-[100px]">
              <EditableDropdown 
                label="Responded" 
                value={lead.Responded || ''} 
                options={['Pending', 'Responded']} 
                onSave={async (val) => await onLeadUpdate({Responded: val})} 
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper function to convert M/D/YYYY to YYYY-MM-DD for native date input
const formatDateForInput = (dateStr: string | undefined) => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    // Sheet is M/D/YYYY
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return dateStr;
};

// Helper function to convert YYYY-MM-DD from input back to M/D/YYYY for CSV/AppLogic bridging
const parseDateFromInput = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}/${parts[0]}`;
  }
  return dateStr;
};

// Returns M/D/YYYY for the Quick Pickers
const getRelativeDateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

// Display format on UI is strictly DD/MM/YYYY
const displayDate = (dateStr: string | undefined) => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    // M/D/YYYY incoming -> DD/MM/YYYY outgoing
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
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

const EditableMultiSelect = ({ value, onSave }: { value: string, onSave: (val: string) => Promise<void> }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const OPTIONS = ['only DM', 'Comment+DM', 'Follow up 1', 'Follow up 2', 'Follow up final'];
  const currentOptions = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

  const handleEditClick = () => {
    setSelected(currentOptions);
    setIsEditing(true);
    setShowCustomInput(false);
  };

  const toggleOption = (opt: string) => {
    setSelected(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]);
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selected.includes(trimmed)) {
      setSelected(prev => [...prev, trimmed]);
      setCustomInput('');
    }
  };

  const handleRemoveOption = async (e: React.MouseEvent, opt: string) => {
    e.stopPropagation();
    setIsSaving(true);
    const newVal = currentOptions.filter(o => o !== opt).join(', ');
    await onSave(newVal);
    setIsSaving(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Include pending custom input if any
    const trimmed = customInput.trim();
    let finalSelected = selected;
    if (trimmed && !selected.includes(trimmed)) {
      finalSelected = [...selected, trimmed];
    }
    
    const finalVal = finalSelected.join(', ');
    if (finalVal !== value) await onSave(finalVal);
    setIsEditing(false);
    setIsSaving(false);
  };

  // Extract all unique options to display as chips, including default + custom ones currently selected
  const displayOptions = Array.from(new Set([...OPTIONS, ...selected]));

  if (isEditing) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-zinc-900 border border-amber-500/30 rounded-xl relative z-20 shadow-xl w-full">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-zinc-400">Select Statuses</label>
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(false)} className="text-xs text-zinc-400 hover:text-white px-2 py-1 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={isSaving} className="text-xs bg-amber-500 text-zinc-950 px-3 py-1 rounded font-medium flex items-center gap-2 hover:bg-amber-400 transition-colors">
              {isSaving ? '...' : 'Save'}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {displayOptions.map(opt => (
            <button
              key={opt}
              onClick={() => toggleOption(opt)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                selected.includes(opt) ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-zinc-950 border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        
        {!showCustomInput ? (
          <button 
            type="button"
            onClick={() => setShowCustomInput(true)} 
            className="mt-2 flex w-max items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-zinc-700 text-xs font-medium text-zinc-400 hover:text-amber-500 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <span className="text-lg leading-none mb-0.5">+</span> Add Custom Status
          </button>
        ) : (
          <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="text-xs font-semibold text-zinc-400">Add Custom Status</div>
            <div className="flex gap-2">
               <input
                 type="text"
                 className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
                 placeholder="Custom status..."
                 value={customInput}
                 onChange={e => setCustomInput(e.target.value)}
                 onKeyDown={e => {
                   if (e.key === 'Enter') {
                     e.preventDefault();
                     handleSave();
                   }
                 }}
                 autoFocus
               />
               <button onClick={() => { handleAddCustom(); setShowCustomInput(false); }} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-sm transition-colors border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-amber-500">Add</button>
               <button onClick={() => { setShowCustomInput(false); setCustomInput(''); }} className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 rounded text-sm transition-colors border border-transparent hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-amber-500">Cancel</button>
            </div>
          </div>
        )}

      </div>
    );
  }

  return (
    <div 
      onClick={handleEditClick}
      className="group relative flex flex-wrap items-center gap-2 cursor-pointer hover:bg-zinc-900/50 p-2 -m-2 rounded transition-colors min-h-[40px]"
    >
      {currentOptions.length > 0 ? currentOptions.map(opt => (
        <span key={opt} className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-sm font-medium text-zinc-200 flex items-center gap-1 group/badge hover:border-zinc-500 transition-colors">
          {opt}
          <button 
            disabled={isSaving}
            onClick={(e) => handleRemoveOption(e, opt)} 
            className="p-0.5 ml-1 rounded-full hover:bg-zinc-700 text-zinc-500 hover:text-rose-400 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )) : (
        <span className="font-semibold text-zinc-500">Uncontacted (Click to Add)</span>
      )}
    </div>
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
