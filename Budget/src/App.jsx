import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import { useSupabaseData } from "./hooks/useSupabaseData";
import { getMonthKey } from "./utils/format";
import Auth from "./components/Auth";
import MonthSelector from "./components/MonthSelector";
import Summary from "./components/Summary";
import SalaryForm from "./components/SalaryForm";
import RecurringSettings from "./components/RecurringSettings";
import BudgetProgress from "./components/BudgetProgress";
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

  // --- Разовые расходы за выбранный месяц ---
  const monthTransactions = useMemo(() => {
    return transactions
      .filter((t) => t.date.slice(0, 7) === selectedMonth)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, selectedMonth]);

  // --- Итог по зарплатам за месяц ---
  const salaryTotal = useMemo(() => {
    const s = salaries[selectedMonth] || { husband: 0, wife: 0 };
    return (s.husband || 0) + (s.wife || 0);
  }, [salaries, selectedMonth]);

  // --- Список месяцев, где есть данные ---
  const months = useMemo(() => {
    const set = new Set();
    transactions.forEach((t) => set.add(t.date.slice(0, 7)));
    Object.keys(salaries).forEach((k) => set.add(k));
    set.add(getMonthKey());
    return Array.from(set);
  }, [transactions, salaries]);

  // --- Подсказки для поля «на что потратил» ---
  const categorySuggestions = useMemo(() => {
    const regular = new Set();
    recurring.forEach((r) => {
      if (r.name) regular.add(r.name.trim());
    });

    const others = new Set();
    transactions.forEach((t) => {
      if (!t.category) return;
      const name = t.category.trim();
      if (!regular.has(name)) others.add(name);
    });

    return {
      regular: Array.from(regular).sort((a, b) => a.localeCompare(b, "ru")),
      others: Array.from(others).sort((a, b) => a.localeCompare(b, "ru")),
    };
  }, [recurring, transactions]);

  // --- Действия ---
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

  const deleteTransaction = (id) => {
    update({ transactions: transactions.filter((t) => t.id !== id) });
  };

  const setSalary = (newSalary) => {
    update({ salaries: { ...salaries, [selectedMonth]: newSalary } });
  };

  // --- Редактирование плана на конкретный месяц ---
  const setPlanForMonth = (recurringId, value) => {
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

      <BudgetProgress
        recurring={recurring}
        transactions={transactions}
        overrides={overrides}
        selectedMonth={selectedMonth}
        onChangePlan={setPlanForMonth}
      />

      <TransactionForm
        onAdd={addTransaction}
        suggestions={categorySuggestions}
      />

      <TransactionList
        transactions={monthTransactions}
        onDelete={deleteTransaction}
      />
    </div>
  );
}
