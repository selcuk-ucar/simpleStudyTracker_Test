import { useEffect, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

interface Task {
  id: string;
  title: string;
  done: boolean;
  category: string;
}



const tasksForTest: Task[] = [{
  id: "1",
  title: "Task1",
  done: false,
  category: "Math"
},
{
  id: "2",
  title: "Task2",
  done: true,
  category: "Burrito"
}]



function App() {
  const initialTasks = JSON.parse(localStorage.getItem("tasks") || "null") || tasksForTest;
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState("");
  const [importText, setImportText] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // calculate countdown until Dec 5, 2025
  const [expiryTime, setExpiryTime] = useState("15 jul 2022 18:00:00");
  const [countdownTime, setCountdownTime] = useState({
    countdownDays: "",
    countdownHours: "",
    countdownlMinutes: "",
    countdownSeconds: "",
  });

  const countdownTimer = () => {
    const timeInterval = setInterval(() => {
      const countdownDateTime = new Date(expiryTime).getTime();
      const currentTime = new Date().getTime();
      const remainingDayTime = countdownDateTime - currentTime;
      const totalDays = Math.floor(remainingDayTime / (1000 * 60 * 60 * 24));
      const totalHours = Math.floor(
        (remainingDayTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const totalMinutes = Math.floor(
        (remainingDayTime % (1000 * 60 * 60)) / (1000 * 60)
      );
      const totalSeconds = Math.floor(
        (remainingDayTime % (1000 * 60)) / 1000
      );

      const runningCountdownTime = {
        countdownDays: totalDays,
        countdownHours: totalHours,
        countdownMinutes: totalMinutes,
        countdownSeconds: totalSeconds,
      };

      setCountdownTime(runningCountdownTime);

      if (remainingDayTime < 0) {
        clearInterval(timeInterval);
        setExpiryTime(false);
      }
    }, 1000);
  };

  useEffect(() => {
    countdownTimer();
  });
  const changeDone = (clickedTaskId: string) => {

    const newTasks = tasks.map(task =>
      task.id === clickedTaskId ? { ...task, done: !task.done } : task
    )

    setTasks(newTasks);
  }

  const handleChangeForNewTask = (e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewTask(e.target.value);
  }

  const handleChangeCategory = (e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCategory(e.target.value);
  }

  const addNewTask = () => {
    if (!newTask.trim()) return; // don’t add empty task

    const newTaskToAdd: Task = { id: Date.now().toString(), title: newTask, done: false, category: category.toUpperCase() }
    console.log(newTaskToAdd);
    setTasks([...tasks, newTaskToAdd])
    setNewTask("");
  }

  const deleteTask = (taskId: string) => {
    setTasks(tasks => tasks.filter(t => t.id !== taskId));
  };


  const renderTask = (task: Task) => (
    <div
      key={task.id}
      className={`task ${task.done ? "done" : ""}`}
      onClick={() => changeDone(task.id)}
    >
      <span>{task.title}</span>

      <button
        className="delete"
        onClick={(e) => {
          e.stopPropagation(); // prevent toggling done when deleting
          if (confirm("Delete this task?")) deleteTask(task.id);
        }}
      >
        ✕
      </button>
    </div>
  );

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks])


  const tasksByCategory = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    acc[task.category] ??= [];
    acc[task.category].push(task);
    return acc;
  }, {})

  return (
    <div id="container">
      <h1>Study Tracker</h1>
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '25%',
          margin: '0 auto',
          left: 0
        }}
      >
        <iframe
          src="https://www.tickcounter.com/widget/countdown/8961062"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 0,
            overflow: 'hidden'
          }}
          title="Days until finals"
        />
      </div>


      <div id="controls">
        <div id="addTaskForm">
          <input
            id="addTask"
            value={newTask}
            onChange={handleChangeForNewTask}
            placeholder="Enter new task name..."
          />
          <input
            id='category'
            onChange={handleChangeCategory}
            placeholder="Enter a Category"
          >
          </input>
          <button onClick={addNewTask}>Add Task</button>
        </div>

        <div id="exportImport">
          <div id="exportTasks">
            <h2>Export Tasks</h2>
            <textarea readOnly value={JSON.stringify(tasks, null, 2)} rows={6} />
            <button style={{
              backgroundColor: copied ? "green" : undefined,
              color: copied ? "white" : undefined
            }}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    JSON.stringify(tasks, null, 2)
                  );
                  setCopied(true);
                  setTimeout(() => {
                    setCopied(false);
                  }, 2000);
                } catch {
                  alert("Clipboard copy failed");
                }
              }}
            >
              {copied ? "Copied!" : "Copy to clipboard"}
            </button>
          </div>

          <div id="importTasks">
            <h2>Import Tasks</h2>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              rows={6}
            />
            <button
              onClick={() => {
                try {
                  const parsed: Task[] = JSON.parse(importText);
                  setTasks(parsed);
                  setImportText("");
                } catch {
                  alert("Invalid JSON!");
                }
              }}
            >
              Import
            </button>
          </div>
        </div>
      </div>
      <div id='taskColumns'>
        {Object.entries(tasksByCategory).map(([category, tasks]) => (
          <div className="category-column" key={category}>
            <h2>{category}</h2>


            <h3>Ongoing</h3>
            <div className='ongoingTasks'>
              {tasks.filter(t => !t.done).map(renderTask)}
            </div>


            <h3>Completed</h3>
            <div className='completedTasks'>
              {tasks.filter(t => t.done).map(renderTask)}
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}

export default App
