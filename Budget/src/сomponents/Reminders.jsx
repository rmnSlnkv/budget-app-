import { useMemo, useState } from "react";
import { formatMoney, getMonthKey, formatMonthLabel } from "../utils/format";

const MONTHS = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];

function monthName(mm) {
  return new Date(2020, Number(mm) - 1).toLocaleDateString("ru-RU", {
    month: "long",
  });
}

export default function Reminders({ reminders, onChange, paid, onTogglePaid }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [openMobile, setOpenMobile] = useState(false);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(getMonthKey().split("-")[1]);
  const [year, setYear] = useState(getMonthKey().split("-")[0]);
  const [note, setNote] = useState("");

  const nowKey = getMonthKey();

  const decorated = useMemo(() => {
    return reminders
      .map((r) => {
        const key = `${r.year}-${r.month}`;
        const isPaid = !!paid?.[r.id]?.[key];
        const isPast = key < nowKey && !isPaid;
        const isCurrent = key === nowKey && !isPaid;
        return { ...r, key, isPaid, isPast, isCurrent };
      })
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [reminders, paid, nowKey]);

  const urgentCount = decorated.filter(
    (d) => !d.isPaid && (d.isPast || d.isCurrent),
  ).length;

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setMonth(getMonthKey().split("-")[1]);
    setYear(getMonthKey().split("-")[0]);
    setNote("");
    setEditingId(null);
    setShowForm(false);
  };

  const submit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!title.trim() || !num || num <= 0) return;

    const payload = {
      title: title.trim(),
      amount: num,
      month,
      year,
      note: note.trim(),
    };

    if (editingId) {
      onChange(
        reminders.map((r) => (r.id === editingId ? { ...r, ...payload } : r)),
      );
    } else {
      onChange([...reminders, { id: crypto.randomUUID(), ...payload }]);
    }
    resetForm();
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setTitle(r.title);
    setAmount(String(r.amount));
    setMonth(r.month);
    setYear(r.year);
    setNote(r.note || "");
    setShowForm(true);
    setOpenMobile(true);
  };

  const remove = (id) => {
    onChange(reminders.filter((r) => r.id !== id));
    if (editingId === id) resetForm();
  };

  return (
    <>
      {/* Кнопка-колокольчик — видна только на мобильных */}
      <button
        type="button"
        className="reminders-toggle-mobile"
        onClick={() => setOpenMobile(true)}
        aria-label="Открыть напоминания"
      >
        🔔
        {urgentCount > 0 && (
          <span className="reminders-badge">{urgentCount}</span>
        )}
      </button>

      {/* Затемнение за модальным окном — только на мобильных */}
      <button
        type="button"
        className={`reminders-backdrop ${openMobile ? "open" : ""}`}
        onClick={() => setOpenMobile(false)}
        aria-label="Закрыть напоминания"
      />

      <section className={`reminders-block ${openMobile ? "open" : ""}`}>
        <div className="reminders-block-header">
          <h3>📌 Обязательные траты</h3>
          <div className="reminders-header-actions">
            {!showForm && (
              <button
                type="button"
                className="reminders-add-btn"
                onClick={() => setShowForm(true)}
              >
                + Добавить
              </button>
            )}
            <button
              type="button"
              className="reminders-close-mobile"
              onClick={() => setOpenMobile(false)}
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
        </div>

        {showForm && (
          <form className="reminders-form" onSubmit={submit}>
            <input
              type="text"
              placeholder="Название (Квартплата, Страховка…)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div className="reminders-row">
              <input
                type="number"
                placeholder="Сумма"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="100"
                required
              />
              <select value={month} onChange={(e) => setMonth(e.target.value)}>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {monthName(m)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min="2000"
                max="2100"
                step="1"
              />
            </div>
            <input
              type="text"
              placeholder="Комментарий (необязательно)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="reminders-actions">
              <button type="submit">
                {editingId ? "Сохранить" : "Добавить"}
              </button>
              <button type="button" onClick={resetForm} className="ghost">
                Отмена
              </button>
            </div>
          </form>
        )}

        {decorated.length === 0 ? (
          <p className="reminders-empty">Пока нет напоминаний</p>
        ) : (
          <ul className="reminders-list">
            {decorated.map((r) => (
              <li
                key={r.id}
                className={[
                  r.isPaid ? "paid" : "",
                  r.isPast ? "past" : "",
                  r.isCurrent ? "current" : "",
                ]
                  .join(" ")
                  .trim()}
              >
                <label className="reminders-check">
                  <input
                    type="checkbox"
                    checked={r.isPaid}
                    onChange={() => onTogglePaid(r.id, r.key)}
                  />
                  <span className="reminders-info">
                    <span className="reminders-title">{r.title}</span>
                    <span className="reminders-meta">
                      {formatMonthLabel(r.key)} · {formatMoney(r.amount)}
                      {r.note && ` · ${r.note}`}
                    </span>
                  </span>
                </label>
                <div className="reminders-item-actions">
                  <button onClick={() => startEdit(r)} title="Редактировать">
                    ✎
                  </button>
                  <button onClick={() => remove(r.id)} title="Удалить">
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
