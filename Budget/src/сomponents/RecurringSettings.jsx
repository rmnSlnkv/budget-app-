import { useState } from "react";

export default function RecurringSettings({ recurring, onChange }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const addItem = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!name.trim() || !num || num <= 0) return;
    onChange([
      ...recurring,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        defaultAmount: num,
        type: "expense",
      },
    ]);
    setName("");
    setAmount("");
  };

  const removeItem = (id) => {
    onChange(recurring.filter((r) => r.id !== id));
  };

  const updateAmount = (id, value) => {
    const num = parseFloat(value);
    onChange(
      recurring.map((r) =>
        r.id === id ? { ...r, defaultAmount: isNaN(num) ? 0 : num } : r,
      ),
    );
  };

  return (
    <details className="recurring-settings">
      <summary>⚙️ Регулярные статьи ({recurring.length})</summary>

      <ul className="recurring-list">
        {recurring.map((r) => (
          <li key={r.id}>
            <span className="rec-name">{r.name}</span>
            <input
              type="number"
              value={r.defaultAmount}
              onChange={(e) => updateAmount(r.id, e.target.value)}
              min="0"
              step="100"
            />
            <button onClick={() => removeItem(r.id)} aria-label="Удалить">
              ×
            </button>
          </li>
        ))}
      </ul>

      <form className="recurring-add" onSubmit={addItem}>
        <input
          placeholder="Название "
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Сумма"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="100"
        />
        <button type="submit">Добавить</button>
      </form>

      <p className="hint">
        Эти статьи автоматически появятся в каждом месяце. Сумму можно изменить
        в конкретном месяце — шаблон не изменится.
      </p>
    </details>
  );
}
