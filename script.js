let allTasks = [];
class Task {
    // Constructor to initialize the task with text, completion status, and a random color
    constructor(text, completed = false) {
        this.text = text;
        this.completed = completed;
        this.color = this.getBrightRandomColor(); // Assign a random bright color
    }

    // Method to create the HTML representation of the task
    createListItem() {
        const listItem = document.createElement('li');
        const taskLabel = document.createElement('label');
        const buttonsContainer = document.createElement('div'); // Container for buttons
        const completeButton = document.createElement('button');

        // Set the task text
        taskLabel.innerText = this.text;

        // Complete button with Font Awesome check icon
        completeButton.innerHTML = '<i class="fas fa-check"></i>';
        completeButton.classList.add('complete-btn');
        completeButton.classList.add('darkmode-ignore');

        // Append the complete button to the buttons container
        buttonsContainer.appendChild(completeButton);

        // Modify and delete buttons with Font Awesome icons
        const modifyButton = document.createElement('button');
        modifyButton.innerHTML = '<i class="fas fa-edit"></i>';
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';

        // Set attributes and classes for task elements
        taskLabel.setAttribute('data-task', this.text);
        listItem.classList.add('task-item');
        taskLabel.classList.add('task-text');
        buttonsContainer.classList.add('task-buttons-container');
        modifyButton.classList.add('modify-btn');
        modifyButton.classList.add('darkmode-ignore');
        deleteButton.classList.add('delete-btn');
        deleteButton.classList.add('darkmode-ignore');

        // Set the background color of the task item
        listItem.style.backgroundColor = this.getBrightRandomColor();

        // Append task elements to the task item
        listItem.appendChild(taskLabel);
        buttonsContainer.appendChild(modifyButton);
        buttonsContainer.appendChild(deleteButton);
        listItem.appendChild(buttonsContainer);

        // Toggle 'completed' class based on completion status
        listItem.classList.toggle('completed', this.completed);

        // Event listener for the delete button
        deleteButton.addEventListener('click', () => {
            listItem.remove();
            updateLocalStorage();
            showToast('Task deleted successfully!', 'error');
        });

        // Event listener for the modify button
        modifyButton.addEventListener('click', () => {
            const updatedText = prompt('Modify the task:', this.text);
            if (updatedText !== null && updatedText.trim() !== '') {
                this.text = updatedText.trim();
                taskLabel.innerText = this.text;
                updateLocalStorage();
                showToast('Task modified successfully!', 'info');
            }
        });

        // Event listener for the complete button
        completeButton.addEventListener('click', () => {
            this.completed = true;
            showToast('Task marked as completed!', 'info');
        });

        // Return the HTML representation of the task
        return listItem;
    }

    // Method to generate a random bright color
    getBrightRandomColor() {
        const letters = '89ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * letters.length)];
        }
        return color;
    }
}


//Helper function
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Event Handlers
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();

    if (taskText !== '') {
        const newTask = new Task(taskText);
        allTasks.push(newTask);
        console.log(`Task added: ${newTask.text}, Completed: ${newTask.completed}`);
        updateLocalStorage();
        updateTaskList(allTasks);
        showToast('Task added successfully!', 'success');

        // Clear the input field
        taskInput.value = '';
    }
}

function updateLocalStorage() {
    const taskList = document.getElementById('taskList');
    const tasks = Array.from(taskList.children).map(taskElement => {
        const task = new Task(
            taskElement.querySelector('label').innerText,
            taskElement.classList.contains('completed')
        );
        task.color = taskElement.style.backgroundColor;
        return task;
    });

    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving to local storage:', error);
    }
}

function deleteTask(listItem) {
    listItem.remove();
    updateLocalStorage();
    showToast('Task deleted successfully!', 'error');
}

function handleDeleteButtonClick(event) {
    const deleteButton = event.target.closest('.delete-btn');
    const modifyButton = event.target.closest('.modify-btn');

    if (deleteButton) {
        const listItem = deleteButton.closest('li');
        deleteTask(listItem);
    } else if (modifyButton) {
        // Handle modify button click (modification logic is already in the Task class)
    }
}

function loadTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem('tasks');

    if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        updateTaskList(tasks); // Pass tasks to updateTaskList
    }
}

//Dark Mode Initialization
const darkemodeOptions = {
    bottom: '92%', // default: '32px'
    right: '4%', // default: '32px'
    left: 'unset', // default: 'unset'
    time: '0.5s', // default: '0.3s'
    mixColor: '#fff', // default: '#fff'
    backgroundColor: '#fff',  // default: '#fff'
    buttonColorDark: '#100f2c',  // default: '#100f2c'
    buttonColorLight: '#fff', // default: '#fff'
    saveInCookies: false, // default: true,
    label: '🌓', // default: ''
    autoMatchOsTheme: true // default: true
}
const darkmode = new Darkmode(darkemodeOptions);
darkmode.showWidget();

//Toast Function
function showToast(message, type = 'info') {
    Toastify({
        text: message,
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: 'bottom', // 'top' or 'bottom'
        position: 'left', // 'left', 'center', or 'right'
        backgroundColor: type === 'error' ? '#ff6666' : '#4CAF50', // Set background color based on type
    }).showToast();
}

// Search functionality
function searchTasks() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim().toLowerCase();
    const filteredTasks = allTasks.filter(task => task.text.toLowerCase().includes(searchTerm));

    updateTaskList(filteredTasks);
}

// Data Export/Import functionality
function exportData() {
    const tasksJSON = JSON.stringify(allTasks);
    const blob = new Blob([tasksJSON], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tasks.json';
    a.click();
}

function importData() {
    const importFile = document.getElementById('importFile');
    const file = importFile.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const importedTasks = JSON.parse(e.target.result);
            // You may want to validate the imported data before updating the task list
            updateTaskList(importedTasks);
        };
        reader.readAsText(file);
    }
}

// Statistics and Analytics functionality
function updateStatistics() {
    const totalTasksElement = document.getElementById('totalTasks');
    const completedTasksElement = document.getElementById('completedTasks');

    totalTasksElement.textContent = allTasks.length;
    const completedTasks = allTasks.filter(task => task.completed).length;
    completedTasksElement.textContent = completedTasks;
}

//Sorting Functions
function sortAlphabetically() {
    // Sort tasks alphabetically by text
    allTasks.sort((taskA, taskB) => {
        const textA = taskA.text.toLowerCase();
        const textB = taskB.text.toLowerCase();
        return textA.localeCompare(textB);
    });

    updateTaskList(allTasks); // Make sure to pass allTasks here
}

function sortByCompletion() {
    // Sort tasks by completion status (completed tasks first)
    allTasks.sort((taskA, taskB) => {
        // Completed tasks come first
        console.log('Sorting:', taskA.text, 'Completed:', taskA.completed);
        console.log('Sorting:', taskB.text, 'Completed:', taskB.completed);

        return taskB.completed - taskA.completed;
    });

    console.log('Tasks after sorting by completion:', allTasks);
    updateTaskList(allTasks);
}

//Update Task List Function
function updateTaskList(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; // Clear the existing list

    tasks.forEach(task => {
        const taskInstance = new Task(task.text, task.completed);
        taskInstance.color = task.color;
        const listItem = taskInstance.createListItem();
        taskList.appendChild(listItem);
    });
}


// Additional event listeners or triggers for the new functionalities
document.getElementById('sortButton').addEventListener('click', sortByCompletion);
document.getElementById('filterButton').addEventListener('click', filterTasks);
document.getElementById('searchInput').addEventListener('input', searchTasks);
document.getElementById('exportButton').addEventListener('click', exportData);
document.getElementById('importButton').addEventListener('click', importData);
document.getElementById('statisticsButton').addEventListener('click', showStatistics);
document.getElementById('taskList').addEventListener('click', handleDeleteButtonClick);

document.addEventListener('DOMContentLoaded', function () {
    loadTasksFromLocalStorage();
});
