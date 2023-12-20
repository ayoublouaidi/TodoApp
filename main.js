
document.addEventListener('DOMContentLoaded', function () {
    const inputTask = document.querySelector('.input-section input[type="text"]');
    const inputDate = document.querySelector('.input-section input[type="date"]');
    const addButton = document.querySelector('.add-task-button');
    const todosList = document.querySelector('.todos-list-body');
    const filterButtons = document.querySelectorAll('.todos-filter li');

    const apiUrl = 'http://localhost:3000/tasks';

    let editingTask = null; // Variable to track the task being edited

    // Function to add a new task
    function addTask() {
        const taskValue = inputTask.value.trim();
        const dateValue = inputDate.value.trim();

        if (taskValue !== '') {
            const newTask = document.createElement('tr');
            newTask.setAttribute('data-status', 'pending'); // Set default status to 'pending'
            newTask.innerHTML = `
                <td>${taskValue}</td>
                <td>${dateValue}</td>
                <td>
                    <select class="status-dropdown bg-input text-input border-input rounded">
                        <option value="pending" selected>Pending</option>
                        <option value="completed">Completed</option>
                    </select>
                </td>
                <td>
                    <button class="edit-task-btn btn btn-xs btn-outline-secondary">Edit</button>
                    <button class="delete-task-btn btn btn-xs btn-outline-danger">Delete</button>
                </td>
            `;
            todosList.appendChild(newTask);

            // Add the task to the server
            addTaskToServer(taskValue, dateValue, 'pending');
            
            // Clear input fields after adding task
            inputTask.value = '';
            inputDate.value = '';
        } else {
            alert('Please enter a task.');
        }
    }
    const saveButton = document.querySelector('.save-task-button');

    // Event listener for saving tasks
    saveButton.addEventListener('click', saveTasksToServer);

    // Function to save tasks to the server
    function saveTasksToServer() {
        const tasks = [];

        // Extract tasks from the DOM
        document.querySelectorAll('.todos-list-body tr').forEach(taskRow => {
            const taskCells = taskRow.querySelectorAll('td');
            const task = {
                id: taskRow.dataset.id,
                task: taskCells[0].innerText,
                date: taskCells[1].innerText,
                status: taskRow.dataset.status,
            };
            tasks.push(task);
        });

        // Send tasks to the server
        fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tasks }),
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Failed to save tasks');
                }
            })
            .then(data => {
                // Display success message
                alert(data.message);
            })
            .catch(error => {
                console.error('Error saving tasks:', error);
                // Display error message
                alert('Failed to save tasks. Please try again.');
            });
    }

    function deleteTask(event) {
        if (event.target.classList.contains('delete-task-btn')) {
            const taskId = event.target.closest('tr').dataset.id;
    
            // Send a DELETE request to the server
            fetch(`/tasks/${taskId}`, {
                method: 'DELETE',
            })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Failed to delete task');
                    }
                })
                .then(data => {
                    // Display success message
                    alert(data.message);
    
                    // Remove the task from the DOM
                    event.target.closest('tr').remove();
                })
                .catch(error => {
                    console.error('Error deleting task:', error);
                    // Display error message
                    alert('Failed to delete task. Please try again.');
                });
        }
    }









    /*Function to delete a task
    function deleteTask(event) {
        if (event.target.classList.contains('delete-task-btn')) {
            const taskRow = event.target.closest('tr');
            const taskId = taskRow.dataset.id;

            // Delete the task from the server
            deleteTaskOnServer(taskId);

            taskRow.remove();
        }
    }
*/
    // Function to edit a task
    function editTask(event) {
        if (event.target.classList.contains('edit-task-btn')) {
            const taskRow = event.target.closest('tr');
            const taskCells = taskRow.querySelectorAll('td');
            const taskId = taskRow.dataset.id;

            // Populate input fields with existing task details
            inputTask.value = taskCells[0].innerText;
            inputDate.value = taskCells[1].innerText;

            // Set the editingTask variable to the current task
            editingTask = taskRow;

            // Remove the task from the DOM temporarily
            taskRow.remove();
        }
    }

    // Event listener for adding a task
    addButton.addEventListener('click', addTask);

    // Event listener for deleting a task
    todosList.addEventListener('click', deleteTask);

    // Event listener for editing a task
    todosList.addEventListener('click', editTask);

    // Function to filter tasks
    function filterTodos(status) {
        const allTasks = document.querySelectorAll('.todos-list-body tr');
        allTasks.forEach(task => {
            const taskStatus = task.querySelector('.status-dropdown').value.toLowerCase();
            if (status === 'all' || taskStatus === status) {
                task.style.display = 'table-row';
            } else {
                task.style.display = 'none';
            }
        });
    }

    // Event listener for filtering tasks
    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            const status = this.innerText.toLowerCase();
            filterTodos(status);
        });
    });

    // Function to fetch tasks from the server and update the UI
    function fetchTasks() {
        fetch(apiUrl)
            .then(response => response.json())
            .then(tasks => {
                todosList.innerHTML = ''; // Clear existing tasks
                tasks.forEach(task => {
                    const newTask = document.createElement('tr');
                    newTask.dataset.id = task.id;
                    newTask.setAttribute('data-status', task.status);
                    newTask.innerHTML = `
                        <td>${task.task}</td>
                        <td>${task.date}</td>
                        <td>
                            <select class="status-dropdown bg-input text-input border-input rounded">
                                <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                            </select>
                        </td>
                        <td>
                            <button class="edit-task-btn btn btn-xs btn-outline-secondary">Edit</button>
                            <button class="delete-task-btn btn btn-xs btn-outline-danger">Delete</button>
                        </td>
                    `;
                    todosList.appendChild(newTask);
                });
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    // Fetch tasks when the page loads
    fetchTasks();
});
