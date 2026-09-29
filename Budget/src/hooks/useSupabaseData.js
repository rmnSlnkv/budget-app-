import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

const DEFAULTS = {
  transactions: [],
  salaries: {},
  recurring: [
    { id: "food", name: "Еда", defaultAmount: 30000, type: "expense" },
    { id: "rent", name: "Квартира", defaultAmount: 40000, type: "expense" },
  ],
  overrides: {},
  reminders: [],
  reminders_paid: {},
};

export function useSupabaseData(user) {
  const [data, setData] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      const { data: rows, error } = await supabase
        .from("budget_data")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Ошибка загрузки:", error);
      } else if (rows) {
        setData({
          transactions: rows.transactions ?? DEFAULTS.transactions,
          salaries: rows.salaries ?? DEFAULTS.salaries,
          recurring: rows.recurring ?? DEFAULTS.recurring,
          overrides: rows.overrides ?? DEFAULTS.overrides,
          reminders: rows.reminders ?? DEFAULTS.reminders,
          reminders_paid: rows.reminders_paid ?? DEFAULTS.reminders_paid,
        });
      } else {
        await supabase
          .from("budget_data")
          .insert({ user_id: user.id, ...DEFAULTS });
      }
      setLoading(false);
    };

    load();
  }, [user]);

  const persist = useCallback(
    (newData) => {
      if (!user) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);

      saveTimer.current = setTimeout(async () => {
        setSaving(true);
        const { error } = await supabase.from("budget_data").upsert({
          user_id: user.id,
          ...newData,
          updated_at: new Date().toISOString(),
        });
        if (error) console.error("Ошибка сохранения:", error);
        setSaving(false);
      }, 800);
    },
    [user],
  );

  const update = useCallback(
    (patch) => {
      setData((prev) => {
        const next = { ...prev, ...patch };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  return { data, update, loading, saving };
}
