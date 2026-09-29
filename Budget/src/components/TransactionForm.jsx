import { useState } from "react";

export default function TransactionForm({ onAdd, suggestions = [] }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

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
        type="number"
        placeholder="Сумма"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="0"
        step="0.01"
        required
      />

      <input
        type="text"
        placeholder="На что потратил"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        list="category-suggestions"
        required
      />

      {/* datalist даёт подсказки, но не ограничивает ввод */}
      <datalist id="category-suggestions">
        {suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <input
        type="text"
        placeholder="Комментарий "
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <button type="submit">Добавить</button>
    </form>
  );
}
