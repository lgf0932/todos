document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const allTasksBtn = document.getElementById('all-tasks-btn');
    const activeTasksBtn = document.getElementById('active-tasks-btn');
    const completedTasksBtn = document.getElementById('completed-tasks-btn');

    let tasks = [];

    // Load tasks from local storage
    loadTasks();

    addTaskBtn.addEventListener('click', addTask);
    taskList.addEventListener('click', handleTaskClick);
    allTasksBtn.addEventListener('click', () => filterTasks('all'));
    activeTasksBtn.addEventListener('click', () => filterTasks('active'));
    completedTasksBtn.addEventListener('click', () => filterTasks('completed'));

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            tasks.push({ text: taskText, completed: false });
            taskInput.value = '';
            renderTasks();
            saveTasks();
        }
    }

    function handleTaskClick(event) {
        if (event.target.tagName === 'BUTTON') {
            const taskIndex = event.target.dataset.index;
            deleteTask(taskIndex);
        } else if (event.target.tagName === 'LI') {
            const taskIndex = event.target.dataset.index;
            toggleTaskCompleted(taskIndex);
        }
    }

    function deleteTask(index) {
        tasks.splice(index, 1);
        renderTasks();
        saveTasks();
    }

    function toggleTaskCompleted(index) {
        tasks[index].completed = !tasks[index].completed;
        renderTasks();
        saveTasks();
    }

    function renderTasks(filter = 'all') {
        taskList.innerHTML = '';
        const filteredTasks = tasks.filter(task => {
            if (filter === 'active') return !task.completed;
            if (filter === 'completed') return task.completed;
            return true; // 'all'
        });

        filteredTasks.forEach((task, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = task.text;
            listItem.dataset.index = tasks.indexOf(task); // Use original index for modifications

            if (task.completed) {
                listItem.classList.add('completed');
            }

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.dataset.index = tasks.indexOf(task); // Use original index for deletion

            listItem.appendChild(deleteButton);
            taskList.appendChild(listItem);
        });

        updateFilterButtons(filter);
    }

    function filterTasks(filter) {
        renderTasks(filter);
    }

    function updateFilterButtons(activeFilter) {
        allTasksBtn.classList.toggle('active', activeFilter === 'all');
        activeTasksBtn.classList.toggle('active', activeFilter === 'active');
        completedTasksBtn.classList.toggle('active', activeFilter === 'completed');
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
        renderTasks();
    }
});
