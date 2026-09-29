import { formatMoney } from "../utils/format";

export default function TransactionList({ transactions, onDelete }) {
  if (transactions.length === 0) {
    return <p className="empty">Пока нет операций за этот месяц</p>;
  }

  return (
    <ul className="transaction-list">
      {transactions.map((t) => (
        <li key={t.id} className={t.type}>
          <div className="tx-info">
            <span className="tx-category">{t.category}</span>
            {t.note && <span className="tx-note">{t.note}</span>}
            <span className="tx-date">
              {new Date(t.date).toLocaleDateString("ru-RU")}
            </span>
          </div>
          <div className="tx-right">
            <span className="tx-amount">
              {t.type === "expense" ? "−" : "+"}
              {formatMoney(t.amount)}
            </span>
            <button
              className="tx-delete"
              onClick={() => onDelete(t.id)}
              aria-label="Удалить"
            >
              ×
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
