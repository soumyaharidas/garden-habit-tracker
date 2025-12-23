"use client";

import { useEffect, useMemo, useState } from "react";

type TaskStatus = "pending" | "completed";

type Task = {
  id: string;
  title: string;
  difficulty: 1 | 2 | 3;
  dateISO: string;
  status: TaskStatus;
  completedAt: string | null;
};

type FlowerType = "Daisy" | "Tulip" | "Rose";

type Flower = {
  id: string;
  dateISO: string;
  taskId: string;
  type: FlowerType;
  x: number;
  y: number;
  createdAt: string;
};

const STORAGE_KEY = "bloom:v1";
const GRID_COLUMNS = 6;
const GRID_ROWS = 4;

const flowerByDifficulty: Record<Task["difficulty"], FlowerType> = {
  1: "Daisy",
  2: "Tulip",
  3: "Rose"
};

const flowerEmoji: Record<FlowerType, string> = {
  Daisy: "🌼",
  Tulip: "🌷",
  Rose: "🌹"
};

const flowerAccent: Record<FlowerType, string> = {
  Daisy: "bg-clay-100 text-clay-700",
  Tulip: "bg-moss-100 text-moss-700",
  Rose: "bg-clay-200 text-clay-800"
};

const getTodayISO = () => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
};

const safeParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

