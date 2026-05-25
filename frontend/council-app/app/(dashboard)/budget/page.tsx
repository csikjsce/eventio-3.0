"use client";
import { useState, useEffect, useCallback } from "react";
import { useData } from "@/contexts/DataContext";
import { fetchBudget, addBudgetItem, deleteBudgetItem, type BudgetEntry } from "@/lib/api";
import { Wallet, Plus, TrendingUp, TrendingDown, IndianRupee, Trash2, ChevronDown, X, Download } from "lucide-react";

function exportBudgetCSV(items: BudgetEntry[], eventName: string) {
  const rows = [
    ["Date", "Category", "Description", "Type", "Amount (₹)"],
    ...items.map(i => [i.date, i.category, i.description, i.type, i.amount.toString()]),
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
    download: `${eventName.replace(/\s+/g, "-")}-budget.csv`,
  });
  document.body.appendChild(a); a.click(); a.remove();
}

const INCOME_CATEGORIES  = ["Registration", "Sponsorship", "Grants", "Ticket Sales", "Other"];
const EXPENSE_CATEGORIES = ["Venue", "Marketing", "Catering", "Equipment", "Prizes", "Logistics", "Printing", "Miscellaneous"];

const CAT_COLORS: Record<string, string> = {
  Venue: "#93c5fd", Marketing: "#fca5a5", Catering: "#6ee7b7", Equipment: "#fcd34d",
  Prizes: "#c4b5fd", Logistics: "#fdba74", Miscellaneous: "#f9a8d4", Printing: "#a5f3fc",
  Registration: "#86efac", Sponsorship: "#d9f99d", Grants: "#fde68a", "Ticket Sales": "#bfdbfe", Other: "#e5e7eb",
};

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function BudgetPage() {
  const { events } = useData();
  const [eventId, setEventId] = useState<number | null>(null);
  const [items, setItems]   = useState<BudgetEntry[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, net: 0 });
  const [loadingData, setLoadingData] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm] = useState({
    description: "", amount: "", category: "Miscellaneous",
    type: "EXPENSE" as "INCOME" | "EXPENSE",
  });

  const selectedEvent = events.find(e => e.id === eventId);

  // Set first event on load
  useEffect(() => {
    if (events.length && eventId === null) setEventId(events[0].id);
  }, [events, eventId]);

  const load = useCallback(async () => {
    if (!eventId) return;
    setLoadingData(true);
    try {
      const data = await fetchBudget(eventId);
      setItems(data.items);
      setSummary(data.summary);
    } catch {
      setItems([]); setSummary({ income: 0, expense: 0, net: 0 });
    } finally {
      setLoadingData(false);
    }
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  async function addItem() {
    if (!form.description.trim() || !form.amount || !eventId) return;
    setSaving(true);
    try {
      const newItem = await addBudgetItem({
        event_id: eventId,
        category: form.category,
        description: form.description.trim(),
        amount: Number(form.amount),
        type: form.type,
        date: new Date().toISOString().slice(0, 10),
      });
      setItems(prev => [newItem, ...prev]);
      setSummary(prev => ({
        income:  form.type === "INCOME"  ? prev.income  + Number(form.amount) : prev.income,
        expense: form.type === "EXPENSE" ? prev.expense + Number(form.amount) : prev.expense,
        net:     form.type === "INCOME"  ? prev.net + Number(form.amount) : prev.net - Number(form.amount),
      }));
      setForm({ description: "", amount: "", category: "Miscellaneous", type: "EXPENSE" });
      setShowAdd(false);
    } catch {
      // silent
    } finally { setSaving(false); }
  }

  async function removeItem(id: number) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setItems(prev => prev.filter(i => i.id !== id));
    setSummary(prev => ({
      income:  item.type === "INCOME"  ? prev.income  - item.amount : prev.income,
      expense: item.type === "EXPENSE" ? prev.expense - item.amount : prev.expense,
      net:     item.type === "INCOME"  ? prev.net - item.amount : prev.net + item.amount,
    }));
    try { await deleteBudgetItem(id); } catch { load(); }
  }

  const catTotals = [...new Set(items.filter(i => i.type === "EXPENSE").map(i => i.category))]
    .map(cat => ({ cat, value: items.filter(i => i.type === "EXPENSE" && i.category === cat).reduce((s, i) => s + i.amount, 0) }))
    .filter(c => c.value > 0)
    .sort((a, b) => b.value - a.value);

  const categories = form.type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-tx font-marcellus text-2xl mb-1">Budget</h1>
          <p className="text-muted-tx text-sm font-fira">Track income and expenses per event.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => exportBudgetCSV(items, selectedEvent?.name ?? "event")}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 bg-surface border border-border-c hover:border-red-500/30 text-muted-tx hover:text-tx text-sm font-fira rounded-lg transition-all">
            <Download size={14} /> <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button type="button" onClick={() => setShowAdd(true)} disabled={!eventId}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-fira font-semibold rounded-lg transition-colors">
            <Plus size={15} /> <span className="hidden sm:inline">Add Entry</span><span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Event picker */}
      <div className="relative w-full sm:w-64 mb-6 sm:mb-8">
        <select value={eventId ?? ""} onChange={e => setEventId(Number(e.target.value))}
          className="w-full bg-surface border border-border-c focus:border-red-500/40 rounded-xl px-4 py-2.5 text-sm font-fira text-tx outline-none appearance-none pr-8 transition-colors">
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle-tx pointer-events-none" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
        <div className="bg-surface border border-border-c rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-subtle-tx text-[11px] font-fira uppercase tracking-widest">Total Income</p>
            <TrendingUp size={15} className="text-emerald-500" />
          </div>
          <p className="text-emerald-500 text-3xl font-fira font-bold">{fmt(summary.income)}</p>
        </div>
        <div className="bg-surface border border-border-c rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-subtle-tx text-[11px] font-fira uppercase tracking-widest">Total Expenses</p>
            <TrendingDown size={15} className="text-red-500" />
          </div>
          <p className="text-red-500 text-3xl font-fira font-bold">{fmt(summary.expense)}</p>
        </div>
        <div className={`border rounded-xl p-5 ${summary.net >= 0 ? "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20" : "bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20"}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-subtle-tx text-[11px] font-fira uppercase tracking-widest">Net Balance</p>
            <IndianRupee size={15} className={summary.net >= 0 ? "text-emerald-500" : "text-red-500"} />
          </div>
          <p className={`text-3xl font-fira font-bold ${summary.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{fmt(Math.abs(summary.net))}</p>
          <p className="text-subtle-tx text-xs font-fira mt-1">{summary.net >= 0 ? "surplus" : "deficit"}</p>
        </div>
      </div>

      {loadingData ? (
        <div className="animate-pulse space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-surface rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {catTotals.length > 0 && (
            <div className="bg-surface border border-border-c rounded-xl p-5">
              <h3 className="text-tx font-fira font-semibold text-sm mb-4">Expense Breakdown</h3>
              <div className="space-y-3">
                {catTotals.map(({ cat, value }) => {
                  const pct = summary.expense > 0 ? Math.round(value / summary.expense * 100) : 0;
                  const color = CAT_COLORS[cat] ?? "#a1a1aa";
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                          <span className="text-muted-tx text-xs font-fira">{cat}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-subtle-tx text-[11px] font-fira">{pct}%</span>
                          <span className="text-tx text-xs font-fira font-bold">{fmt(value)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className={`${catTotals.length > 0 ? "lg:col-span-2" : "lg:col-span-3"} bg-surface border border-border-c rounded-xl overflow-hidden`}>
            <div className="px-5 py-4 border-b border-border-c">
              <h3 className="text-tx font-fira font-semibold text-sm">Transaction Ledger</h3>
            </div>
            {items.length === 0 ? (
              <div className="py-16 flex flex-col items-center text-center">
                <Wallet size={36} className="text-subtle-tx mb-3" />
                <p className="text-muted-tx text-sm font-fira">No entries yet for this event.</p>
                <button type="button" onClick={() => setShowAdd(true)} className="text-red-500 text-sm font-fira hover:underline mt-2">Add first entry →</button>
              </div>
            ) : (
              <div className="divide-y divide-border-c">
                {[...items].sort((a, b) => b.date.localeCompare(a.date)).map(item => {
                  const color = CAT_COLORS[item.category] ?? "#a1a1aa";
                  return (
                    <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface2 transition-colors group">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: color + "25" }}>
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-tx text-sm font-fira font-semibold truncate">{item.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-subtle-tx text-[11px] font-fira">{item.category}</span>
                          <span className="text-subtle-tx text-[11px]">·</span>
                          <span className="text-subtle-tx text-[11px] font-fira">{new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        </div>
                      </div>
                      <p className={`text-sm font-fira font-bold shrink-0 ${item.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                        {item.type === "INCOME" ? "+" : "−"}{fmt(item.amount)}
                      </p>
                      <button type="button" onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 text-subtle-tx hover:text-red-500 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add entry modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-surface border border-border-c rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-c">
              <h2 className="text-tx font-fira font-semibold text-base">Add Budget Entry</h2>
              <button type="button" onClick={() => setShowAdd(false)} className="text-muted-tx hover:text-tx transition-colors"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex gap-1 bg-surface2 p-1 rounded-xl border border-border-c">
                {(["INCOME", "EXPENSE"] as const).map(t => (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t, category: t === "INCOME" ? "Registration" : "Miscellaneous" }))}
                    className={`flex-1 py-2 text-sm font-fira font-semibold rounded-lg transition-all ${form.type === t ? (t === "INCOME" ? "bg-emerald-500 text-white" : "bg-red-500 text-white") : "text-muted-tx hover:text-tx"}`}>
                    {t === "INCOME" ? "+ Income" : "− Expense"}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-muted-tx text-xs font-fira uppercase tracking-wider mb-1.5">Description</label>
                <input type="text" value={form.description} placeholder="e.g. Auditorium Booking"
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-surface2 border border-border-c focus:border-red-500/40 rounded-lg px-3 py-2.5 text-sm font-fira text-tx placeholder-subtle-tx outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-muted-tx text-xs font-fira uppercase tracking-wider mb-1.5">Amount (₹)</label>
                <input type="number" value={form.amount} placeholder="e.g. 15000" min="0"
                  onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full bg-surface2 border border-border-c focus:border-red-500/40 rounded-lg px-3 py-2.5 text-sm font-fira text-tx placeholder-subtle-tx outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-muted-tx text-xs font-fira uppercase tracking-wider mb-1.5">Category</label>
                <div className="relative">
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-surface2 border border-border-c rounded-lg px-3 py-2.5 text-sm font-fira text-tx outline-none appearance-none pr-8 focus:border-red-500/40 transition-colors">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle-tx pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-c">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm font-fira text-muted-tx border border-border-c hover:border-red-500/20 rounded-lg transition-all">Cancel</button>
              <button type="button" onClick={addItem} disabled={!form.description.trim() || !form.amount || saving}
                className={`flex items-center gap-2 px-5 py-2 text-sm font-fira font-semibold rounded-lg transition-all ${!form.description.trim() || !form.amount || saving ? "bg-surface2 text-muted-tx cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"}`}>
                <Plus size={13} /> {saving ? "Saving…" : "Add Entry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
