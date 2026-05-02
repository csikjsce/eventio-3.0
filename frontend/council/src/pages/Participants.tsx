import { useState, useContext, useMemo } from 'react';
import Select from '../components/Select';
import EventsDataContext from '../contexts/EventsDataContext';
import { Search, Download, Users, Filter, ArrowLeft, ChevronRight, CalendarDays, MapPin } from 'lucide-react';
import { DocumentDownload } from 'iconsax-react';

// ── Mock participant data ──────────────────────────────────────────────────────
interface Participant {
  id: number;
  name: string;
  roll: string;
  branch: string;
  year: string;
  gender: string;
  email: string;
  phone: string;
  attended: boolean;
}

const MOCK_PARTICIPANTS: Record<number, Participant[]> = {
  1: [
    { id: 1, name: 'Aanya Sharma', roll: '21COMP001', branch: 'COMP', year: 'SY', gender: 'FEMALE', email: 'aanya@somaiya.edu', phone: '9876543210', attended: true },
    { id: 2, name: 'Rohan Mehta', roll: '21COMP002', branch: 'COMP', year: 'SY', gender: 'MALE', email: 'rohan@somaiya.edu', phone: '9876543211', attended: true },
    { id: 3, name: 'Priya Nair', roll: '21IT001', branch: 'IT', year: 'TY', gender: 'FEMALE', email: 'priya@somaiya.edu', phone: '9876543212', attended: false },
    { id: 4, name: 'Dev Patel', roll: '22AIDS001', branch: 'AIDS', year: 'FY', gender: 'MALE', email: 'dev@somaiya.edu', phone: '9876543213', attended: true },
    { id: 5, name: 'Sneha Kulkarni', roll: '21EXTC001', branch: 'EXTC', year: 'TY', gender: 'FEMALE', email: 'sneha@somaiya.edu', phone: '9876543214', attended: false },
    { id: 6, name: 'Arjun Singh', roll: '20COMP001', branch: 'COMP', year: 'LY', gender: 'MALE', email: 'arjun@somaiya.edu', phone: '9876543215', attended: true },
    { id: 7, name: 'Meera Joshi', roll: '21MECH001', branch: 'Mech', year: 'SY', gender: 'FEMALE', email: 'meera@somaiya.edu', phone: '9876543216', attended: true },
    { id: 8, name: 'Karan Verma', roll: '22IT001', branch: 'IT', year: 'FY', gender: 'MALE', email: 'karan@somaiya.edu', phone: '9876543217', attended: false },
    { id: 9, name: 'Isha Desai', roll: '21AIDS001', branch: 'AIDS', year: 'SY', gender: 'FEMALE', email: 'isha@somaiya.edu', phone: '9876543218', attended: true },
    { id: 10, name: 'Vivek Rao', roll: '21EXTC002', branch: 'EXTC', year: 'TY', gender: 'MALE', email: 'vivek@somaiya.edu', phone: '9876543219', attended: true },
    { id: 11, name: 'Tanvi Patil', roll: '20IT001', branch: 'IT', year: 'LY', gender: 'FEMALE', email: 'tanvi@somaiya.edu', phone: '9876543220', attended: false },
    { id: 12, name: 'Nikhil Gupta', roll: '22COMP001', branch: 'COMP', year: 'FY', gender: 'MALE', email: 'nikhil@somaiya.edu', phone: '9876543221', attended: true },
  ],
  2: [
    { id: 13, name: 'Sakshi Tiwari', roll: '21COMP003', branch: 'COMP', year: 'SY', gender: 'FEMALE', email: 'sakshi@somaiya.edu', phone: '9876543222', attended: true },
    { id: 14, name: 'Harsh Modi', roll: '21IT002', branch: 'IT', year: 'TY', gender: 'MALE', email: 'harsh@somaiya.edu', phone: '9876543223', attended: true },
    { id: 15, name: 'Pooja Iyer', roll: '20EXTC001', branch: 'EXTC', year: 'LY', gender: 'FEMALE', email: 'pooja@somaiya.edu', phone: '9876543224', attended: false },
    { id: 16, name: 'Raj Thakur', roll: '22AIDS002', branch: 'AIDS', year: 'FY', gender: 'MALE', email: 'raj@somaiya.edu', phone: '9876543225', attended: true },
    { id: 17, name: 'Nisha Bhat', roll: '21MECH002', branch: 'Mech', year: 'SY', gender: 'FEMALE', email: 'nisha@somaiya.edu', phone: '9876543226', attended: true },
  ],
};

