export const formatMoney = (amount) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

export const getMonthKey = (date = new Date()) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const formatMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split("-");
  const date = new Date(year, month - 1);
  const label = date.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

// Список последних 24 месяцев + следующие 12 (для выбора)
export const buildMonthRange = () => {
  const result = [];
  const now = new Date();
  // 12 месяцев назад ... 12 вперёд
  for (let i = 12; i >= -12; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(getMonthKey(d));
  }
  return result;
};