type StorageShape = {
  tasksByDate: Record<string, Task[]>;
  flowersByDate: Record<string, Flower[]>;
};

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function Home() {
  const todayISO = useMemo(() => getTodayISO(), []);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Task["difficulty"]>(1);
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = safeParse<StorageShape>(
      localStorage.getItem(STORAGE_KEY),
      { tasksByDate: {}, flowersByDate: {} }
    );
    setTasks(stored.tasksByDate[todayISO] ?? []);
    setFlowers(stored.flowersByDate[todayISO] ?? []);
  }, [todayISO]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = safeParse<StorageShape>(
      localStorage.getItem(STORAGE_KEY),
      { tasksByDate: {}, flowersByDate: {} }
    );
    const updated: StorageShape = {
      tasksByDate: { ...stored.tasksByDate, [todayISO]: tasks },
      flowersByDate: { ...stored.flowersByDate, [todayISO]: flowers }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [tasks, flowers, todayISO]);

  const selectedTask = selectedFlower
    ? tasks.find((task) => task.id === selectedFlower.taskId) ?? null
    : null;

  const handleAddTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const newTask: Task = {
      id: createId(),
      title: trimmed,
      difficulty,
      dateISO: todayISO,
      status: "pending",
      completedAt: null
    };

    setTasks((prev) => [newTask, ...prev]);
    setTitle("");
    setDifficulty(1);
  };

  const findNextPlot = (flowerList: Flower[]) => {
    for (let row = 0; row < GRID_ROWS; row += 1) {
      for (let col = 0; col < GRID_COLUMNS; col += 1) {
        const occupied = flowerList.some(
          (flower) => flower.x === col && flower.y === row
        );
        if (!occupied) {
          return { x: col, y: row };
        }
      }
    }
    return null;
  };

  const completeTask = (task: Task) => {
    if (task.status === "completed") return;
    const completedAt = new Date().toISOString();

    setTasks((prev) =>
      prev.map((item) =>
        item.id === task.id
          ? { ...item, status: "completed", completedAt }
          : item
      )
    );

    setFlowers((prev) => {
      const alreadyPlanted = prev.some((flower) => flower.taskId === task.id);
      if (alreadyPlanted) return prev;

      const todaysFlowerList = prev.filter(
        (flower) => flower.dateISO === todayISO
      );
      const nextPlot = findNextPlot(todaysFlowerList);
      if (!nextPlot) return prev;

      const newFlower: Flower = {
        id: createId(),
        dateISO: todayISO,
        taskId: task.id,
        type: flowerByDifficulty[task.difficulty],
        x: nextPlot.x,
        y: nextPlot.y,
        createdAt: completedAt
      };

      return [...prev, newFlower];
    });
  };

  const handleResetToday = () => {
    setTasks((prev) => prev.filter((task) => task.dateISO !== todayISO));
    setFlowers((prev) => prev.filter((flower) => flower.dateISO !== todayISO));
    setSelectedFlower(null);
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-moss-500">
          Welcome back to
        </p>
        <h1 className="text-4xl font-semibold text-moss-900 sm:text-5xl">
          Bloom
        </h1>
        <p className="max-w-2xl text-base text-moss-700">
          A cozy home for your rituals, garden progress, and daily reflections.
          Tend today's intentions and watch your habits grow.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="section-card flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-moss-900">
                Today's Tasks
              </h2>
              <button
                type="button"
                onClick={handleResetToday}
                className="rounded-full border border-moss-200 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-moss-500 transition hover:border-moss-300 hover:text-moss-700"
              >
                Reset today
              </button>
            </div>
            <p className="text-sm text-moss-600">
              Add a gentle focus and earn a new bloom for your garden.
            </p>
            <p className="text-xs text-moss-400">
              Loaded {tasks.length} tasks, {flowers.length} flowers for {todayISO}
            </p>
          </div>

          <form className="grid gap-3 sm:grid-cols-[1fr_auto_auto]" onSubmit={handleAddTask}>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Add a task for today"
              className="w-full rounded-2xl border border-moss-100 bg-white/80 px-4 py-3 text-sm text-moss-700 shadow-sm focus:border-moss-300 focus:outline-none"
            />
            <div className="flex items-center gap-2 rounded-2xl border border-moss-100 bg-white/80 px-3">
              <span className="text-xs uppercase tracking-[0.2em] text-moss-500">
                Difficulty
              </span>
              <select
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(Number(event.target.value) as Task["difficulty"])
                }
                className="bg-transparent text-sm text-moss-700 focus:outline-none"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
            <button
              type="submit"
              className="rounded-2xl bg-moss-800 px-4 py-3 text-sm font-medium text-white shadow-soft transition hover:bg-moss-700"
            >
              Add task
            </button>
          </form>

          <div className="flex flex-col gap-3">
            {tasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-moss-200 bg-moss-50/60 px-4 py-6 text-center text-sm text-moss-500">
                No tasks yet. Add one to plant your first flower.
              </div>
            ) : (
              tasks.map((task) => (
                <label
                  key={task.id}
                  className="flex cursor-pointer items-center justify-between rounded-2xl border border-moss-100 bg-moss-50/80 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.status === "completed"}
                      onChange={() => completeTask(task)}
                      className="h-4 w-4 rounded border-moss-300 text-moss-700 focus:ring-moss-500"
                    />
                    <div>
                      <p
                        className={`text-sm ${
                          task.status === "completed"
                            ? "text-moss-400 line-through"
                            : "text-moss-800"
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs uppercase tracking-[0.2em] text-moss-400">
                        Difficulty {task.difficulty}
                      </p>
                    </div>
                  </div>
                  {task.status === "completed" ? (
                    <span className="text-xs font-medium text-moss-500">
                      Completed
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-moss-500">Open</span>
                  )}
                </label>
              ))
            )}
          </div>
        </div>

        <div className="section-card flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-moss-900">Motivation</h2>
            <p className="text-sm text-moss-600">
              A small note to nurture your momentum.
            </p>
          </div>
          <div className="flex flex-1 flex-col justify-between rounded-2xl bg-clay-50/80 p-4">
            <p className="text-base text-moss-700">
              Consistency creates calm. Show up gently, and your garden will
              mirror your care.
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-clay-500">
              Daily mantra
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="section-card flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-moss-900">Garden</h2>
            <p className="text-sm text-moss-600">
              Each completed task plants a bloom in today's 6x4 plot.
            </p>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}>
            {Array.from({ length: GRID_COLUMNS * GRID_ROWS }).map((_, index) => {
              const x = index % GRID_COLUMNS;
              const y = Math.floor(index / GRID_COLUMNS);
              const flower = flowers.find(
                (item) => item.x === x && item.y === y
              );

              return (
                <div
                  key={`plot-${x}-${y}`}
                  className="flex h-20 items-center justify-center rounded-2xl border border-dashed border-moss-200 bg-moss-50/60"
                >
                  {flower ? (
                    <button
                      type="button"
                      onClick={() => setSelectedFlower(flower)}
                      className={`flower-bloom flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-soft transition hover:scale-105 ${
                        flowerAccent[flower.type]
                      }`}
                    >
                      {flowerEmoji[flower.type]}
                    </button>
                  ) : (
                    <span className="text-xs uppercase tracking-[0.2em] text-moss-300">
                      empty
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-moss-500">
            Daisy = easy, Tulip = medium, Rose = challenging.
          </p>
        </div>

        <div className="section-card flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-moss-900">Journal</h2>
            <p className="text-sm text-moss-600">
              Capture today's reflections.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {[
              "What did your garden teach you today?",
              "Which habit felt most nourishing?"
            ].map((prompt) => (
              <div
                key={prompt}
                className="rounded-2xl border border-moss-100 bg-white/80 px-4 py-3"
              >
                <p className="text-sm text-moss-700">{prompt}</p>
              </div>
            ))}
            <button className="rounded-2xl border border-moss-200 bg-moss-800 px-4 py-3 text-sm font-medium text-white shadow-soft transition hover:bg-moss-700">
              Open journal
            </button>
          </div>
        </div>
      </section>

      {selectedFlower && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-moss-900/30 px-6">
          <div className="section-card w-full max-w-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-moss-500">
                  Bloom detail
                </p>
                <h3 className="text-xl font-semibold text-moss-900">
                  {selectedTask?.title ?? "Unknown task"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFlower(null)}
                className="rounded-full border border-moss-200 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-moss-500"
              >
                Close
              </button>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-moss-50/80 px-4 py-3">
              <span className="text-2xl">{flowerEmoji[selectedFlower.type]}</span>
              <div>
                <p className="text-sm font-medium text-moss-800">
                  {selectedFlower.type}
                </p>
                <p className="text-xs text-moss-500">
                  Planted {new Date(selectedFlower.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
