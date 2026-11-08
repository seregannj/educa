"use client";

import { Icon } from "@/components/Icon";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useToast } from "@/components/providers/ToastProvider";

export function DailyTask() {
  const { streak, taskDoneToday, completeTask } = useAppState();
  const toast = useToast();

  return (
    <button
      className="daily"
      onClick={() => {
        if (taskDoneToday) {
          toast("Задача дня уже решена — возвращайся завтра");
          return;
        }
        completeTask();
        toast("Стрик продлён 🔥");
      }}
    >
      <span className="dicon">
        <Icon name="bolt" size={20} />
      </span>
      <span>
        <span className="dt">Задача дня</span>
        <span className="ds" style={taskDoneToday ? { color: "var(--good)", fontWeight: 700 } : undefined}>
          {taskDoneToday ? "Готово! Завтра снова" : "5 минут — и стрик твой"}
        </span>
      </span>
      <span className="dstreak" style={{ marginLeft: "auto" }}>
        <Icon name="flame" size={16} style={{ fill: "#FF7A2F", stroke: "none" }} />
        <span>{streak}</span>
      </span>
    </button>
  );
}
