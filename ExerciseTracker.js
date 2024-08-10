require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const path = require('path');

// Middleware
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// In-memory storage
let users = [];
let exercises = [];

// Serve HTML form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Create a new user
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const newUser = { username, _id: users.length + 1 };
  users.push(newUser);
  res.json(newUser);
});

// Get all users
// Get all users
app.get('/api/users', (req, res) => {
  // Map users array to ensure the correct structure
  const formattedUsers = users.map(user => ({
    username: user.username,
    _id: String(user._id)
  }));
  
  // Log the response to debug
  console.log(formattedUsers);

  // Return the correctly formatted array
  res.json(formattedUsers);
});



// Add a new exercise for a specific user
app.post('/api/users/:id/exercises', (req, res) => {
  const userId = parseInt(req.params.id);
  const { description, duration, date } = req.body;
  const exerciseDate = date ? new Date(date) : new Date();
  
  // Find user
  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.json({ error: 'User not found' });
  }
  
  // Add exercise
  const newExercise = {
    username: userId,
    description,
    duration: parseInt(duration), // Ensure duration is a number
    date: exerciseDate.toDateString(),
    _id: exercises.length + 1
  };
  exercises.push(newExercise);

  res.json({
    ...user,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date
  });
});

// Get user logs
app.get('/api/users/:id/logs', (req, res) => {
  const userId = parseInt(req.params.id);
  const { from, to, limit } = req.query;

  const userExercises = exercises.filter(ex => ex.username === userId);

  // Apply date filtering if provided
  const filteredExercises = userExercises.filter(ex => {
    const exDate = new Date(ex.date);
    if (from && new Date(from) > exDate) return false;
    if (to && new Date(to) < exDate) return false;
    return true;
  });

  // Apply limit if provided
  const limitedExercises = limit ? filteredExercises.slice(0, parseInt(limit)) : filteredExercises;

  const user = users.find(u => u._id === userId);

  if (user) {
    res.json({
      username: user.username,
      count: limitedExercises.length,
      _id: userId,
      log: limitedExercises.map(ex => ({
        description: ex.description,
        duration: ex.duration, // Ensure duration is a number
        date: ex.date
      }))
    });
  } else {
    res.json({ error: 'User not found' });
  }
});

// Start server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
