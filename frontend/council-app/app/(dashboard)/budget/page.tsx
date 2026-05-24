"use client";
import { useState } from "react";
import { MOCK_EVENTS } from "@/lib/dummy-data";
import { Wallet, Plus, TrendingUp, TrendingDown, IndianRupee, Trash2, ChevronDown, X, Download } from "lucide-react";

function exportBudgetCSV(items: BudgetItem[], eventName: string) {
  const rows = [
    ["Date", "Category", "Description", "Type", "Amount (₹)"],
    ...items.map(i => [i.date, i.category, i.label, i.type, i.amount.toString()]),
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
    download: `${eventName.replace(/\s+/g, "-")}-budget.csv`,
  });
  document.body.appendChild(a); a.click(); a.remove();
}

type Category = "Venue" | "Marketing" | "Catering" | "Equipment" | "Prizes" | "Logistics" | "Miscellaneous";
const CATEGORIES: Category[] = ["Venue","Marketing","Catering","Equipment","Prizes","Logistics","Miscellaneous"];

const CAT_COLOR: Record<Category, string> = {
  Venue:         "#93c5fd",
  Marketing:     "#fca5a5",
  Catering:      "#6ee7b7",
  Equipment:     "#fcd34d",
  Prizes:        "#c4b5fd",
  Logistics:     "#fdba74",
  Miscellaneous: "#f9a8d4",
};

interface BudgetItem {
  id: number; eventId: number; label: string; amount: number;
  category: Category; type: "INCOME" | "EXPENSE"; date: string; note?: string;
}

