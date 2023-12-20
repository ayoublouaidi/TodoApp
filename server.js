// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Your other route handlers go here...

// Root route handler
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint pour récupérer toutes les tâches
app.get('/tasks', (req, res) => {
    db.all("SELECT * FROM tasks", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Endpoint pour ajouter une tâche
app.post('/tasks', (req, res) => {
    const { task, date, status } = req.body;
    db.run("INSERT INTO tasks (task, date, status) VALUES (?, ?, ?)", [task, date, status], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Task added successfully' });
    });
});

// Endpoint pour mettre à jour une tâche
app.put('/tasks/:id', (req, res) => {
    const { task, date, status } = req.body;
    const id = req.params.id;
    db.run("UPDATE tasks SET task = ?, date = ?, status = ? WHERE id = ?", [task, date, status, id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Task updated successfully' });
    });
});

// Endpoint pour supprimer une tâche
app.delete('/tasks/:id', (req, res) => {
    const taskId = req.params.id;

    if (!taskId) {
        return res.status(400).json({ error: 'Invalid request format' });
    }

    // Delete the task from the database
    db.run('DELETE FROM tasks WHERE id = ?', [taskId], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({ message: 'Task deleted successfully' });
    });
});


// Endpoint for saving tasks to the database
app.put('/tasks', (req, res) => {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks)) {
        res.status(400).json({ error: 'Invalid request format' });
        return;
    }

    // Loop through tasks and either update existing or insert new tasks
    tasks.forEach(task => {
        const { id, task: updatedTask, date, status } = task;
        
        if (id) {
            // If the task has an ID, update existing task in the database
            db.run("UPDATE tasks SET task = ?, date = ?, status = ? WHERE id = ?", [updatedTask, date, status, id], (err) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
            });
        } else {
            // If the task doesn't have an ID, insert a new task into the database
            db.run("INSERT INTO tasks (task, date, status) VALUES (?, ?, ?)", [updatedTask, date, status], (err) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
            });
        }
    });

    res.json({ message: 'Tasks saved successfully' });
});





app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
