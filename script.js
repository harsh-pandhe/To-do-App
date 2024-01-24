class Task {
    constructor(id, text, completed, dueDate, dueTime, priority) {
        this.id = id;
        this.text = text;
        this.completed = completed;
        this.dueDate = dueDate;
        this.dueTime = dueTime;
        this.priority = priority;
    }
}

function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem('tasks');
    return storedTasks ? JSON.parse(storedTasks) : [];
}
let tasks = loadTasksFromLocalStorage();

function addTask() {
    try {
        let taskInput = document.getElementById("taskInput");

        let taskValue = taskInput.value.trim();

        let priority = document.getElementById("priorityInput").value;

        let dueDate = document.getElementById("dueDateInput").value;
        let dueTime = document.getElementById("dueTimeInput").value;

        if (taskValue !== "" && priority !== "" && dueDate !== "" && dueTime !== "") {
            let task = new Task(
                Date.now(),
                taskValue,
                false,
                dueDate,
                dueTime,
                priority
            );
            tasks.push(task);
            taskInput.value = "";
            document.getElementById("dueDateInput").value = "";
            document.getElementById("dueTimeInput").value = "";
            document.getElementById("priorityInput").value = "";

            displayTasks();
            saveTasksToLocalStorage();

            Toastify({
                text: "Task added successfully!",
                duration: 3000,
                gravity: "bottom",
                position: "right"
            }).showToast();
        } else {
            throw new Error("Please fill in all fields to add a task!");
        }
    } catch (error) {
        console.error("Error adding task:", error.message);
        Toastify({
            text: "An error occurred while adding the task. Please try again.",
            duration: 3000,
            gravity: "bottom",
            position: "right"
        }).showToast();
    }
}


