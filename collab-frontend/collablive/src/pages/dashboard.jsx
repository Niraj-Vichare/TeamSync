import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Dummy Data
const tasks = [
  { id: 1, title: "Update design components", due: "Tomorrow", labels: ["Contracts", "Design Review"] },
  { id: 2, title: "Review presentation deck", due: "Friday", labels: ["Engineering"] },
  { id: 3, title: "Publish blog post", due: "Tuesday", labels: ["Marketing"] },
  { id: 4, title: "Review header design", due: "Wednesday", labels: ["Social Tracking"] },
];

const projects = [
  { id: 1, name: "Marketing Launch", tasksDue: 3, color: "bg-red-500" },
  { id: 2, name: "Design Project Plan", tasksDue: 10, color: "bg-pink-500" },
  { id: 3, name: "Web Production", tasksDue: 2, color: "bg-purple-500" },
  { id: 4, name: "Accessibility", tasksDue: 5, color: "bg-orange-500" },
];

function Dashboard() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen flex justify-center items-start">
      <div className="w-full max-w-7xl p-5">
        {/* Date and Greeting */}
        <div className="text-center mb-8">
          <p className="text-gray-500">{currentDate}</p>
          <h1 className="text-3xl font-bold">{greeting}, Blake</h1>
          <p className="text-gray-500 mt-1">Here’s an overview of your work</p>
        </div>

        {/* Quick Stats */}
        <div className="flex justify-center gap-6 mb-10">
          <Card className="w-48 rounded-2xl shadow-sm text-center">
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">8</p>
            </CardContent>
          </Card>
          <Card className="w-48 rounded-2xl shadow-sm text-center">
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Tasks Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">42</p>
            </CardContent>
          </Card>
          <Card className="w-48 rounded-2xl shadow-sm text-center">
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">17</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Tasks Section */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">My Tasks</CardTitle>
              <div className="flex space-x-3 text-sm">
                <span className="cursor-pointer text-gray-500 hover:text-black">Upcoming</span>
                <span className="cursor-pointer text-gray-500 hover:text-black">Overdue</span>
                <span className="cursor-pointer text-gray-500 hover:text-black">Completed</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex justify-between items-center border-b pb-3 last:border-none"
                  >
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <div className="flex gap-2 mt-1">
                        {task.labels.map((label, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{task.due}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Projects Section */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">Projects</CardTitle>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition"
                  >
                    <div className={`w-10 h-10 rounded-xl ${project.color}`} />
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-gray-500">
                        {project.tasksDue} tasks due soon
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
