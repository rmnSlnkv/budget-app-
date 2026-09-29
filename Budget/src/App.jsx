import { useMemo, useState } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { getMonthKey } from "./utils/format";
import MonthSelector from "./сomponents/MonthSelector";
import Summary from "./сomponents/Summary";
import SalaryForm from "./сomponents/SalaryForm";
import RecurringSettings from "./сomponents/RecurringSettings";
import TransactionForm from "./сomponents/TransactionForm";
import TransactionList from "./сomponents/TransactionList";
import FloatingCoins from "./сomponents/FloatingCoins";
import Reminders from "./сomponents/Reminders";
import "./App.css";

export default function App() {
  const [transactions, setTransactions] = useLocalStorage(
    "budget-transactions",
    [],
  );
  const [salaries, setSalaries] = useLocalStorage("budget-salaries", {});
  const [recurring, setRecurring] = useLocalStorage("budget-recurring", [
    { id: "food", name: "Еда", defaultAmount: 30000, type: "expense" },
    { id: "rent", name: "Квартира", defaultAmount: 40000, type: "expense" },
  ]);
  const [overrides, setOverrides] = useLocalStorage("budget-overrides", {});
  const [reminders, setReminders] = useLocalStorage("budget-reminders", []);
  const [remindersPaid, setRemindersPaid] = useLocalStorage(
    "budget-reminders-paid",
    {},
  );

  const [selectedMonth, setSelectedMonth] = useState(getMonthKey());

  // --- Операции выбранного месяца: регулярные + разовые ---
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
    const set = new Set();
    transactions.forEach((t) => {
      if (t.category) set.add(t.category.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ru"));
  }, [transactions]);

  // --- Действия ---
  const addTransaction = (data) => {
    setTransactions([
      ...transactions,
      {
        ...data,
        id: crypto.randomUUID(),
        type: "expense",
        createdAt: Date.now(),
      },
    ]);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const setSalary = (newSalary) => {
    setSalaries({ ...salaries, [selectedMonth]: newSalary });
  };

  const setRecurringAmount = (recurringId, value) => {
    const num = parseFloat(value);
    setOverrides({
      ...overrides,
      [selectedMonth]: {
        ...(overrides[selectedMonth] || {}),
        [recurringId]: isNaN(num) ? 0 : num,
      },
    });
  };

  const resetRecurringAmount = (recurringId) => {
    const copy = { ...(overrides[selectedMonth] || {}) };
    delete copy[recurringId];
    setOverrides({ ...overrides, [selectedMonth]: copy });
  };

  const toggleReminderPaid = (id, monthKey) => {
    const forId = remindersPaid[id] || {};
    const next = { ...forId };
    if (next[monthKey]) {
      delete next[monthKey];
    } else {
      next[monthKey] = true;
    }
    setRemindersPaid({ ...remindersPaid, [id]: next });
  };

  return (
    <div className="app">
      <FloatingCoins />

      <Reminders
        reminders={reminders}
        onChange={setReminders}
        paid={remindersPaid}
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

      <RecurringSettings recurring={recurring} onChange={setRecurring} />

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
