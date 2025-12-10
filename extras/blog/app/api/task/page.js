"use client";
import { useState, useEffect } from "react";
import { Plus, CheckCircle, Circle, Trash2, Sun, Moon } from "lucide-react";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));
    const theme = localStorage.getItem("theme");
    if (theme === "dark") setDark(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  function addTask() {
    if (!input.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: input, done: false }]);
    setInput("");
  }

  function toggleTask(id) {
    setTasks(tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function deleteTask(id) {
    setTasks(tasks.filter(t => t.id !== id));
  }

  return (
    <div className={`${dark ? "dark" : ""} font-sans`}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center p-8">
        <div className="flex justify-between w-full max-w-md mb-6">
          <h1 className="text-3xl font-bold">Task Manager</h1>
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="flex gap-2 mb-6 w-full max-w-md">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTask()}
            placeholder="Add a task..."
            className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
          <button
            onClick={addTask}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={18} /> Add
          </button>
        </div>

        <ul className="w-full max-w-md space-y-3">
          {tasks.map(task => (
            <li
              key={task.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl shadow"
            >
              <button
                onClick={() => toggleTask(task.id)}
                className="flex items-center gap-2 text-left flex-1"
              >
                {task.done ? (
                  <CheckCircle className="text-green-500" size={20} />
                ) : (
                  <Circle className="text-gray-400" size={20} />
                )}
                <span
                  className={task.done ? "line-through text-gray-500 dark:text-gray-400" : ""}
                >
                  {task.text}
                </span>
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={20} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
