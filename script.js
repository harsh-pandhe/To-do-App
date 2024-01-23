// Task class definition
class Task {
    constructor(text, completed = false) {
        this.text = text;
        this.completed = completed;
        this.color = getRandomColor();
    }

    createListItem() {
        const listItem = document.createElement('li');
        const taskLabel = document.createElement('label');
        taskLabel.innerText = this.text;

        const deleteButton = document.createElement('button');

        // Add Font Awesome delete icon
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';

        // Add class names for styling
        listItem.classList.add('task-item');
        taskLabel.classList.add('task-text');
        deleteButton.classList.add('delete-btn');

        // Use only bright colors
        listItem.style.backgroundColor = this.getBrightRandomColor();

        listItem.appendChild(taskLabel);
        listItem.appendChild(deleteButton);

        listItem.classList.toggle('completed', this.completed);

        deleteButton.addEventListener('click', () => {
            listItem.remove();
            updateLocalStorage();
        });

        return listItem;
    }

    getBrightRandomColor() {
        const letters = '89ABCDEF'; // Use only bright color hex values
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * letters.length)];
        }
        return color;
    }
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');

    const taskText = taskInput.value.trim();

    if (taskText !== '') {
        const newTask = new Task(taskText);
        const listItem = newTask.createListItem();
        taskList.appendChild(listItem);
        taskInput.value = '';
        updateLocalStorage();
        showToast('Task added successfully!', 'success');

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

// Event delegation for delete buttons
function handleDeleteButtonClick(event) {
    const deleteButton = event.target.closest('button');
    if (deleteButton) {
        const listItem = deleteButton.closest('li');
        deleteTask(listItem);
    }
}

function loadTasksFromLocalStorage() {
    const taskList = document.getElementById('taskList');
    const storedTasks = localStorage.getItem('tasks');

    if (storedTasks) {
        const tasks = JSON.parse(storedTasks);

        tasks.forEach(task => {
            const taskInstance = new Task(task.text, task.completed);
            taskInstance.color = task.color;
            const listItem = taskInstance.createListItem();
            taskList.appendChild(listItem);
        });
    }
}

// Event delegation for delete buttons
document.getElementById('taskList').addEventListener('click', handleDeleteButtonClick);

document.addEventListener('DOMContentLoaded', function () {
    loadTasksFromLocalStorage();
});


const options = {
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

const darkmode = new Darkmode(options);
darkmode.showWidget();


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
