import { useState, useContext, useMemo } from 'react';
import EventsDataContext from '../contexts/EventsDataContext';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Download } from 'lucide-react';
import Select from '../components/Select';

type EntryType = 'income' | 'expense';

interface BudgetEntry {
  id: number;
  type: EntryType;
  category: string;
  description: string;
  amount: number;
  date: string;
}

const MOCK_BUDGETS: Record<number, BudgetEntry[]> = {
  1: [
    { id: 1, type: 'income',  category: 'Registration', description: 'Participant registration fees', amount: 42800, date: '2026-04-15' },
    { id: 2, type: 'income',  category: 'Sponsorship',  description: 'TechCorp sponsorship',         amount: 25000, date: '2026-04-10' },
    { id: 3, type: 'expense', category: 'Venue',        description: 'Auditorium booking',            amount: 15000, date: '2026-04-16' },
    { id: 4, type: 'expense', category: 'Prizes',       description: '1st, 2nd, 3rd prizes',          amount: 20000, date: '2026-04-16' },
    { id: 5, type: 'expense', category: 'Catering',     description: 'Lunch for participants',        amount: 12500, date: '2026-04-17' },
    { id: 6, type: 'expense', category: 'Marketing',    description: 'Posters and digital ads',       amount: 3500,  date: '2026-04-12' },
  ],
};

const CATEGORIES_INCOME  = ['Registration', 'Sponsorship', 'Grants', 'Ticket Sales', 'Other'];
const CATEGORIES_EXPENSE = ['Venue', 'Prizes', 'Catering', 'Marketing', 'Equipment', 'Travel', 'Printing', 'Other'];

