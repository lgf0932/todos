// Mock localStorage for testing environment
if (typeof localStorage === 'undefined' || localStorage === null) {
    let store = {};
    global.localStorage = {
        getItem: key => store[key] || null,
        setItem: (key, value) => store[key] = value.toString(),
        removeItem: key => delete store[key],
        clear: () => store = {}
    };
}

// Mock DOM elements needed for script.js
document.body.innerHTML = `
    <input type="text" id="task-input">
    <button id="add-task-btn">Add Task</button>
    <ul id="task-list"></ul>
    <button id="all-tasks-btn">All</button>
    <button id="active-tasks-btn">Active</button>
    <button id="completed-tasks-btn">Completed</button>
`;

// Import functions to be tested (assuming they are globally available or can be imported if using modules)
// For this environment, we'll assume script.js has run and populated the global namespace
// or we need to ensure script.js is loaded before tests.js in index.html

console.log("Starting tests...");

// --- Test Helper Functions ---
function assert(condition, message) {
    if (!condition) {
        console.error("Assertion Failed:", message);
    } else {
        console.log("Assertion Passed:", message);
    }
}

function resetTestData() {
    localStorage.clear();
    tasks = []; // Assuming 'tasks' is a global variable in script.js
    if (typeof renderTasks === 'function') { // renderTasks might not be global if script.js is modular
        renderTasks();
    }
    document.getElementById('task-input').value = '';
    console.log("Test data reset.");
}

// --- Test Suites ---

function testAddTask() {
    console.log("\n--- Testing Add Task ---");
    resetTestData();

    // Mock functions from script.js if they are not directly testable or have side effects not desired here
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn'); // Or directly call addTask()

    // Test adding a valid task
    taskInput.value = "Test Task 1";
    // Simulate button click or call function directly
    if (typeof addTask === 'function') addTask(); else document.dispatchEvent(new Event('DOMContentLoaded')); addTask();


    assert(tasks.length === 1, "Task should be added to the tasks array.");
    assert(tasks[0].text === "Test Task 1", "Task text should be correct.");
    assert(tasks[0].completed === false, "New task should be incomplete by default.");

    // Test adding an empty task
    taskInput.value = "";
    if (typeof addTask === 'function') addTask();
    assert(tasks.length === 1, "Empty task should not be added.");

    // Test adding a task with whitespace only
    taskInput.value = "   ";
    if (typeof addTask === 'function') addTask();
    assert(tasks.length === 1, "Whitespace-only task should not be added.");

    // Test adding multiple tasks
    taskInput.value = "Test Task 2";
    if (typeof addTask === 'function') addTask();
    taskInput.value = "Test Task 3";
    if (typeof addTask === 'function') addTask();
    assert(tasks.length === 3, "Multiple tasks should be added successfully.");
    console.log("Add Task tests finished.");
}

function testDeleteTask() {
    console.log("\n--- Testing Delete Task ---");
    resetTestData();
    // Add some tasks to delete
    tasks.push({ text: "Task A", completed: false });
    tasks.push({ text: "Task B", completed: true });
    tasks.push({ text: "Task C", completed: false });
    if (typeof renderTasks === 'function') renderTasks();


    // Test deleting a task
    if (typeof deleteTask === 'function') deleteTask(1); // Delete "Task B"
    assert(tasks.length === 2, "Task should be deleted from the tasks array.");
    assert(tasks.every(task => task.text !== "Task B"), "Correct task should be deleted.");
    assert(tasks[0].text === "Task A", "Remaining tasks should maintain order (Task A).");
    assert(tasks[1].text === "Task C", "Remaining tasks should maintain order (Task C).");

    // Test deleting the first task
    if (typeof deleteTask === 'function') deleteTask(0); // Delete "Task A"
    assert(tasks.length === 1, "First task should be deleted.");
    assert(tasks[0].text === "Task C", "Remaining task should be correct after deleting first.");

    // Test deleting the last task
    tasks.push({ text: "Task D", completed: false }); // Add another task
    if (typeof renderTasks === 'function') renderTasks();
    if (typeof deleteTask === 'function') deleteTask(1); // Delete "Task D"
    assert(tasks.length === 1, "Last task should be deleted.");
    assert(tasks[0].text === "Task C", "Remaining task should be correct after deleting last.");

    // Test deleting from an empty list (should not error)
    resetTestData();
    assert(tasks.length === 0, "Tasks array should be empty before delete.");
    if (typeof deleteTask === 'function') deleteTask(0);
    assert(tasks.length === 0, "Deleting from empty list should not change tasks array.");


    console.log("Delete Task tests finished.");
}

