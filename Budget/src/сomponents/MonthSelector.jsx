import { formatMonthLabel } from "../utils/format";

export default function MonthSelector({ months, current, onChange }) {
  const [year, month] = current.split("-");

  // Собираем полный список: известные месяцы + все из диапазона
  const options = Array.from(new Set(months)).sort().reverse();

  const handleYear = (v) => {
    onChange(`${v}-${month}`);
  };
  const handleMonth = (v) => {
    onChange(`${year}-${v}`);
  };

  const years = [];
  const nowY = new Date().getFullYear();
  for (let y = nowY - 5; y <= nowY + 5; y++) years.push(y);

  const monthNames = [
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

  return (
    <div className="month-selector">
      <label>Период:</label>

      <select value={month} onChange={(e) => handleMonth(e.target.value)}>
        {monthNames.map((m) => (
          <option key={m} value={m}>
            {new Date(2020, Number(m) - 1).toLocaleDateString("ru-RU", {
              month: "long",
            })}
          </option>
        ))}
      </select>

      <select value={year} onChange={(e) => handleYear(e.target.value)}>
        {years.map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </select>

      {options.length > 0 && (
        <select
          value=""
          onChange={(e) => e.target.value && onChange(e.target.value)}
        >
          <option value="">— есть данные —</option>
          {options.map((m) => (
            <option key={m} value={m}>
              {formatMonthLabel(m)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
