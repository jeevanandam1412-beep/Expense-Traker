import { useState, useEffect } from "react";

const STORAGE_KEY = "grocery_expense_data";

const defaultState = {
  income: [],
  borrowed: [],
  expenses: [],
  emailConfig: { gmail: "jeevanandam1412@gmail.com", gpayLinked: false },
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultState;
  } catch {
    return defaultState;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function fmt(n) {
  return "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

const CATS = ["Sales", "GPay", "Cash", "UPI", "Other"];
const EXP_CATS = ["Stock/Purchase", "Salary", "Rent", "Utilities", "Transport", "Misc"];

export default function App() {
  const [data, setData] = useState(loadData);
  const [tab, setTab] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => { saveData(data); }, [data]);

  const todayStr = today();

  const todayIncome = data.income.filter(i => i.date === todayStr);
  const todayBorrowed = data.borrowed.filter(b => b.date === todayStr);
  const todayExpenses = data.expenses.filter(e => e.date === todayStr);

  const totalIncome = todayIncome.reduce((s, i) => s + Number(i.amount), 0);
  const totalBorrowed = todayBorrowed.reduce((s, b) => s + Number(b.amount), 0);
  const totalExpenses = todayExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const netBalance = totalIncome + totalBorrowed - totalExpenses;

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openModal(type) {
    setForm({ date: todayStr, amount: "", category: type === "expense" ? EXP_CATS[0] : CATS[0], note: "", source: "", borrowerName: "" });
    setModal(type);
  }

  function handleAdd() {
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      showToast("Enter a valid amount", "error"); return;
    }
    const entry = { id: Date.now(), ...form, amount: Number(form.amount) };
    if (modal === "income") {
      setData(d => ({ ...d, income: [entry, ...d.income] }));
      showToast("Income added!");
    } else if (modal === "borrow") {
      if (!form.borrowerName) { showToast("Enter borrower/lender name", "error"); return; }
      setData(d => ({ ...d, borrowed: [entry, ...d.borrowed] }));
      showToast("Borrow entry added!");
    } else if (modal === "expense") {
      setData(d => ({ ...d, expenses: [entry, ...d.expenses] }));
      showToast("Expense added!");
    }
    setModal(null);
  }

  function deleteEntry(section, id) {
    setData(d => ({ ...d, [section]: d[section].filter(e => e.id !== id) }));
    showToast("Entry deleted");
  }

  function sendDailyReport() {
    if (!data.emailConfig.gmail) { showToast("Set Gmail ID in Settings first", "error"); return; }
    const subject = encodeURIComponent(`Mohan Kumar Store — Daily Report ${todayStr}`);
    const body = encodeURIComponent(
      `MOHAN KUMAR STORE — DAILY REPORT\nDate: ${todayStr}\n\n` +
      `Total Income: ₹${totalIncome}\nTotal Borrowed: ₹${totalBorrowed}\nTotal Expenses: ₹${totalExpenses}\nNet Balance: ₹${netBalance}\n\n` +
      `--- INCOME ---\n${todayIncome.map(i => `${i.category}: ₹${i.amount} [${i.note || "-"}]`).join("\n")}\n\n` +
      `--- BORROWED ---\n${todayBorrowed.map(b => `From ${b.borrowerName}: ₹${b.amount} [${b.note}]`).join("\n")}\n\n` +
      `--- EXPENSES ---\n${todayExpenses.map(e => `${e.category}: ₹${e.amount} [${e.note || "-"}]`).join("\n")}`
    );
    window.open(`mailto:${data.emailConfig.gmail}?subject=${subject}&body=${body}`, "_blank");
    showToast("Opening Gmail...");
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "⊞" },
    { id: "income", label: "Income", icon: "↑" },
    { id: "borrow", label: "Borrowed", icon: "⇄" },
    { id: "expenses", label: "Expenses", icon: "↓" },
    { id: "settings", label: "Settings", icon: "⚙" },
  ];

  return (
    <div style={{ fontFamily: "'Georgia', serif", minHeight: "100vh", background: "#0f0f0f", color: "#e8e0d0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;1,300&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --gold: #c9a84c;
          --gold-light: #e8c97a;
          --cream: #e8e0d0;
          --bg: #0f0f0f;
          --bg2: #1a1a1a;
          --bg3: #242424;
          --red: #c0392b;
          --green: #27ae60;
          --blue: #2980b9;
        }
        body { background: var(--bg); }
        button { cursor: pointer; border: none; }
        input, select { outline: none; }
        .playfair { font-family: 'Playfair Display', serif; }
        .crimson { font-family: 'Crimson Pro', serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--bg2); }
        ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 2px; }
        .card-hover:hover { transform: translateY(-2px); transition: transform 0.2s; }
        @keyframes slideIn { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .anim { animation: slideIn 0.4s ease forwards; }
        .row-anim { animation: fadeIn 0.3s ease forwards; }
        @keyframes toastIn { from { opacity:0; transform:translateX(100px); } to { opacity:1; transform:translateX(0); } }
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a1400 0%, #0f0f0f 60%)", borderBottom: "1px solid #2a2a2a", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div className="playfair" style={{ fontSize: 22, fontWeight: 900, color: "var(--gold)", letterSpacing: 1 }}>🛒 Mohan Kumar Store</div>
          <div className="crimson" style={{ fontSize: 13, color: "#888", fontStyle: "italic" }}>Grocery Shop · Daily Expense Manager</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="crimson" style={{ fontSize: 12, color: "#666" }}>Today</div>
          <div className="playfair" style={{ fontSize: 14, color: "var(--gold-light)" }}>{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "var(--bg2)", borderBottom: "1px solid #2a2a2a", overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: "12px 8px", background: tab === t.id ? "var(--bg3)" : "transparent",
              color: tab === t.id ? "var(--gold)" : "#666", fontSize: 12,
              borderBottom: tab === t.id ? "2px solid var(--gold)" : "2px solid transparent",
              fontFamily: "Georgia, serif", minWidth: 60 }}>
            <div style={{ fontSize: 16 }}>{t.icon}</div>
            <div>{t.label}</div>
          </button>
        ))}
      </div>

      <div style={{ padding: "16px", maxWidth: 480, margin: "0 auto" }}>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div className="anim">

            {/* ── FORMULA BALANCE CARD ── */}
            <div style={{ background: "linear-gradient(145deg, #1a1600 0%, #0f0f0f 100%)", border: "1px solid #2e2a1a", borderRadius: 18, padding: "18px 16px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle, #c9a84c14 0%, transparent 70%)", pointerEvents: "none" }} />

              <div className="crimson" style={{ fontSize: 11, color: "#666", letterSpacing: 3, marginBottom: 16, textTransform: "uppercase" }}>Today's Balance Formula</div>

              {/* ROW 1: Income + Borrowed = Total */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff08", borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
                {/* Income */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#27ae60", letterSpacing: 1, marginBottom: 4 }}>INCOME</div>
                  <div className="playfair" style={{ fontSize: 18, fontWeight: 900, color: "#27ae60" }}>{fmt(totalIncome)}</div>
                  <div style={{ fontSize: 9, color: "#27ae60", opacity: 0.6, marginTop: 2 }}>{todayIncome.length} entries</div>
                </div>
                {/* + */}
                <div className="playfair" style={{ fontSize: 26, color: "#c9a84c", fontWeight: 900 }}>+</div>
                {/* Borrowed */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#2980b9", letterSpacing: 1, marginBottom: 4 }}>BORROWED</div>
                  <div className="playfair" style={{ fontSize: 18, fontWeight: 900, color: "#2980b9" }}>{fmt(totalBorrowed)}</div>
                  <div style={{ fontSize: 9, color: "#2980b9", opacity: 0.6, marginTop: 2 }}>{todayBorrowed.length} entries</div>
                </div>
                {/* = */}
                <div className="playfair" style={{ fontSize: 26, color: "#c9a84c", fontWeight: 900 }}>=</div>
                {/* Total */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "var(--gold)", letterSpacing: 1, marginBottom: 4 }}>TOTAL</div>
                  <div className="playfair" style={{ fontSize: 18, fontWeight: 900, color: "var(--gold-light)" }}>{fmt(totalIncome + totalBorrowed)}</div>
                  <div style={{ fontSize: 9, color: "#666", marginTop: 2 }}>available</div>
                </div>
              </div>

              {/* ROW 2: Total − Expenses = Net Balance */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff08", borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
                {/* Total (repeated small) */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#666", letterSpacing: 1, marginBottom: 4 }}>TOTAL</div>
                  <div className="playfair" style={{ fontSize: 18, fontWeight: 900, color: "#888" }}>{fmt(totalIncome + totalBorrowed)}</div>
                </div>
                {/* − */}
                <div className="playfair" style={{ fontSize: 26, color: "#c0392b", fontWeight: 900 }}>−</div>
                {/* Expenses */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#c0392b", letterSpacing: 1, marginBottom: 4 }}>EXPENSES</div>
                  <div className="playfair" style={{ fontSize: 18, fontWeight: 900, color: "#c0392b" }}>{fmt(totalExpenses)}</div>
                  <div style={{ fontSize: 9, color: "#c0392b", opacity: 0.6, marginTop: 2 }}>{todayExpenses.length} entries</div>
                </div>
                {/* = */}
                <div className="playfair" style={{ fontSize: 26, color: "#c9a84c", fontWeight: 900 }}>=</div>
                {/* Net Balance */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: netBalance >= 0 ? "var(--gold)" : "#c0392b", letterSpacing: 1, marginBottom: 4 }}>BALANCE</div>
                  <div className="playfair" style={{ fontSize: 18, fontWeight: 900, color: netBalance >= 0 ? "var(--gold)" : "#c0392b" }}>
                    {netBalance < 0 ? "−" : ""}{fmt(Math.abs(netBalance))}
                  </div>
                  <div style={{ fontSize: 9, color: netBalance >= 0 ? "#27ae60" : "#c0392b", marginTop: 2 }}>
                    {netBalance >= 0 ? "✅ Profit" : "⚠️ Deficit"}
                  </div>
                </div>
              </div>

              {/* Big Net Balance highlight */}
              <div style={{ background: netBalance >= 0 ? "linear-gradient(135deg,#0d1f0d,#0a1a0a)" : "linear-gradient(135deg,#1f0d0d,#1a0a0a)",
                border: `1px solid ${netBalance >= 0 ? "#27ae6044" : "#c0392b44"}`, borderRadius: 12, padding: "14px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div className="crimson" style={{ fontSize: 12, color: "#888", fontStyle: "italic", marginBottom: 4 }}>Net Balance Today</div>
                  <div className="playfair" style={{ fontSize: 34, fontWeight: 900, color: netBalance >= 0 ? "var(--gold)" : "#c0392b", letterSpacing: -1 }}>
                    {netBalance < 0 ? "−" : ""}{fmt(Math.abs(netBalance))}
                  </div>
                </div>
                <div style={{ fontSize: 44 }}>{netBalance >= 0 ? "💰" : "📉"}</div>
              </div>

              {/* Expense progress bar */}
              {(() => {
                const total = totalIncome + totalBorrowed;
                const pct = total > 0 ? Math.min((totalExpenses / total) * 100, 100) : 0;
                return (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 10, color: "#555" }}>Expense usage of total funds</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: pct > 80 ? "#c0392b" : pct > 50 ? "var(--gold)" : "#27ae60" }}>{pct.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 7, background: "#1e1e1e", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4,
                        background: pct > 80 ? "linear-gradient(90deg,#c0392b,#e74c3c)" : pct > 50 ? "linear-gradient(90deg,#c9a84c,#e8c97a)" : "linear-gradient(90deg,#27ae60,#2ecc71)",
                        transition: "width 0.7s ease" }} />
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* ── 3 STAT CARDS ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[
                { label: "Income", value: totalIncome, color: "#27ae60", bg: "#0d1f0d", icon: "↑", count: todayIncome.length },
                { label: "Borrowed", value: totalBorrowed, color: "#2980b9", bg: "#0d1520", icon: "⇄", count: todayBorrowed.length },
                { label: "Expenses", value: totalExpenses, color: "#c0392b", bg: "#1f0d0d", icon: "↓", count: todayExpenses.length },
              ].map(c => (
                <div key={c.label} className="card-hover" style={{ background: c.bg, border: `1px solid ${c.color}33`, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, color: c.color }}>{c.icon}</div>
                  <div className="playfair" style={{ fontSize: 15, fontWeight: 700, color: c.color, margin: "4px 0" }}>{fmt(c.value)}</div>
                  <div style={{ fontSize: 10, color: "#555" }}>{c.label}</div>
                  <div style={{ fontSize: 10, color: c.color, marginTop: 3, opacity: 0.7 }}>{c.count} entries</div>
                </div>
              ))}
            </div>

            {/* ── QUICK ADD ── */}
            <div className="playfair" style={{ fontSize: 12, color: "var(--gold)", marginBottom: 8, letterSpacing: 2 }}>QUICK ADD</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[
                { label: "Add Income", type: "income", color: "var(--green)", icon: "↑" },
                { label: "Add Borrow", type: "borrow", color: "var(--blue)", icon: "⇄" },
                { label: "Add Expense", type: "expense", color: "var(--red)", icon: "↓" },
              ].map(a => (
                <button key={a.type} onClick={() => openModal(a.type)}
                  style={{ background: "var(--bg2)", border: `1px solid ${a.color}44`, borderRadius: 10, padding: "12px 6px",
                    color: a.color, fontFamily: "Georgia, serif", fontSize: 12 }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{a.icon}</div>
                  {a.label}
                </button>
              ))}
            </div>

            {/* ── SEND REPORT ── */}
            <button onClick={sendDailyReport}
              style={{ width: "100%", background: "linear-gradient(135deg, #1a1200, #2a2000)", border: "1px solid var(--gold)", borderRadius: 10, padding: "13px", color: "var(--gold)", fontFamily: "'Playfair Display', serif", fontSize: 14, letterSpacing: 1, marginBottom: 14 }}>
              📧 Send Daily Report → jeevanandam1412@gmail.com
            </button>

            {/* ── GPay STATUS ── */}
            <div style={{ background: "var(--bg2)", border: "1px solid #2a2a2a", borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div className="playfair" style={{ fontSize: 13, color: "var(--cream)" }}>GPay Integration</div>
                  <div className="crimson" style={{ fontSize: 12, color: "#666", fontStyle: "italic" }}>Auto-capture payments</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: data.emailConfig.gpayLinked ? "var(--green)" : "#444" }}></div>
                  <span style={{ fontSize: 12, color: data.emailConfig.gpayLinked ? "var(--green)" : "#666" }}>
                    {data.emailConfig.gpayLinked ? "Linked" : "Not Linked"}
                  </span>
                </div>
              </div>
            </div>

            {/* ── TODAY'S ACTIVITY TABLE ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div className="playfair" style={{ fontSize: 12, color: "var(--gold)", letterSpacing: 2 }}>TODAY'S ACTIVITY</div>
              <div className="crimson" style={{ fontSize: 11, color: "#555" }}>
                {todayIncome.length + todayBorrowed.length + todayExpenses.length} entries
              </div>
            </div>

            {todayIncome.length + todayBorrowed.length + todayExpenses.length > 0 ? (
              <div style={{ background: "var(--bg2)", borderRadius: 12, overflow: "hidden", border: "1px solid #2a2a2a" }}>
                {/* Table Header */}
                <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 90px 60px", background: "#1e1e1e",
                  borderBottom: "1px solid #2a2a2a", padding: "8px 12px" }}>
                  {["Type", "Name", "Amount", "Time"].map(h => (
                    <div key={h} style={{ fontSize: 10, color: "var(--gold)", letterSpacing: 1, fontFamily: "Georgia", textTransform: "uppercase" }}>{h}</div>
                  ))}
                </div>

                {/* Table Rows */}
                {[...todayIncome.map(i => ({ ...i, _type: "income" })),
                  ...todayBorrowed.map(b => ({ ...b, _type: "borrow" })),
                  ...todayExpenses.map(e => ({ ...e, _type: "expense" }))]
                  .sort((a, b) => b.id - a.id)
                  .map((entry, idx, arr) => {
                    const color = entry._type === "income" ? "#27ae60" : entry._type === "borrow" ? "#2980b9" : "#c0392b";
                    const typeLabel = entry._type === "income" ? "IN" : entry._type === "borrow" ? "BRWD" : "OUT";
                    const name = entry._type === "borrow"
                      ? entry.borrowerName
                      : entry._type === "expense"
                        ? entry.category
                        : (entry.source && entry.source !== "" ? entry.source : entry.category);
                    const time = new Date(entry.id).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
                    return (
                      <div key={entry.id} className="row-anim"
                        style={{ display: "grid", gridTemplateColumns: "60px 1fr 90px 60px",
                          padding: "10px 12px", alignItems: "center",
                          borderBottom: idx < arr.length - 1 ? "1px solid #222" : "none",
                          background: idx % 2 === 0 ? "transparent" : "#ffffff04" }}>
                        {/* Type badge */}
                        <div>
                          <span style={{ fontSize: 9, fontWeight: 700, background: `${color}22`,
                            color, borderRadius: 4, padding: "3px 6px", letterSpacing: 0.5, fontFamily: "Georgia" }}>
                            {typeLabel}
                          </span>
                        </div>
                        {/* Name */}
                        <div className="crimson" style={{ fontSize: 13, color: "var(--cream)", overflow: "hidden",
                          whiteSpace: "nowrap", textOverflow: "ellipsis", paddingRight: 8 }}>
                          {name}
                        </div>
                        {/* Amount */}
                        <div className="playfair" style={{ fontSize: 13, fontWeight: 700, color }}>
                          {entry._type === "expense" ? "−" : "+"}{fmt(entry.amount)}
                        </div>
                        {/* Time */}
                        <div style={{ fontSize: 10, color: "#555", fontFamily: "Georgia" }}>{time}</div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="crimson" style={{ textAlign: "center", color: "#444", padding: "30px 0", fontSize: 16, fontStyle: "italic",
                background: "var(--bg2)", borderRadius: 12, border: "1px solid #2a2a2a" }}>
                No entries today. Start adding!
              </div>
            )}
          </div>
        )}

        {/* INCOME TAB */}
        {tab === "income" && (
          <div className="anim">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div className="playfair" style={{ fontSize: 18, color: "var(--gold)" }}>Income Records</div>
              <button onClick={() => openModal("income")}
                style={{ background: "var(--green)", color: "#fff", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontFamily: "Georgia" }}>
                + Add
              </button>
            </div>
            {data.income.map(i => (
              <div key={i.id} className="row-anim" style={{ background: "var(--bg2)", borderRadius: 10, padding: "12px 14px", marginBottom: 8,
                borderLeft: "3px solid var(--green)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="playfair" style={{ fontSize: 15, color: "var(--green)" }}>{fmt(i.amount)}</span>
                    <span style={{ fontSize: 11, background: "#1a3a1a", color: "var(--green)", borderRadius: 4, padding: "1px 6px" }}>{i.category}</span>
                    {i.source === "GPay" && <span style={{ fontSize: 10, background: "#0d2a1a", color: "#4caf50", borderRadius: 4, padding: "1px 6px" }}>GPay</span>}
                  </div>
                  <div className="crimson" style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{i.note || "—"} · {i.date}</div>
                </div>
                <button onClick={() => deleteEntry("income", i.id)}
                  style={{ background: "#2a1a1a", color: "var(--red)", borderRadius: 6, padding: "4px 8px", fontSize: 12 }}>✕</button>
              </div>
            ))}
            {data.income.length === 0 && <div className="crimson" style={{ textAlign: "center", color: "#444", padding: 40, fontStyle: "italic" }}>No income records yet</div>}
          </div>
        )}

        {/* BORROW TAB */}
        {tab === "borrow" && (
          <div className="anim">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div className="playfair" style={{ fontSize: 18, color: "var(--gold)" }}>Borrowed Money</div>
              <button onClick={() => openModal("borrow")}
                style={{ background: "var(--blue)", color: "#fff", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontFamily: "Georgia" }}>
                + Add
              </button>
            </div>
            {data.borrowed.map(b => (
              <div key={b.id} className="row-anim" style={{ background: "var(--bg2)", borderRadius: 10, padding: "12px 14px", marginBottom: 8,
                borderLeft: "3px solid var(--blue)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="playfair" style={{ fontSize: 15, color: "var(--blue)" }}>{fmt(b.amount)}</span>
                    <span style={{ fontSize: 11, background: "#0d1a2a", color: "var(--blue)", borderRadius: 4, padding: "1px 6px" }}>Customer: {b.borrowerName}</span>
                  </div>
                  <div className="crimson" style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                    📝 {b.note} · {b.date}
                  </div>
                </div>
                <button onClick={() => deleteEntry("borrowed", b.id)}
                  style={{ background: "#2a1a1a", color: "var(--red)", borderRadius: 6, padding: "4px 8px", fontSize: 12 }}>✕</button>
              </div>
            ))}
            {data.borrowed.length === 0 && <div className="crimson" style={{ textAlign: "center", color: "#444", padding: 40, fontStyle: "italic" }}>No borrow records yet</div>}
          </div>
        )}

        {/* EXPENSES TAB */}
        {tab === "expenses" && (
          <div className="anim">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div className="playfair" style={{ fontSize: 18, color: "var(--gold)" }}>Expense Records</div>
              <button onClick={() => openModal("expense")}
                style={{ background: "var(--red)", color: "#fff", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontFamily: "Georgia" }}>
                + Add
              </button>
            </div>
            {data.expenses.map(e => (
              <div key={e.id} className="row-anim" style={{ background: "var(--bg2)", borderRadius: 10, padding: "12px 14px", marginBottom: 8,
                borderLeft: "3px solid var(--red)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="playfair" style={{ fontSize: 15, color: "var(--red)" }}>-{fmt(e.amount)}</span>
                    <span style={{ fontSize: 11, background: "#2a1a1a", color: "var(--red)", borderRadius: 4, padding: "1px 6px" }}>{e.category}</span>
                  </div>
                  <div className="crimson" style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{e.note || "—"} · {e.date}</div>
                </div>
                <button onClick={() => deleteEntry("expenses", e.id)}
                  style={{ background: "#2a1a1a", color: "var(--red)", borderRadius: 6, padding: "4px 8px", fontSize: 12 }}>✕</button>
              </div>
            ))}
            {data.expenses.length === 0 && <div className="crimson" style={{ textAlign: "center", color: "#444", padding: 40, fontStyle: "italic" }}>No expense records yet</div>}
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === "settings" && (
          <div className="anim">
            <div className="playfair" style={{ fontSize: 18, color: "var(--gold)", marginBottom: 20 }}>Settings</div>

            <div style={{ background: "var(--bg2)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div className="playfair" style={{ fontSize: 14, color: "var(--cream)", marginBottom: 10 }}>📧 Gmail Configuration</div>
              <input value={data.emailConfig.gmail}
                onChange={e => setData(d => ({ ...d, emailConfig: { ...d.emailConfig, gmail: e.target.value } }))}
                placeholder="your@gmail.com"
                style={{ width: "100%", background: "var(--bg3)", border: "1px solid #333", borderRadius: 8, padding: "10px 12px",
                  color: "var(--cream)", fontSize: 14, fontFamily: "Georgia" }} />
              <div className="crimson" style={{ fontSize: 12, color: "#666", marginTop: 6, fontStyle: "italic" }}>Daily reports will be sent to this address</div>
            </div>

            <div style={{ background: "var(--bg2)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div className="playfair" style={{ fontSize: 14, color: "var(--cream)" }}>📱 GPay Integration</div>
                  <div className="crimson" style={{ fontSize: 12, color: "#666", fontStyle: "italic", marginTop: 4 }}>Link GPay for auto-income capture</div>
                </div>
                <button onClick={() => {
                  setData(d => ({ ...d, emailConfig: { ...d.emailConfig, gpayLinked: !d.emailConfig.gpayLinked } }));
                  showToast(data.emailConfig.gpayLinked ? "GPay unlinked" : "GPay linked!");
                }}
                  style={{ background: data.emailConfig.gpayLinked ? "var(--green)" : "var(--bg3)",
                    border: `1px solid ${data.emailConfig.gpayLinked ? "var(--green)" : "#444"}`,
                    borderRadius: 20, padding: "6px 16px", color: data.emailConfig.gpayLinked ? "#fff" : "#666", fontSize: 13, fontFamily: "Georgia" }}>
                  {data.emailConfig.gpayLinked ? "✓ Linked" : "Link GPay"}
                </button>
              </div>
            </div>

            <div style={{ background: "var(--bg2)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div className="playfair" style={{ fontSize: 14, color: "var(--cream)", marginBottom: 10 }}>📊 All-Time Summary</div>
              {[
                { label: "Total Income Entries", value: data.income.length, color: "var(--green)" },
                { label: "Total Borrow Entries", value: data.borrowed.length, color: "var(--blue)" },
                { label: "Total Expense Entries", value: data.expenses.length, color: "var(--red)" },
                { label: "Total Income", value: fmt(data.income.reduce((s,i)=>s+Number(i.amount),0)), color: "var(--green)" },
                { label: "Total Borrowed", value: fmt(data.borrowed.reduce((s,b)=>s+Number(b.amount),0)), color: "var(--blue)" },
                { label: "Total Expenses", value: fmt(data.expenses.reduce((s,e)=>s+Number(e.amount),0)), color: "var(--red)" },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #2a2a2a" }}>
                  <span className="crimson" style={{ fontSize: 13, color: "#888" }}>{r.label}</span>
                  <span className="playfair" style={{ fontSize: 13, color: r.color, fontWeight: 700 }}>{r.value}</span>
                </div>
              ))}
            </div>

            <button onClick={() => { if (window.confirm("Clear ALL data?")) { setData(defaultState); showToast("Data cleared"); } }}
              style={{ width: "100%", background: "#2a0a0a", border: "1px solid var(--red)", borderRadius: 10, padding: 12,
                color: "var(--red)", fontFamily: "Georgia", fontSize: 14 }}>
              🗑 Clear All Data
            </button>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "flex-end", zIndex: 100 }}
          onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div style={{ background: "var(--bg2)", borderRadius: "20px 20px 0 0", padding: "24px 20px", width: "100%", maxWidth: 480, margin: "0 auto",
            border: "1px solid #2a2a2a", animation: "slideIn 0.3s ease" }}>

            <div className="playfair" style={{ fontSize: 18, color: "var(--gold)", marginBottom: 20 }}>
              {modal === "income" ? "↑ Add Income" : modal === "borrow" ? "⇄ Add Borrowed Money" : "↓ Add Expense"}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="crimson" style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>Amount (₹) *</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
                style={{ width: "100%", background: "var(--bg3)", border: "1px solid #333", borderRadius: 8, padding: "12px", color: "var(--cream)", fontSize: 18, fontFamily: "'Playfair Display', serif" }} />
            </div>

            {modal === "borrow" && (
              <div style={{ marginBottom: 14 }}>
                <label className="crimson" style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>Customer Name *</label>
                <input value={form.borrowerName} onChange={e => setForm(f => ({ ...f, borrowerName: e.target.value }))}
                  placeholder="Enter customer name"
                  style={{ width: "100%", background: "var(--bg3)", border: "1px solid #333", borderRadius: 8, padding: "10px 12px", color: "var(--cream)", fontSize: 14, fontFamily: "Georgia" }} />
              </div>
            )}

            {modal !== "borrow" && (
              <div style={{ marginBottom: 14 }}>
                <label className="crimson" style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: "100%", background: "var(--bg3)", border: "1px solid #333", borderRadius: 8, padding: "10px 12px", color: "var(--cream)", fontSize: 14, fontFamily: "Georgia" }}>
                  {(modal === "income" ? CATS : EXP_CATS).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            )}

            {modal === "income" && (
              <div style={{ marginBottom: 14 }}>
                <label className="crimson" style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>Payment Source</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["Cash", "GPay"].map(s => (
                    <button key={s} onClick={() => setForm(f => ({ ...f, source: s }))}
                      style={{ flex: 1, background: form.source === s ? "var(--gold)" : "var(--bg3)",
                        border: `1px solid ${form.source === s ? "var(--gold)" : "#333"}`,
                        borderRadius: 8, padding: "12px 4px", color: form.source === s ? "#000" : "#888", fontSize: 14, fontFamily: "Georgia", fontWeight: form.source === s ? 700 : 400 }}>
                      {s === "Cash" ? "💵 Cash" : "📱 GPay"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label className="crimson" style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                style={{ background: "var(--bg3)", border: "1px solid #333", borderRadius: 8, padding: "10px 12px", color: "var(--cream)", fontSize: 14, fontFamily: "Georgia" }} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setModal(null)}
                style={{ flex: 1, background: "var(--bg3)", border: "1px solid #333", borderRadius: 10, padding: 14, color: "#888", fontFamily: "Georgia", fontSize: 15 }}>
                Cancel
              </button>
              <button onClick={handleAdd}
                style={{ flex: 2, background: modal === "income" ? "var(--green)" : modal === "borrow" ? "var(--blue)" : "var(--red)",
                  borderRadius: 10, padding: 14, color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700 }}>
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", top: 80, right: 16, background: toast.type === "error" ? "var(--red)" : "var(--green)",
          color: "#fff", borderRadius: 10, padding: "10px 16px", fontSize: 14, fontFamily: "Georgia",
          boxShadow: "0 4px 20px #000a", animation: "toastIn 0.3s ease", zIndex: 200 }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}