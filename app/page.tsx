"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Main() {
  const tasks = useQuery(api.tasks.get);

  return (
    <main className="w-full h-screen flex items-center justify-center">
      <div>
        {tasks?.map((task) => (
          <div
            key={task._id}
            className={`text-center text-5xl p-5 ${task.isCompleted ? "text-green-500" : "text-red-500"}`}
          >
            {task.text}
          </div>
        ))}
      </div>
    </main>
  );
}