function testToggleTaskCompleted() {
    console.log("\n--- Testing Toggle Task Completed ---");
    resetTestData();
    tasks.push({ text: "Task X", completed: false });
    tasks.push({ text: "Task Y", completed: true });
    if (typeof renderTasks === 'function') renderTasks();

    // Mark task as complete
    if (typeof toggleTaskCompleted === 'function') toggleTaskCompleted(0); // Mark "Task X" as complete
    assert(tasks[0].completed === true, "Task X should be marked as complete.");

    // Mark task as active (incomplete)
    if (typeof toggleTaskCompleted === 'function') toggleTaskCompleted(0); // Mark "Task X" as active again
    assert(tasks[0].completed === false, "Task X should be marked as active.");

    // Toggle a task that is already completed
    if (typeof toggleTaskCompleted === 'function') toggleTaskCompleted(1); // Mark "Task Y" as active
    assert(tasks[1].completed === false, "Task Y should be marked as active.");
    console.log("Toggle Task Completed tests finished.");
}


function testFilterTasks() {
    console.log("\n--- Testing Filter Tasks ---");
    resetTestData();
    tasks.push({ text: "Active Task 1", completed: false });
    tasks.push({ text: "Completed Task 1", completed: true });
    tasks.push({ text: "Active Task 2", completed: false });
    tasks.push({ text: "Completed Task 2", completed: true });
    if (typeof renderTasks === 'function') renderTasks(); // Initial render with all tasks

    // Mock taskList.innerHTML modification for testing filter effects
    const taskList = document.getElementById('task-list');
    let originalRenderTasks = null;
    if (typeof renderTasks === 'function') { // Ensure renderTasks is defined
        originalRenderTasks = renderTasks; // Save original renderTasks
    }

    // Helper to count rendered items based on class or content
    const countRenderedItems = () => taskList.getElementsByTagName('li').length;
    const countCompletedRenderedItems = () => taskList.querySelectorAll('li.completed').length;
    const countActiveRenderedItems = () => {
        let count = 0;
        const items = taskList.getElementsByTagName('li');
        for (let item of items) {
            if (!item.classList.contains('completed')) {
                count++;
            }
        }
        return count;
    };


    // Test 'all' filter
    if (typeof filterTasks === 'function') filterTasks('all'); else if (originalRenderTasks) originalRenderTasks('all');
    assert(countRenderedItems() === 4, "Filter 'all' should display all 4 tasks.");

    // Test 'active' filter
    if (typeof filterTasks === 'function') filterTasks('active'); else if (originalRenderTasks) originalRenderTasks('active');
    assert(countRenderedItems() === 2, "Filter 'active' should display 2 tasks.");
    assert(countActiveRenderedItems() === 2, "Filter 'active' should only display active tasks.");


    // Test 'completed' filter
    if (typeof filterTasks === 'function') filterTasks('completed'); else if (originalRenderTasks) originalRenderTasks('completed');
    assert(countRenderedItems() === 2, "Filter 'completed' should display 2 tasks.");
    assert(countCompletedRenderedItems() === 2, "Filter 'completed' should only display completed tasks.");

    // Restore original renderTasks if it was mocked/wrapped
    if (originalRenderTasks && typeof renderTasks === 'function') {
        renderTasks = originalRenderTasks;
    }
    console.log("Filter Tasks tests finished.");
}