function exportCSV(entries: BudgetEntry[], eventName: string) {
  const rows = [
    ['Type', 'Category', 'Description', 'Amount (₹)', 'Date'],
    ...entries.map(e => [e.type, e.category, e.description, e.amount, e.date]),
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${eventName}-budget.csv`;
  document.body.appendChild(a); a.click();
  a.remove(); URL.revokeObjectURL(url);
}

export default function Budget() {
  const { eventsList } = useContext(EventsDataContext);
  const allEvents = Object.values(eventsList).flat();

  const [selectedEventId, setSelectedEventId] = useState<number>(allEvents[0]?.id ?? 1);
  const [budgets, setBudgets] = useState<Record<number, BudgetEntry[]>>(MOCK_BUDGETS);

  // New entry form state
  const [form, setForm] = useState({ type: 'expense' as EntryType, category: '', description: '', amount: '', date: new Date().toISOString().slice(0, 10) });
  const [formOpen, setFormOpen] = useState(false);

  const selectedEvent = allEvents.find(e => e.id === selectedEventId);
  const entries: BudgetEntry[] = budgets[selectedEventId] ?? [];

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    const inc = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const exp = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
    return { totalIncome: inc, totalExpense: exp, balance: inc - exp };
  }, [entries]);

  const categoryBreakdown = useMemo(() => {
    const agg: Record<string, { income: number; expense: number }> = {};
    entries.forEach(e => {
      if (!agg[e.category]) agg[e.category] = { income: 0, expense: 0 };
      agg[e.category][e.type] += e.amount;
    });
    return Object.entries(agg).map(([cat, v]) => ({ cat, ...v })).sort((a, b) => (b.income + b.expense) - (a.income + a.expense));
  }, [entries]);

  function addEntry() {
    if (!form.category || !form.description || !form.amount || !form.date) return;
    const newEntry: BudgetEntry = {
      id: Date.now(),
      type: form.type,
      category: form.category,
      description: form.description,
      amount: Number(form.amount),
      date: form.date,
    };
    setBudgets(prev => ({ ...prev, [selectedEventId]: [...(prev[selectedEventId] ?? []), newEntry] }));
    setForm({ type: 'expense', category: '', description: '', amount: '', date: new Date().toISOString().slice(0, 10) });
    setFormOpen(false);
  }

  function removeEntry(id: number) {
    setBudgets(prev => ({ ...prev, [selectedEventId]: (prev[selectedEventId] ?? []).filter(e => e.id !== id) }));
  }

  const inp = 'bg-[#252527] border border-white/[0.06] focus:border-red-600/40 rounded-lg px-3 py-2 text-sm font-fira text-white placeholder-zinc-600 outline-none transition-colors';

  return (
    <div className="min-h-screen bg-[#121214] px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-white font-marcellus text-2xl mb-1">Budget Tracker</h1>
          <p className="text-zinc-500 text-sm font-fira">Track income and expenses for each event.</p>
        </div>
        {selectedEvent && (
          <button type="button" onClick={() => exportCSV(entries, selectedEvent.name)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1c1c1e] border border-white/[0.06] hover:border-white/15 text-zinc-400 hover:text-white text-xs font-fira rounded-lg transition-all">
            <Download size={13} /> Export
          </button>
        )}
      </div>

      {/* Event selector */}
      <div className="mb-6 w-72">
        <Select
          value={selectedEventId}
          onChange={v => setSelectedEventId(Number(v))}
          options={allEvents.map(ev => ({ value: ev.id, label: ev.name }))}
        />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Income',  value: totalIncome,  icon: TrendingUp,   color: 'text-emerald-400' },
          { label: 'Total Expense', value: totalExpense, icon: TrendingDown, color: 'text-red-400' },
          { label: 'Net Balance',   value: balance,      icon: DollarSign,   color: balance >= 0 ? 'text-emerald-400' : 'text-red-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-zinc-500 text-[11px] font-fira uppercase tracking-widest">{label}</p>
              <div className="w-8 h-8 rounded-xl bg-zinc-800/60 flex items-center justify-center">
                <Icon size={14} className={color} />
              </div>
            </div>
            <p className={`text-2xl font-fira font-bold ${color}`}>
              ₹{Math.abs(value).toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entries list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-zinc-400 text-xs font-fira uppercase tracking-widest">Transactions</h2>
            <button type="button" onClick={() => setFormOpen(o => !o)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-fira transition-all ${
                formOpen ? 'bg-zinc-800 text-zinc-300' : 'bg-red-600 text-white hover:bg-red-700'
              }`}>
              <Plus size={13} /> {formOpen ? 'Cancel' : 'Add Entry'}
            </button>
          </div>

          {/* Add form */}
          {formOpen && (
            <div className="bg-[#1c1c1e] border border-red-600/20 rounded-xl p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-500 text-[11px] font-fira uppercase tracking-widest block mb-1.5">Type</label>
                  <div className="flex gap-2">
                    {(['income','expense'] as const).map(t => (
                      <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t, category: '' }))}
                        className={`flex-1 py-2 rounded-lg text-xs font-fira border capitalize transition-all ${
                          form.type === t
                            ? t === 'income' ? 'bg-emerald-600/20 border-emerald-600/40 text-emerald-400' : 'bg-red-600/20 border-red-600/40 text-red-400'
                            : 'bg-[#252527] border-white/[0.06] text-zinc-500'
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-zinc-500 text-[11px] font-fira uppercase tracking-widest block mb-1.5">Category</label>
                  <Select
                    value={form.category}
                    onChange={v => setForm(f => ({ ...f, category: v }))}
                    placeholder="Select…"
                    options={(form.type === 'income' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE).map(c => ({ value: c, label: c }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-zinc-500 text-[11px] font-fira uppercase tracking-widest block mb-1.5">Description</label>
                <input type="text" placeholder="What is this for?" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className={`w-full ${inp}`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-500 text-[11px] font-fira uppercase tracking-widest block mb-1.5">Amount (₹)</label>
                  <input type="number" placeholder="0" value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className={`w-full ${inp}`} />
                </div>
                <div>
                  <label className="text-zinc-500 text-[11px] font-fira uppercase tracking-widest block mb-1.5">Date</label>
                  <input type="date" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className={`w-full ${inp}`} />
                </div>
              </div>
              <button type="button" onClick={addEntry}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-fira rounded-lg transition-colors">
                Add Entry
              </button>
            </div>
          )}

          <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl overflow-hidden">
            {entries.length === 0 ? (
              <div className="py-16 text-center text-zinc-600 font-fira text-sm">No entries yet. Add income or expenses above.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {['Date','Category','Description','Amount'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-zinc-500 text-[11px] font-fira font-normal uppercase tracking-wide">{h}</th>
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {[...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(e => (
                    <tr key={e.id} className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors last:border-0 group">
                      <td className="px-5 py-3.5 text-zinc-500 text-sm font-fira whitespace-nowrap">{new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                      <td className="px-5 py-3.5">
                        <span className="bg-zinc-800 text-zinc-300 text-[11px] font-fira px-2 py-0.5 rounded-md">{e.category}</span>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-300 text-sm font-fira">{e.description}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-sm font-fira font-bold ${e.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {e.type === 'income' ? '+' : '-'}₹{e.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button type="button" onClick={() => removeEntry(e.id)}
                          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Category breakdown */}
        <div>
          <h2 className="text-zinc-400 text-xs font-fira uppercase tracking-widest mb-3">Category Breakdown</h2>
          {categoryBreakdown.length === 0 ? (
            <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-8 text-center text-zinc-700 font-fira text-sm">No data.</div>
          ) : (
            <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5 space-y-4">
              {categoryBreakdown.map(({ cat, income, expense }) => {
                const total = income + expense;
                const maxTotal = Math.max(...categoryBreakdown.map(b => b.income + b.expense), 1);
                const pct = (total / maxTotal) * 100;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-zinc-300 text-xs font-fira">{cat}</span>
                      <span className="text-zinc-500 text-xs font-fira">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden flex">
                      {income > 0 && (
                        <div className="h-full bg-emerald-600/70 rounded-l-full" style={{ width: `${(income / total) * pct}%` }} />
                      )}
                      {expense > 0 && (
                        <div className="h-full bg-red-600/70 rounded-r-full" style={{ width: `${(expense / total) * pct}%` }} />
                      )}
                    </div>
                    <div className="flex justify-between mt-0.5">
                      {income > 0 && <span className="text-emerald-600 text-[10px] font-fira">+{income.toLocaleString('en-IN')}</span>}
                      {expense > 0 && <span className="text-red-600 text-[10px] font-fira ml-auto">-{expense.toLocaleString('en-IN')}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
