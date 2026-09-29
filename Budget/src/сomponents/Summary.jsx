import { formatMoney } from "../utils/format";

export default function Summary({ transactions, salaryTotal = 0 }) {
  const recurringIncome = transactions
    .filter((t) => t.type === "income" && t.isRecurring)
    .reduce((s, t) => s + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const income = salaryTotal + recurringIncome;
  const balance = income - expense;

  return (
    <div className="summary">
      <div className="summary-card income">
        <span>Доходы</span>
        <strong>{formatMoney(income)}</strong>
      </div>
      <div className="summary-card expense">
        <span>Расходы</span>
        <strong>{formatMoney(expense)}</strong>
      </div>
      <div
        className={`summary-card balance ${balance >= 0 ? "positive" : "negative"}`}
      >
        <span>Баланс</span>
        <strong>{formatMoney(balance)}</strong>
      </div>
    </div>
  );
}