function testLocalStorage() {
    console.log("\n--- Testing Local Storage ---");
    resetTestData();

    // Add some tasks
    tasks.push({ text: "Storage Task 1", completed: false });
    tasks.push({ text: "Storage Task 2", completed: true });

    // Test saving tasks
    if (typeof saveTasks === 'function') saveTasks();
    const saved = localStorage.getItem('tasks');
    assert(saved !== null, "Tasks should be saved to localStorage.");
    const parsedSaved = JSON.parse(saved);
    assert(parsedSaved.length === 2, "Saved data should contain 2 tasks.");
    assert(parsedSaved[0].text === "Storage Task 1", "Saved task text should match.");
    assert(parsedSaved[1].completed === true, "Saved task completion status should match.");

    // Test loading tasks
    tasks = []; // Clear current tasks array
    if (typeof loadTasks === 'function') loadTasks();
    assert(tasks.length === 2, "Tasks should be loaded from localStorage.");
    assert(tasks[0].text === "Storage Task 1", "Loaded task text should match.");
    assert(tasks[1].completed === true, "Loaded task completion status should match.");

    // Test loading when localStorage is empty
    resetTestData(); // Clears localStorage and tasks array
    if (typeof loadTasks === 'function') loadTasks();
    assert(tasks.length === 0, "Loading from empty localStorage should result in an empty tasks array.");

    console.log("Local Storage tests finished.");
}

// --- Run Tests ---
function runAllTests() {
    // Ensure DOM is fully loaded and script.js has run
    // It's better to run this after DOMContentLoaded in a real browser scenario
    // For this controlled environment, we assume script.js functions are available.
    // We might need to explicitly call the init function from script.js if it has one.

    // A small delay to ensure script.js might have initialized, if it has async parts or relies on DOMContentLoaded
    // This is a bit of a hack for non-browser/Node test environments.
    // Proper module imports/exports or a test runner would handle this better.
    if (typeof addTask !== 'function') {
        console.warn("script.js functions not found globally. Attempting to re-trigger DOMContentLoaded for script.js initialization.");
        // This is a workaround. In a real test setup, you'd import modules or use a test runner.
        document.dispatchEvent(new Event('DOMContentLoaded'));
    }


    // Call the global functions from script.js if they exist
    // This is a simplified way, assuming script.js makes its functions globally available or they are attached to DOM event listeners
    // that are triggered by DOMContentLoaded.

    testAddTask();
    testDeleteTask();
    testToggleTaskCompleted();
    testFilterTasks();
    testLocalStorage();

    console.log("\nAll tests finished.");
}

// Run tests if not in a browser environment that auto-runs script.js,
// or if script.js doesn't auto-initialize everything needed for tests.
// In a browser, script.js would run, then tests.js.
// If script.js uses DOMContentLoaded, tests need to run after that.
if (typeof window === 'undefined') { // Simple check if not in browser-like env
    runAllTests();
} else {
    // In a browser, ensure script.js runs first and initializes.
    // If script.js initializes on DOMContentLoaded, tests should run after that.
    document.addEventListener('DOMContentLoaded', () => {
        // This ensures script.js's DOMContentLoaded listener has fired.
        // However, tasks, addTask, etc., might not be global.
        // This testing setup is simplified and has limitations.

        // If script.js functions are global, they can be called directly.
        // If they are not (e.g., inside an IIFE or module), this approach won't work
        // without modification to script.js to expose them for testing.

        // For the current structure of script.js (using DOMContentLoaded and global-like functions),
        // we need to ensure its DOMContentLoaded handler has run.
        // Let's assume script.js has already run and its functions are somehow accessible
        // or that its event listeners have been set up.
        // The `tasks` array also needs to be accessible.
        // If script.js is like: `let tasks = []; function addTask() {...} window.addTask = addTask;`
        // then tests.js can call `window.addTask()`.
        // If `tasks` is not global, tests for `addTask` would need to check side effects (e.g., localStorage, UI changes).

        // Given the current script.js, its functions are scoped within its DOMContentLoaded.
        // To make them testable like this, they'd need to be exposed globally,
        // or script.js would need to be refactored into modules.

        // Let's assume for now that after DOMContentLoaded, we can re-initialize or access them.
        // The mocks for DOM and localStorage are at the top.
        // The `document.dispatchEvent(new Event('DOMContentLoaded'));` inside testAddTask is a hack
        // to try and run the setup logic of script.js if it hasn't run yet or if functions are not global.

        runAllTests();
    });
}
