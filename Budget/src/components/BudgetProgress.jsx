import { formatMoney } from "../utils/format";

const normalize = (s) => (s || "").trim().toLowerCase();

export default function BudgetProgress({
  recurring,
  transactions,
  overrides,
  selectedMonth,
}) {
  if (recurring.length === 0) {
    return (
      <section className="budget-progress">
        <h3>📊 Бюджет на месяц</h3>
        <p className="empty">
          Добавьте регулярные статьи, чтобы видеть, сколько запланировано и
          сколько уже потрачено.
        </p>
      </section>
    );
  }

  const monthOverrides = overrides[selectedMonth] || {};

  // Разовые расходы за выбранный месяц
  const monthTransactions = transactions.filter(
    (t) => t.date.slice(0, 7) === selectedMonth,
  );

  // Для каждой регулярной статьи — сколько потрачено
  const rows = recurring.map((r) => {
    const plan = monthOverrides[r.id] ?? r.defaultAmount;
    const key = normalize(r.name);

    const spent = monthTransactions
      .filter((t) => normalize(t.category) === key)
      .reduce((sum, t) => sum + t.amount, 0);

    const percent =
      plan > 0 ? Math.min(100, Math.round((spent / plan) * 100)) : 0;
    const rawPercent = plan > 0 ? Math.round((spent / plan) * 100) : 0;
    const remaining = plan - spent;
    const overspent = spent > plan && plan > 0;
    const done = !overspent && plan > 0 && spent >= plan;

    return {
      ...r,
      plan,
      spent,
      percent,
      rawPercent,
      remaining,
      overspent,
      done,
    };
  });

  // Расходы без совпадения с регулярными — «Прочее»
  const recurringNames = new Set(recurring.map((r) => normalize(r.name)));
  const otherSpent = monthTransactions
    .filter((t) => !recurringNames.has(normalize(t.category)))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPlan = rows.reduce((sum, r) => sum + r.plan, 0);
  const totalSpent = rows.reduce((sum, r) => sum + r.spent, 0) + otherSpent;

  return (
    <section className="budget-progress">
      <div className="budget-header">
        <h3>📊 Бюджет на месяц</h3>
        <div className="budget-total">
          <span>
            <strong>{formatMoney(totalSpent)}</strong> /{" "}
            {formatMoney(totalPlan)}
          </span>
          {totalSpent <= totalPlan ? (
            <span className="left">
              остаток {formatMoney(totalPlan - totalSpent)}
            </span>
          ) : (
            <span className="over">
              перерасход {formatMoney(totalSpent - totalPlan)}
            </span>
          )}
        </div>
      </div>

      <ul className="budget-list">
        {rows.map((r) => (
          <li
            key={r.id}
            className={[r.overspent ? "overspent" : "", r.done ? "done" : ""]
              .join(" ")
              .trim()}
          >
            <div className="budget-row-header">
              <span className="budget-row-name">{r.name}</span>
              <span className="budget-row-amounts">
                {formatMoney(r.spent)} / {formatMoney(r.plan)}
              </span>
            </div>
            <div className="budget-row-bar">
              <div
                className="budget-row-fill"
                style={{ width: `${r.percent}%` }}
              />
            </div>
            <div className="budget-row-footer">
              {r.overspent ? (
                <span className="over">
                  Перерасход: {formatMoney(r.spent - r.plan)}
                </span>
              ) : r.done ? (
                <span className="done-label">Оплачено ✓</span>
              ) : (
                <span className="left">
                  Осталось: {formatMoney(r.remaining)}
                </span>
              )}
              <span className="percent">{r.rawPercent}%</span>
            </div>
          </li>
        ))}

        {otherSpent > 0 && (
          <li className="other">
            <div className="budget-row-header">
              <span className="budget-row-name">Прочее</span>
              <span className="budget-row-amounts">
                {formatMoney(otherSpent)}
              </span>
            </div>
            <div className="budget-row-footer">
              <span className="left">Без привязки к категории</span>
            </div>
          </li>
        )}
      </ul>
    </section>
  );
}
