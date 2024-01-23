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
// Function to save tasks to local storage
function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to load tasks from local storage
function loadTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem('tasks');
    return storedTasks ? JSON.parse(storedTasks) : [];
}

// Initialize tasks by loading from local storage
let tasks = loadTasksFromLocalStorage();

// Function to add a new task
function addTask() {
    // Get the task input element
    let taskInput = document.getElementById("taskInput");

    // Get the value of the task input
    let taskValue = taskInput.value.trim();

    // Get the priority value
    let priority = document.getElementById("priorityInput").value;

    // Get the due date and time values
    let dueDate = document.getElementById("dueDateInput").value;
    let dueTime = document.getElementById("dueTimeInput").value;

    // Check if all necessary values are filled
    if (taskValue !== "" && priority !== "" && dueDate !== "" && dueTime !== "") {
        // Create a task object with a unique ID, completion status, due date, time, and priority
        let task = new Task(
            Date.now(),
            taskValue,
            false,
            dueDate,
            dueTime,
            priority
        );

        // Add the task to the tasks array
        tasks.push(task);

        // Clear the input fields
        taskInput.value = "";
        document.getElementById("dueDateInput").value = "";
        document.getElementById("dueTimeInput").value = "";
        document.getElementById("priorityInput").value = "";

        // Update the task list display
        displayTasks();
        saveTasksToLocalStorage();

        // You can also add a success notification using Toastify
        Toastify({
            text: "Task added successfully!",
            duration: 3000,
            gravity: "bottom",
            position: "right"
        }).showToast();
    } else {
        // If any of the values is empty, display an error notification
        Toastify({
            text: "Please fill in all fields to add a task!",
            duration: 3000,
            gravity: "bottom",
            position: "right"
        }).showToast();
    }
}

// Function to display tasks in the list
function displayTasks() {
    // Get the task list element
    let tableBody = document.getElementById("taskListTableBody");

    tableBody.innerHTML = "";

    // Initialize statistics variables
    let totalTasks = tasks.length;
    let completedTasks = 0;
    let tasksOverdue = 0;
    let highPriorityTasks = 0;
    let mediumPriorityTasks = 0;
    let lowPriorityTasks = 0;

    // Call the updateCharts function whenever you update the statistics
    updateCharts();

    // Iterate through the tasks array and create list items
    tasks.forEach(task => {
        // Update statistics based on task properties
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

        // Create a list item element
        let tableRow = document.createElement("tr");

        // Set the content of the list item
        tableRow.innerHTML = `
            <td>${task.text}</td>
            <td>${task.dueDate ? task.dueDate : '-'}</td>
            <td>${task.dueTime ? task.dueTime : '-'}</td>
            <td>${task.priority}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="modifyTask(${task.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="removeTask(${task.id})">
                    <i class="fas fa-trash-alt"></i>
                </button>
                <button class="btn btn-${task.completed ? 'secondary' : 'success'} btn-sm" onclick="toggleCompletion(${task.id})">
                    <i class="${task.completed ? 'fas fa-undo' : 'fas fa-check'}"></i>
                </button>
            </td>
        `;


        // Add the list item to the task list
        tableBody.appendChild(tableRow);

    });

    // Update the total tasks count
    document.getElementById("totalTasks").textContent = totalTasks;

    // Update the completed tasks count
    document.getElementById("completedTasks").textContent = completedTasks;

    // Update tasks overdue count
    document.getElementById("tasksOverdue").textContent = tasksOverdue;

    // Update priority tasks count
    document.getElementById("highPriorityTasks").textContent = highPriorityTasks;
    document.getElementById("mediumPriorityTasks").textContent = mediumPriorityTasks;
    document.getElementById("lowPriorityTasks").textContent = lowPriorityTasks;
}


// Function to modify a task
function modifyTask(taskId) {
    // Find the task with the specified ID in the tasks array
    let task = tasks.find(task => task.id === taskId);

    // Set the initial values in the modal
    document.getElementById('modifiedTaskText').value = task.text;
    document.getElementById('modifiedDueDate').value = task.dueDate;
    document.getElementById('modifiedDueTime').value = task.dueTime;
    document.getElementById('modifiedPriority').value = task.priority;

    // Show the modal
    let modifyTaskModal = new bootstrap.Modal(document.getElementById('modifyTaskModal'));
    modifyTaskModal.show();

    // Handle the form submission
    document.getElementById('modifyTaskForm').addEventListener('submit', function (event) {
        event.preventDefault();

        // Update task details
        task.text = document.getElementById('modifiedTaskText').value;
        task.dueDate = document.getElementById('modifiedDueDate').value;
        task.dueTime = document.getElementById('modifiedDueTime').value;
        task.priority = document.getElementById('modifiedPriority').value;

        // Update the task list display
        displayTasks();
        saveTasksToLocalStorage();

        // Hide the modal
        modifyTaskModal.hide();

        // Show a success notification using Toastify
        Toastify({
            text: "Task modified successfully!",
            duration: 3000,
            gravity: "bottom",
            position: "right"
        }).showToast();
    });
}

// Function to toggle the completion status of a task
function toggleCompletion(taskId) {
    // Find the task with the specified ID in the tasks array
    let task = tasks.find(task => task.id === taskId);

    // Toggle the completion status of the task
    task.completed = !task.completed;

    // Update the task list display
    displayTasks();
    saveTasksToLocalStorage();

}

