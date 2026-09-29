import { formatMoney } from "../utils/format";

export default function SalaryForm({ salary, onChange }) {
  const husband = salary?.husband ?? 0;
  const wife = salary?.wife ?? 0;

  const update = (field, value) => {
    const num = parseFloat(value);
    onChange({ ...salary, [field]: isNaN(num) ? 0 : num });
  };

  return (
    <div className="salary-form">
      <h3>💰 Зарплаты за месяц</h3>
      <div className="salary-row">
        <label>
          <span>Роман</span>
          <input
            type="number"
            value={husband || ""}
            onChange={(e) => update("husband", e.target.value)}
            min="0"
            step="1000"
            placeholder="0"
          />
        </label>
        <label>
          <span>Дарина</span>
          <input
            type="number"
            value={wife || ""}
            onChange={(e) => update("wife", e.target.value)}
            min="0"
            step="1000"
            placeholder="0"
          />
        </label>
      </div>
      <div className="salary-total">
        Итого: <strong>{formatMoney(husband + wife)}</strong>
      </div>
    </div>
  );
}