function exportToCSV(participants: Participant[], eventName: string) {
  const rows = [
    ['Name', 'Roll No', 'Branch', 'Year', 'Gender', 'Email', 'Phone', 'Attended'],
    ...participants.map(p => [p.name, p.roll, p.branch, p.year, p.gender, p.email, p.phone, p.attended ? 'Yes' : 'No']),
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${eventName}-participants.csv`;
  document.body.appendChild(a); a.click();
  a.remove(); URL.revokeObjectURL(url);
}

export default function Participants() {
  const { eventsList } = useContext(EventsDataContext);
  const allEvents = Object.values(eventsList).flat();
  const completedOrOngoing = allEvents.filter(e =>
    ['COMPLETED', 'ONGOING', 'REGISTRATION_OPEN'].includes(e.state)
  );

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [attendedFilter, setAttendedFilter] = useState<'all' | 'attended' | 'absent'>('all');

  const selectedEvent = allEvents.find(e => e.id === selectedEventId);
  const rawParticipants: Participant[] = selectedEventId != null
    ? (MOCK_PARTICIPANTS[selectedEventId] ?? MOCK_PARTICIPANTS[1] ?? [])
    : [];

  const filtered = useMemo(() => rawParticipants.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.roll.toLowerCase().includes(search.toLowerCase())) return false;
    if (branchFilter && p.branch !== branchFilter) return false;
    if (yearFilter && p.year !== yearFilter) return false;
    if (genderFilter && p.gender !== genderFilter) return false;
    if (attendedFilter === 'attended' && !p.attended) return false;
    if (attendedFilter === 'absent' && p.attended) return false;
    return true;
  }), [rawParticipants, search, branchFilter, yearFilter, genderFilter, attendedFilter]);

  const branches = [...new Set(rawParticipants.map(p => p.branch))];
  const attendedCount = rawParticipants.filter(p => p.attended).length;
  const showUpRate = rawParticipants.length > 0
    ? Math.round((attendedCount / rawParticipants.length) * 100) : 0;

  const STATE_BADGE: Record<string, string> = {
    COMPLETED:         'bg-zinc-800 text-zinc-400',
    ONGOING:           'bg-emerald-500/10 text-emerald-400',
    REGISTRATION_OPEN: 'bg-blue-500/10 text-blue-400',
    UPCOMING:          'bg-amber-500/10 text-amber-400',
    DRAFT:             'bg-zinc-800 text-zinc-600',
  };

  // ── Event picker view ────────────────────────────────────────────────────────
  if (selectedEventId === null) {
    return (
      <div className="min-h-screen bg-[#121214] px-8 py-8">
        <div className="mb-8">
          <h1 className="text-white font-marcellus text-2xl mb-1">Participants</h1>
          <p className="text-zinc-500 text-sm font-fira">Select an event to browse its participants.</p>
        </div>

        {completedOrOngoing.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Users size={40} className="text-zinc-700 mb-4" />
            <p className="text-zinc-400 font-fira text-sm">No events with participants yet.</p>
            <p className="text-zinc-600 font-fira text-xs mt-1">Participants appear once registration opens for an event.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedOrOngoing.map(ev => {
              const evParticipants = MOCK_PARTICIPANTS[ev.id] ?? MOCK_PARTICIPANTS[1] ?? [];
              const attended = evParticipants.filter(p => p.attended).length;
              const date = ev.dates?.[0] ? new Date(ev.dates[0]).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => { setSelectedEventId(ev.id); setSearch(''); setBranchFilter(''); setYearFilter(''); setGenderFilter(''); setAttendedFilter('all'); }}
                  className="bg-[#1c1c1e] border border-white/[0.06] hover:border-red-600/30 rounded-xl p-5 text-left transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-fira uppercase tracking-widest px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">{ev.event_type}</span>
                    <span className={`text-[10px] font-fira uppercase tracking-widest px-2 py-0.5 rounded-md ${STATE_BADGE[ev.state] ?? 'bg-zinc-800 text-zinc-500'}`}>{ev.state.replace(/_/g,' ')}</span>
                  </div>
                  <h3 className="text-white font-fira font-semibold text-sm leading-snug mb-1 group-hover:text-red-400 transition-colors">{ev.name}</h3>
                  <p className="text-zinc-600 text-xs font-fira mb-4 line-clamp-1">{ev.tag_line}</p>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-fira">
                      <CalendarDays size={11} />{date}
                    </div>
                    {ev.venue && (
                      <div className="flex items-center gap-2 text-zinc-500 text-xs font-fira">
                        <MapPin size={11} />{ev.venue}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-fira">
                      <Users size={12} />
                      <span className="text-white font-bold">{evParticipants.length}</span> registered
                      <span className="text-zinc-700 mx-1">·</span>
                      <span className="text-emerald-400 font-bold">{attended}</span> attended
                    </div>
                    <ChevronRight size={14} className="text-zinc-600 group-hover:text-red-400 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Detail view ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#121214] px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setSelectedEventId(null)}
            className="w-8 h-8 rounded-lg bg-[#1c1c1e] border border-white/[0.06] hover:border-white/15 flex items-center justify-center text-zinc-400 hover:text-white transition-all">
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="text-white font-marcellus text-2xl mb-0.5">{selectedEvent?.name}</h1>
            <p className="text-zinc-500 text-sm font-fira">Participants</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => exportToCSV(filtered, selectedEvent!.name)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1c1c1e] border border-white/[0.06] hover:border-white/15 text-zinc-400 hover:text-white text-xs font-fira rounded-lg transition-all"
        >
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Registered', value: rawParticipants.length },
          { label: 'Attended', value: attendedCount },
          { label: 'Show-up Rate', value: `${showUpRate}%` },
          { label: 'Branches', value: branches.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-4">
            <p className="text-zinc-500 text-[11px] font-fira uppercase tracking-widest mb-1">{label}</p>
            <p className="text-white text-2xl font-fira font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or roll…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[#1c1c1e] border border-white/[0.06] focus:border-red-600/40 rounded-lg pl-8 pr-3 py-2 text-sm font-fira text-white placeholder-zinc-600 outline-none transition-colors w-60"
          />
        </div>
        {([
          { value: branchFilter, onChange: setBranchFilter, options: branches, placeholder: 'Branch: All' },
          { value: yearFilter, onChange: setYearFilter, options: ['FY','SY','TY','LY'], placeholder: 'Year: All' },
          { value: genderFilter, onChange: setGenderFilter, options: ['MALE','FEMALE'], placeholder: 'Gender: All' },
        ] as const).map(({ value, onChange, options, placeholder }) => (
          <Select
            key={placeholder}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            options={(options as readonly string[]).map(o => ({ value: o, label: o }))}
            size="sm"
          />
        ))}
        <div className="flex gap-1 bg-[#1c1c1e] border border-white/[0.06] rounded-lg p-1">
          {(['all','attended','absent'] as const).map(v => (
            <button key={v} type="button" onClick={() => setAttendedFilter(v)}
              className={`px-3 py-1 text-xs font-fira rounded-md transition-all capitalize ${attendedFilter === v ? 'bg-red-600/80 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {v}
            </button>
          ))}
        </div>
        <span className="text-zinc-600 text-xs font-fira ml-auto">{filtered.length} participants</span>
      </div>

      {/* Table */}
      <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {['Name','Roll No','Branch','Year','Gender','Email','Attendance'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-zinc-500 text-[11px] font-fira font-normal uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
                <th className="px-5 py-3 text-right">
                  <DocumentDownload size={14} className="text-zinc-600 ml-auto" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-zinc-600 font-fira text-sm">No participants match your filters.</td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors last:border-0">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center text-red-400 text-[11px] font-bold font-fira shrink-0">
                        {p.name[0]}
                      </div>
                      <span className="text-white text-sm font-fira font-semibold">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-400 text-sm font-fira">{p.roll}</td>
                  <td className="px-5 py-3.5">
                    <span className="bg-zinc-800 text-zinc-300 text-[11px] font-fira px-2 py-0.5 rounded-md">{p.branch}</span>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-400 text-sm font-fira">{p.year}</td>
                  <td className="px-5 py-3.5 text-zinc-400 text-sm font-fira">{p.gender}</td>
                  <td className="px-5 py-3.5 text-zinc-500 text-xs font-fira">{p.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-fira font-semibold px-2 py-0.5 rounded-full ${
                      p.attended ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {p.attended ? 'Present' : 'Absent'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => exportToCSV([p], p.name)}
                      className="text-zinc-600 hover:text-zinc-300 transition-colors"
                      title="Download row"
                    >
                      <DocumentDownload size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