// Function to remove a task
function removeTask(taskId) {
    // Remove the task with the specified ID from the tasks array
    tasks = tasks.filter(task => task.id !== taskId);

    // Update the task list display
    displayTasks();
    saveTasksToLocalStorage();

}



// Function to sort tasks alphabetically
function sortAlphabetically() {
    tasks.sort((a, b) => a.text.localeCompare(b.text));
    displayTasks();
    saveTasksToLocalStorage();

}

// Function to sort tasks by completion status
function sortByCompletion() {
    tasks.sort((a, b) => a.completed - b.completed);
    displayTasks();
    saveTasksToLocalStorage();

}

function searchTasks() {
    // Get the search input element
    let searchInput = document.getElementById("searchInput");

    // Get the value of the search input
    let searchTerm = searchInput.value.trim().toLowerCase();

    // Get all task rows
    let taskRows = document.querySelectorAll("#taskListTableBody tr");

    // Iterate through the task rows and toggle visibility
    taskRows.forEach(taskRow => {
        let taskTextCell = taskRow.querySelector("td:nth-child(1)"); // Assuming the task text is in the first cell
        let taskDueDateCell = taskRow.querySelector("td:nth-child(2)"); // Assuming the due date is in the second cell

        // Check if the task text or due date includes the search term
        if (taskTextCell.textContent.toLowerCase().includes(searchTerm) || taskDueDateCell.textContent.toLowerCase().includes(searchTerm)) {
            taskRow.style.display = ""; // Show the task
        } else {
            taskRow.style.display = "none"; // Hide the task
        }
    });
}


// Function to sort tasks by due date
function sortByDueDate() {
    tasks.sort((a, b) => {
        if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate + " " + a.dueTime) - new Date(b.dueDate + " " + b.dueTime);
        } else if (a.dueDate) {
            return -1; // Tasks with due date come first
        } else if (b.dueDate) {
            return 1; // Tasks with due date come first
        } else {
            return 0; // No due date for both tasks
        }
    });
    displayTasks();
    saveTasksToLocalStorage();

}


// Function to export data (for demonstration purposes)
function exportData() {
    // Convert tasks array to JSON string
    const tasksJSON = JSON.stringify(tasks);

    // Create a Blob containing the JSON data
    const blob = new Blob([tasksJSON], { type: 'application/json' });

    // Create a temporary anchor element
    const a = document.createElement('a');

    // Set the download attribute and create a download link
    a.href = URL.createObjectURL(blob);
    a.download = 'tasks.json';

    // Append the anchor to the document
    document.body.appendChild(a);

    // Trigger a click on the anchor to start the download
    a.click();

    // Remove the anchor from the document
    document.body.removeChild(a);
}

// Function to sort tasks by priority
function sortTasksByPriority() {
    tasks.sort((a, b) => {
        const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    displayTasks();
    saveTasksToLocalStorage();

}
// Function to check if a task is overdue
function isTaskOverdue(task) {
    if (task.dueDate && task.dueTime) {
        let dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
        let currentDateTime = new Date();
        return dueDateTime < currentDateTime;
    }
    return false;
}
let tasksChart = null; // Variable to store the chart instance

// Function to update charts
function updateCharts() {
    // Check if the chart instance exists and destroy it
    if (tasksChart) {
        tasksChart.destroy();
    }

    // Calculate dynamic values
    let completedTasks = tasks.filter(task => task.completed).length;
    let tasksOverdue = tasks.filter(task => isTaskOverdue(task)).length;
    let highPriorityTasks = tasks.filter(task => task.priority === 'High').length;
    let mediumPriorityTasks = tasks.filter(task => task.priority === 'Medium').length;
    let lowPriorityTasks = tasks.filter(task => task.priority === 'Low').length;

    // Get the canvas element
    let tasksChartCanvas = document.getElementById("tasksChart");

    // Create a new bar chart
    tasksChart = new Chart(tasksChartCanvas, {
        type: 'bar',
        data: {
            labels: ['Total Tasks', 'Completed Tasks', 'Tasks Overdue', 'High Priority', 'Medium Priority', 'Low Priority'],
            datasets: [{
                label: 'Task Statistics',
                data: [tasks.length, completedTasks, tasksOverdue, highPriorityTasks, mediumPriorityTasks, lowPriorityTasks],
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

// Call the updateCharts function whenever you update the statistics
updateCharts();

document.addEventListener('DOMContentLoaded', function () {
    loadTasksFromLocalStorage();
    displayTasks();
});

const options = {
    bottom: '64px', // default: '32px'
    right: 'unset', // default: '32px'
    left: '32px', // default: 'unset'
    time: '0.5s', // default: '0.3s'
    mixColor: '#fff', // default: '#fff'
    backgroundColor: '#fff',  // default: '#fff'
    buttonColorDark: '#100f2c',  // default: '#100f2c'
    buttonColorLight: '#fff', // default: '#fff'
    saveInCookies: false, // default: true,
    label: '🌓', // default: ''
    autoMatchOsTheme: true // default: true
}

const darkmode = new Darkmode(options);
darkmode.showWidget();
