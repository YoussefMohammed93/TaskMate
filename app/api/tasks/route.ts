import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, category } = await req.json();

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        done: false,
        category,
      },
    });

    return NextResponse.json(newTask);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creating task" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, done, title, description, category } = await req.json();

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        done,
        title,
        description,
        category,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error updating task" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id, deleteAll } = await req.json();

    if (deleteAll) {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      await prisma.task.deleteMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      return NextResponse.json({
        message: "All tasks created today have been deleted successfully",
      });
    } else if (id) {
      await prisma.task.delete({
        where: { id },
      });

      return NextResponse.json({ message: "Task deleted successfully" });
    }

    return NextResponse.json(
      { error: "No task ID or delete condition provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error deleting task(s)" },
      { status: 500 }
    );
  }
}