const INITIAL_ITEMS: BudgetItem[] = [
  { id: 1,  eventId: 1, label: "Registration Fees",       amount: 0,     category: "Miscellaneous", type: "INCOME",  date: "2026-05-15" },
  { id: 2,  eventId: 1, label: "Sponsorship — TechCorp",  amount: 50000, category: "Miscellaneous", type: "INCOME",  date: "2026-05-18" },
  { id: 3,  eventId: 1, label: "Auditorium Booking",      amount: 15000, category: "Venue",         type: "EXPENSE", date: "2026-05-20" },
  { id: 4,  eventId: 1, label: "Social Media Promotion",  amount: 8000,  category: "Marketing",     type: "EXPENSE", date: "2026-05-21" },
  { id: 5,  eventId: 1, label: "Prize Pool",              amount: 20000, category: "Prizes",        type: "EXPENSE", date: "2026-05-22" },
  { id: 6,  eventId: 1, label: "Refreshments",            amount: 5000,  category: "Catering",      type: "EXPENSE", date: "2026-05-22" },
  { id: 7,  eventId: 2, label: "Registration Fees",       amount: 8000,  category: "Miscellaneous", type: "INCOME",  date: "2026-07-01" },
  { id: 8,  eventId: 2, label: "Workshop Materials",      amount: 3000,  category: "Equipment",     type: "EXPENSE", date: "2026-07-02" },
  { id: 9,  eventId: 2, label: "Projector Rental",        amount: 2500,  category: "Equipment",     type: "EXPENSE", date: "2026-07-02" },
  { id: 10, eventId: 2, label: "Banners & Posters",       amount: 1200,  category: "Marketing",     type: "EXPENSE", date: "2026-07-03" },
];

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function BudgetPage() {
  const [items, setItems]   = useState<BudgetItem[]>(INITIAL_ITEMS);
  const [eventId, setEventId] = useState<number>(MOCK_EVENTS[0].id);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]     = useState({ label: "", amount: "", category: "Miscellaneous" as Category, type: "EXPENSE" as "INCOME"|"EXPENSE", note: "" });

  const evItems   = items.filter(i => i.eventId === eventId);
  const income    = evItems.filter(i => i.type === "INCOME").reduce((s, i) => s + i.amount, 0);
  const expenses  = evItems.filter(i => i.type === "EXPENSE").reduce((s, i) => s + i.amount, 0);
  const balance   = income - expenses;

  const catTotals = CATEGORIES.map(cat => ({
    cat, value: evItems.filter(i => i.type === "EXPENSE" && i.category === cat).reduce((s, i) => s + i.amount, 0),
  })).filter(c => c.value > 0);

  function addItem() {
    if (!form.label.trim() || !form.amount) return;
    setItems(prev => [...prev, {
      id: Date.now(), eventId, label: form.label.trim(), amount: Number(form.amount),
      category: form.category, type: form.type, date: new Date().toISOString().slice(0,10), note: form.note || undefined,
    }]);
    setForm({ label: "", amount: "", category: "Miscellaneous", type: "EXPENSE", note: "" });
    setShowAdd(false);
  }

  function removeItem(id: number) { setItems(p => p.filter(i => i.id !== id)); }

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-tx font-marcellus text-2xl mb-1">Budget</h1>
          <p className="text-muted-tx text-sm font-fira">Track income and expenses per event.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => {
            const ev = MOCK_EVENTS.find(e => e.id === eventId);
            exportBudgetCSV(evItems, ev?.name ?? "event");
          }}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 bg-surface border border-border-c hover:border-red-500/30 text-muted-tx hover:text-tx text-sm font-fira rounded-lg transition-all">
            <Download size={14} /> <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button type="button" onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-fira font-semibold rounded-lg transition-colors">
            <Plus size={15} /> <span className="hidden sm:inline">Add Entry</span><span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Event picker */}
      <div className="relative w-full sm:w-64 mb-6 sm:mb-8">
        <select value={eventId} onChange={e => setEventId(Number(e.target.value))}
          className="w-full bg-surface border border-border-c focus:border-red-500/40 rounded-xl px-4 py-2.5 text-sm font-fira text-tx outline-none appearance-none pr-8 transition-colors">
          {MOCK_EVENTS.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
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
          <p className="text-emerald-500 text-3xl font-fira font-bold">{fmt(income)}</p>
        </div>
        <div className="bg-surface border border-border-c rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-subtle-tx text-[11px] font-fira uppercase tracking-widest">Total Expenses</p>
            <TrendingDown size={15} className="text-red-500" />
          </div>
          <p className="text-red-500 text-3xl font-fira font-bold">{fmt(expenses)}</p>
        </div>
        <div className={`border rounded-xl p-5 ${balance >= 0 ? "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20" : "bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20"}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-subtle-tx text-[11px] font-fira uppercase tracking-widest">Net Balance</p>
            <IndianRupee size={15} className={balance >= 0 ? "text-emerald-500" : "text-red-500"} />
          </div>
          <p className={`text-3xl font-fira font-bold ${balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{fmt(Math.abs(balance))}</p>
          <p className="text-subtle-tx text-xs font-fira mt-1">{balance >= 0 ? "surplus" : "deficit"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense breakdown */}
        {catTotals.length > 0 && (
          <div className="bg-surface border border-border-c rounded-xl p-5">
            <h3 className="text-tx font-fira font-semibold text-sm mb-4">Expense Breakdown</h3>
            <div className="space-y-3">
              {catTotals.sort((a,b)=>b.value-a.value).map(({ cat, value }) => {
                const pct = expenses > 0 ? Math.round(value / expenses * 100) : 0;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: CAT_COLOR[cat] }} />
                        <span className="text-muted-tx text-xs font-fira">{cat}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-subtle-tx text-[11px] font-fira">{pct}%</span>
                        <span className="text-tx text-xs font-fira font-bold">{fmt(value)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CAT_COLOR[cat] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Ledger */}
        <div className={`${catTotals.length > 0 ? "lg:col-span-2" : "lg:col-span-3"} bg-surface border border-border-c rounded-xl overflow-hidden`}>
          <div className="px-5 py-4 border-b border-border-c">
            <h3 className="text-tx font-fira font-semibold text-sm">Transaction Ledger</h3>
          </div>
          {evItems.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center">
              <Wallet size={36} className="text-subtle-tx mb-3" />
              <p className="text-muted-tx text-sm font-fira">No entries yet for this event.</p>
              <button type="button" onClick={() => setShowAdd(true)} className="text-red-500 text-sm font-fira hover:underline mt-2">Add first entry →</button>
            </div>
          ) : (
            <div className="divide-y divide-border-c">
              {evItems.sort((a,b) => b.date.localeCompare(a.date)).map(item => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface2 transition-colors group">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: CAT_COLOR[item.category] + "25" }}>
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: CAT_COLOR[item.category] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-tx text-sm font-fira font-semibold truncate">{item.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-subtle-tx text-[11px] font-fira">{item.category}</span>
                      <span className="text-subtle-tx text-[11px]">·</span>
                      <span className="text-subtle-tx text-[11px] font-fira">{item.date}</span>
                      {item.note && <span className="text-subtle-tx text-[11px] font-fira truncate">· {item.note}</span>}
                    </div>
                  </div>
                  <p className={`text-sm font-fira font-bold shrink-0 ${item.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {item.type === "INCOME" ? "+" : "−"}{fmt(item.amount)}
                  </p>
                  <button type="button" onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 text-subtle-tx hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add entry modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-surface border border-border-c rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-c">
              <h2 className="text-tx font-fira font-semibold text-base">Add Budget Entry</h2>
              <button type="button" onClick={() => setShowAdd(false)} className="text-muted-tx hover:text-tx transition-colors"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Type toggle */}
              <div className="flex gap-1 bg-surface2 p-1 rounded-xl border border-border-c">
                {(["INCOME","EXPENSE"] as const).map(t => (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`flex-1 py-2 text-sm font-fira font-semibold rounded-lg transition-all ${form.type === t ? (t === "INCOME" ? "bg-emerald-500 text-white" : "bg-red-500 text-white") : "text-muted-tx hover:text-tx"}`}>
                    {t === "INCOME" ? "+ Income" : "− Expense"}
                  </button>
                ))}
              </div>
              {[
                { key: "label", label: "Description", placeholder: "e.g. Auditorium Booking", type: "text" },
                { key: "amount", label: "Amount (₹)", placeholder: "e.g. 15000", type: "number" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-muted-tx text-xs font-fira uppercase tracking-wider mb-1.5">{f.label}</label>
                  <input type={f.type} value={form[f.key as "label"|"amount"]} placeholder={f.placeholder}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full bg-surface2 border border-border-c focus:border-red-500/40 rounded-lg px-3 py-2.5 text-sm font-fira text-tx placeholder-subtle-tx outline-none transition-colors" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-tx text-xs font-fira uppercase tracking-wider mb-1.5">Category</label>
                  <div className="relative">
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as Category }))}
                      className="w-full bg-surface2 border border-border-c rounded-lg px-3 py-2.5 text-sm font-fira text-tx outline-none appearance-none pr-8 focus:border-red-500/40 transition-colors">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle-tx pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-muted-tx text-xs font-fira uppercase tracking-wider mb-1.5">Note (optional)</label>
                  <input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="e.g. Invoice #123"
                    className="w-full bg-surface2 border border-border-c focus:border-red-500/40 rounded-lg px-3 py-2.5 text-sm font-fira text-tx placeholder-subtle-tx outline-none transition-colors" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-c">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm font-fira text-muted-tx border border-border-c hover:border-red-500/20 rounded-lg transition-all">Cancel</button>
              <button type="button" onClick={addItem} disabled={!form.label.trim() || !form.amount}
                className={`flex items-center gap-2 px-5 py-2 text-sm font-fira font-semibold rounded-lg transition-all ${!form.label.trim() || !form.amount ? "bg-surface2 text-muted-tx cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"}`}>
                <Plus size={13} /> Add Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