function displayTasks() {
    let tableBody = document.getElementById("taskListTableBody");

    tableBody.innerHTML = "";
    let totalTasks = tasks.length;
    let completedTasks = 0;
    let tasksOverdue = 0;
    let highPriorityTasks = 0;
    let mediumPriorityTasks = 0;
    let lowPriorityTasks = 0;

    updateCharts();

    tasks.forEach(task => {
        if (task.completed) {
            completedTasks++;
        }

        if (task.dueDate && new Date(task.dueDate) < new Date() && !task.completed) {
            tasksOverdue++;
        }

        switch (task.priority) {
            case "High":
                highPriorityTasks++;
                break;
            case "Medium":
                mediumPriorityTasks++;
                break;
            case "Low":
                lowPriorityTasks++;
                break;
        }

        let tableRow = document.createElement("tr");

        tableRow.innerHTML = `
            <td>${task.text}</td>
            <td>${task.dueDate ? task.dueDate : '-'}</td>
            <td>${task.dueTime ? task.dueTime : '-'}</td>
            <td>${task.priority}</td>
            <td id="imp">
                <button class="btn btn-warning btn-sm darkmode-ignore" onclick="modifyTask(${task.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm darkmode-ignore" onclick="removeTask(${task.id})">
                    <i class="fas fa-trash-alt"></i>
                </button>
                <button class="btn darkmode-ignore btn-${task.completed ? 'secondary' : 'success'} btn-sm" onclick="toggleCompletion(${task.id})">
                    <i class="${task.completed ? 'fas fa-undo' : 'fas fa-check'}"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(tableRow);

    });

    document.getElementById("totalTasks").textContent = totalTasks;

    document.getElementById("completedTasks").textContent = completedTasks;

    document.getElementById("tasksOverdue").textContent = tasksOverdue;

    document.getElementById("highPriorityTasks").textContent = highPriorityTasks;
    document.getElementById("mediumPriorityTasks").textContent = mediumPriorityTasks;
    document.getElementById("lowPriorityTasks").textContent = lowPriorityTasks;
}

function modifyTask(taskId) {
    let task = tasks.find(task => task.id === taskId);

    if (!task) {
        console.error(`Task with ID ${taskId} not found.`);
        return;
    }

    document.getElementById('modifiedTaskText').value = task.text;
    document.getElementById('modifiedDueDate').value = task.dueDate;
    document.getElementById('modifiedDueTime').value = task.dueTime;
    document.getElementById('modifiedPriority').value = task.priority;

    let modifyTaskModal = new bootstrap.Modal(document.getElementById('modifyTaskModal'));
    modifyTaskModal.show();

    document.getElementById('modifyTaskForm').addEventListener('submit', function (event) {
        event.preventDefault();
        task.text = document.getElementById('modifiedTaskText').value || task.text;
        task.dueDate = document.getElementById('modifiedDueDate').value || task.dueDate;
        task.dueTime = document.getElementById('modifiedDueTime').value || task.dueTime;
        task.priority = document.getElementById('modifiedPriority').value || task.priority;

        displayTasks();
        saveTasksToLocalStorage();

        modifyTaskModal.hide();

        Toastify({
            text: "Task modified successfully!",
            duration: 3000,
            gravity: "bottom",
            position: "right"
        }).showToast();
    });
}

function toggleCompletion(taskId) {
    let task = tasks.find(task => task.id === taskId);

    if (!task) {
        console.error(`Task with ID ${taskId} not found.`);
        return;
    }

    task.completed = !task.completed;

    displayTasks();
    saveTasksToLocalStorage();
}


function removeTask(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
        tasks.splice(taskIndex, 1);

        displayTasks();
        saveTasksToLocalStorage();
    } else {
        console.error(`Task with ID ${taskId} not found.`);
    }
}


function sortAlphabetically() {
    try {
        tasks.sort((a, b) => a.text.localeCompare(b.text));
        displayTasks();
        saveTasksToLocalStorage();
    } catch (error) {
        console.error("Error sorting alphabetically:", error);
    }
}

function sortByCompletion() {
    try {
        tasks.sort((a, b) => a.completed - b.completed);
        displayTasks();
        saveTasksToLocalStorage();
    } catch (error) {
        console.error("Error sorting by completion:", error);
    }
}


function searchTasks() {
    try {
        let searchInput = document.getElementById("searchInput");

        if (!searchInput) {
            throw new Error("Search input element not found.");
        }

        let searchTerm = searchInput.value.trim().toLowerCase();

        let taskRows = document.querySelectorAll("#taskListTableBody tr");

        if (!taskRows || taskRows.length === 0) {
            throw new Error("No task rows found.");
        }

        taskRows.forEach(taskRow => {
            let taskTextCell = taskRow.querySelector("td:nth-child(1)");
            let taskDueDateCell = taskRow.querySelector("td:nth-child(2)");

            if (!taskTextCell || !taskDueDateCell) {
                throw new Error("Task text cell or due date cell not found in a row.");
            }

            if (taskTextCell.textContent.toLowerCase().includes(searchTerm) || taskDueDateCell.textContent.toLowerCase().includes(searchTerm)) {
                taskRow.style.display = "";
            } else {
                taskRow.style.display = "none";
            }
        });
    } catch (error) {
        console.error("Error in searchTasks:", error.message);

        // Log the error to the browser console
        console.error(error);

        // Notify the user about the error
        Toastify({
            text: "An error occurred while searching for tasks. Please try again.",
            duration: 3000,
            gravity: "bottom",
            position: "right"
        }).showToast();
    }
}


function sortByDueDate() {
    try {
        tasks.sort((a, b) => {
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate + " " + a.dueTime) - new Date(b.dueDate + " " + b.dueTime);
            } else if (a.dueDate) {
                return -1;
            } else if (b.dueDate) {
                return 1;
            } else {
                return 0;
            }
        });
        displayTasks();
        saveTasksToLocalStorage();
    } catch (error) {
        console.error("Error sorting by due date:", error);
    }
}

function exportData() {
    try {
        const tasksJSON = JSON.stringify(tasks);
        const blob = new Blob([tasksJSON], { type: 'application/json' });

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'tasks.json';

        document.body.appendChild(a);

        a.click();

        document.body.removeChild(a);
    } catch (error) {
        console.error('Error exporting data:', error.message);
        Toastify({
            text: 'Error exporting data. Please try again.',
            duration: 3000,
            gravity: 'bottom',
            position: 'right'
        }).showToast();
    }
}

function sortTasksByPriority() {
    try {
        tasks.sort((a, b) => {
            const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        displayTasks();
        saveTasksToLocalStorage();
    } catch (error) {
        console.error("Error sorting by priority:", error);
    }
}

function isTaskOverdue(task) {
    if (task.dueDate && task.dueTime) {
        let dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
        let currentDateTime = new Date();
        return dueDateTime < currentDateTime;
    }
    return false;
}

let tasksChart = null;

function updateCharts() {
    try {
        if (!tasksChart) {
            tasksChartCanvas = document.getElementById("tasksChart");

            if (!tasksChartCanvas) {
                throw new Error("tasksChartCanvas element not found.");
            }

            tasksChart = new Chart(tasksChartCanvas, {
                type: 'bar',
                data: {
                    labels: ['Total Tasks', 'Completed Tasks', 'Tasks Overdue', 'High Priority', 'Medium Priority', 'Low Priority'],
                    datasets: [{
                        label: 'Task Statistics',
                        data: [tasks.length, 0, 0, 0, 0, 0], // Initial values, will be updated later
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(255, 205, 86, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(201, 203, 207, 0.2)',
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 205, 86, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(201, 203, 207, 1)',
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        let completedTasks = tasks.filter(task => task.completed).length;
        let tasksOverdue = tasks.filter(task => isTaskOverdue(task)).length;
        let highPriorityTasks = tasks.filter(task => task.priority === 'High').length;
        let mediumPriorityTasks = tasks.filter(task => task.priority === 'Medium').length;
        let lowPriorityTasks = tasks.filter(task => task.priority === 'Low').length;

        tasksChart.data.datasets[0].data = [tasks.length, completedTasks, tasksOverdue, highPriorityTasks, mediumPriorityTasks, lowPriorityTasks];

        tasksChart.update(); // Update the chart with new data
    } catch (error) {
        console.error("Error in updateCharts:", error.message);
    }
}

updateCharts();

document.addEventListener('DOMContentLoaded', function () {
    try {
        loadTasksFromLocalStorage();
        displayTasks();
        updateCharts();
    } catch (error) {
        console.error('Error during DOMContentLoaded:', error.message);
    }
});


const options = {
    bottom: '93%',
    right: '2%',
    left: 'unset',
    time: '0.5s',
    mixColor: '#fff',
    backgroundColor: '#fff',
    buttonColorDark: '#100f2c',
    buttonColorLight: '#fff',
    saveInCookies: false,
    label: '🌓',
    autoMatchOsTheme: true
}

const darkmode = new Darkmode(options);
try {
    darkmode.showWidget();
} catch (error) {
    console.error("Error initializing Darkmode:", error.message);
    // You can choose to show a user-friendly error message or take appropriate action.
}

