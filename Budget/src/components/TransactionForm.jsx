import { useState } from "react";

export default function TransactionForm({ onAdd, suggestions }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const regular = suggestions?.regular || [];
  const others = suggestions?.others || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    const trimmedCategory = category.trim();

    if (!num || num <= 0 || !trimmedCategory) return;

    onAdd({ amount: num, category: trimmedCategory, note: note.trim(), date });
    setAmount("");
    setCategory("");
    setNote("");
  };

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <h3>🧾 Разовый расход</h3>

      <input
        id="tx-amount"
        name="amount"
        type="number"
        placeholder="Сумма"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="0"
        step="0.01"
        required
      />

      <div className="category-field">
        <input
          id="tx-category"
          name="category"
          type="text"
          placeholder="На что потратил (Еда, Квартира…)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          list="category-suggestions"
          required
        />
        {category && regular.includes(category.trim()) && (
          <span className="category-match">✓ учтётся в бюджете</span>
        )}
      </div>

      <datalist id="category-suggestions">
        {regular.map((s) => (
          <option key={`reg-${s}`} value={s} />
        ))}
        {others.map((s) => (
          <option key={`oth-${s}`} value={s} />
        ))}
      </datalist>

      <input
        id="tx-date"
        name="date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <input
        id="tx-note"
        name="note"
        type="text"
        placeholder="Комментарий (необязательно)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <button type="submit">Добавить</button>
    </form>
  );
}
