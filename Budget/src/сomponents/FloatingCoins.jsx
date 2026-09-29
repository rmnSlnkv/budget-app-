export default function FloatingCoins() {
  const coins = [
    { kind: "ruble", left: "8%", top: "12%", size: 26, delay: 0, dur: 14 },
    { kind: "dollar", left: "88%", top: "18%", size: 56, delay: 0.6, dur: 15 },
    { kind: "ruble", left: "78%", top: "62%", size: 30, delay: 1.2, dur: 18 },
    { kind: "dollar", left: "14%", top: "42%", size: 48, delay: 2.1, dur: 16 },
    { kind: "ruble", left: "12%", top: "78%", size: 22, delay: 3, dur: 15 },
    { kind: "dollar", left: "62%", top: "8%", size: 52, delay: 1.8, dur: 19 },
    { kind: "ruble", left: "45%", top: "88%", size: 18, delay: 0.8, dur: 17 },
    { kind: "dollar", left: "92%", top: "75%", size: 60, delay: 2.6, dur: 14 },
  ];

  return (
    <div className="coins-layer" aria-hidden="true">
      {coins.map((c, i) => {
        const isDollar = c.kind === "dollar";
        const style = {
          left: c.left,
          top: c.top,
          animationDelay: `${c.delay}s`,
          animationDuration: `${c.dur}s`,
        };

        if (isDollar) {
          // Бумажная купюра: ширина ~2x высоты
          style.width = c.size * 2;
          style.height = c.size;
          style.fontSize = c.size * 0.5;
        } else {
          // Монетка: круг
          style.width = c.size;
          style.height = c.size;
          style.fontSize = c.size * 0.55;
        }

        return (
          <span
            key={i}
            className={isDollar ? "bill bill-dollar" : "coin coin-ruble"}
            style={style}
          >
            {isDollar ? (
              <>
                <span className="bill-corner bill-corner-tl">$</span>
                <span className="bill-corner bill-corner-br">$</span>
                <span className="bill-center">$</span>
              </>
            ) : (
              "₽"
            )}
          </span>
        );
      })}
    </div>
  );
}
