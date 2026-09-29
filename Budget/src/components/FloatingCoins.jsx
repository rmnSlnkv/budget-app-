export default function FloatingCoins() {
  const items = [
    { kind: "ruble", left: "8%", top: "12%", size: 26, delay: 0, dur: 14 },
    { kind: "dollar", left: "88%", top: "18%", size: 56, delay: 0.6, dur: 15 },
    { kind: "bag", left: "72%", top: "42%", size: 44, delay: 1.5, dur: 17 },
    { kind: "ruble", left: "78%", top: "62%", size: 30, delay: 1.2, dur: 18 },
    { kind: "dollar", left: "14%", top: "42%", size: 48, delay: 2.1, dur: 16 },
    { kind: "bag", left: "22%", top: "62%", size: 38, delay: 2.8, dur: 19 },
    { kind: "ruble", left: "12%", top: "78%", size: 22, delay: 3, dur: 15 },
    { kind: "dollar", left: "62%", top: "8%", size: 52, delay: 1.8, dur: 19 },
    { kind: "bag", left: "48%", top: "80%", size: 40, delay: 0.9, dur: 16 },
    { kind: "ruble", left: "45%", top: "88%", size: 18, delay: 0.8, dur: 17 },
    { kind: "dollar", left: "92%", top: "75%", size: 60, delay: 2.6, dur: 14 },
    { kind: "bag", left: "5%", top: "32%", size: 34, delay: 3.4, dur: 20 },
  ];

  return (
    <div className="coins-layer" aria-hidden="true">
      {items.map((c, i) => {
        const style = {
          left: c.left,
          top: c.top,
          animationDelay: `${c.delay}s`,
          animationDuration: `${c.dur}s`,
        };

        if (c.kind === "dollar") {
          // Бумажная купюра: ширина ~2x высоты
          style.width = c.size * 2;
          style.height = c.size;
          style.fontSize = c.size * 0.5;
          return (
            <span key={i} className="bill bill-dollar" style={style}>
              <span className="bill-corner bill-corner-tl">$</span>
              <span className="bill-corner bill-corner-br">$</span>
              <span className="bill-center">$</span>
            </span>
          );
        }

        if (c.kind === "bag") {
          // Мешок с золотом: чуть выше, чем шире
          style.width = c.size;
          style.height = c.size * 1.1;
          return (
            <span key={i} className="money-bag" style={style}>
              <span className="bag-tie" />
              <span className="bag-body">
                <span className="bag-ruble">₽</span>
              </span>
            </span>
          );
        }

        // Рублёвая монетка
        style.width = c.size;
        style.height = c.size;
        style.fontSize = c.size * 0.55;
        return (
          <span key={i} className="coin coin-ruble" style={style}>
            ₽
          </span>
        );
      })}
    </div>
  );
}
