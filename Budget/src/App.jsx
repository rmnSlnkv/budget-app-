import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import { useSupabaseData } from "./hooks/useSupabaseData";
import { getMonthKey } from "./utils/format";
import Auth from "./components/Auth";
import MonthSelector from "./components/MonthSelector";
import Summary from "./components/Summary";
import SalaryForm from "./components/SalaryForm";
import RecurringSettings from "./components/RecurringSettings";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import FloatingCoins from "./components/FloatingCoins";
import Reminders from "./components/Reminders";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user ?? null),
    );

    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) return <div className="loading-screen">Загрузка…</div>;
  if (!user) return <Auth />;

  return <BudgetApp user={user} />;
}

function BudgetApp({ user }) {
  const { data, update, loading, saving } = useSupabaseData(user);
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey());

  const {
    transactions = [],
    salaries = {},
    recurring = [],
    overrides = {},
    reminders = [],
    reminders_paid = {},
  } = data;

  const monthTransactions = useMemo(() => {
    const monthOverrides = overrides[selectedMonth] || {};
    const fixed = recurring.map((r) => ({
      id: `rec-${r.id}`,
      recurringId: r.id,
      type: r.type,
      category: r.name,
      amount: monthOverrides[r.id] ?? r.defaultAmount,
      date: `${selectedMonth}-01`,
      note: "Регулярная статья",
      isRecurring: true,
    }));
    const oneOff = transactions.filter(
      (t) => t.date.slice(0, 7) === selectedMonth,
    );
    return [...fixed, ...oneOff];
  }, [selectedMonth, recurring, overrides, transactions]);

  const salaryTotal = useMemo(() => {
    const s = salaries[selectedMonth] || { husband: 0, wife: 0 };
    return (s.husband || 0) + (s.wife || 0);
  }, [salaries, selectedMonth]);

  const months = useMemo(() => {
    const set = new Set();
    transactions.forEach((t) => set.add(t.date.slice(0, 7)));
    Object.keys(salaries).forEach((k) => set.add(k));
    set.add(getMonthKey());
    return Array.from(set);
  }, [transactions, salaries]);

  const categorySuggestions = useMemo(() => {
    const set = new Set();
    transactions.forEach((t) => {
      if (t.category) set.add(t.category.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ru"));
  }, [transactions]);

  const addTransaction = (item) => {
    update({
      transactions: [
        ...transactions,
        {
          ...item,
          id: crypto.randomUUID(),
          type: "expense",
          createdAt: Date.now(),
        },
      ],
    });
  };
  const deleteTransaction = (id) =>
    update({ transactions: transactions.filter((t) => t.id !== id) });
  const setSalary = (newSalary) =>
    update({ salaries: { ...salaries, [selectedMonth]: newSalary } });

  const setRecurringAmount = (recurringId, value) => {
    const num = parseFloat(value);
    update({
      overrides: {
        ...overrides,
        [selectedMonth]: {
          ...(overrides[selectedMonth] || {}),
          [recurringId]: isNaN(num) ? 0 : num,
        },
      },
    });
  };

  const resetRecurringAmount = (recurringId) => {
    const copy = { ...(overrides[selectedMonth] || {}) };
    delete copy[recurringId];
    update({ overrides: { ...overrides, [selectedMonth]: copy } });
  };

  const toggleReminderPaid = (id, monthKey) => {
    const forId = reminders_paid[id] || {};
    const next = { ...forId };
    if (next[monthKey]) delete next[monthKey];
    else next[monthKey] = true;
    update({ reminders_paid: { ...reminders_paid, [id]: next } });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading)
    return <div className="loading-screen">Загружаем ваш бюджет…</div>;

  return (
    <div className="app">
      <FloatingCoins />
      <div className="user-bar">
        <span className="user-email">{user.email}</span>
        <span className={`save-status ${saving ? "saving" : ""}`}>
          {saving ? "💾 Сохранение…" : "✓ Сохранено"}
        </span>
        <button className="logout-btn" onClick={handleLogout}>
          Выйти
        </button>
      </div>
      <Reminders
        reminders={reminders}
        onChange={(newReminders) => update({ reminders: newReminders })}
        paid={reminders_paid}
        onTogglePaid={toggleReminderPaid}
      />
      <header>
        <MonthSelector
          months={months}
          current={selectedMonth}
          onChange={setSelectedMonth}
        />
      </header>
      <SalaryForm
        salary={salaries[selectedMonth] || { husband: 0, wife: 0 }}
        onChange={setSalary}
      />
      <Summary transactions={monthTransactions} salaryTotal={salaryTotal} />
      <RecurringSettings
        recurring={recurring}
        onChange={(newRecurring) => update({ recurring: newRecurring })}
      />
      <section className="month-recurring">
        <h3>📅 Регулярные статьи за выбранный месяц</h3>
        <ul className="recurring-list month-view">
          {recurring.map((r) => {
            const monthOverrides = overrides[selectedMonth] || {};
            const value = monthOverrides[r.id] ?? r.defaultAmount;
            const isChanged =
              monthOverrides[r.id] !== undefined &&
              monthOverrides[r.id] !== r.defaultAmount;
            return (
              <li key={r.id}>
                <span className="rec-name">{r.name}</span>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setRecurringAmount(r.id, e.target.value)}
                  min="0"
                  step="100"
                />
                {isChanged && (
                  <button
                    className="reset-btn"
                    onClick={() => resetRecurringAmount(r.id)}
                    title={`Сбросить к ${r.defaultAmount}`}
                  >
                    ↺
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>
      <TransactionForm
        onAdd={addTransaction}
        suggestions={categorySuggestions}
      />
      <TransactionList
        transactions={monthTransactions.filter((t) => !t.isRecurring)}
        onDelete={deleteTransaction}
      />
    </div>
  );
}
