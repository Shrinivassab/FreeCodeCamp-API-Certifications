const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors({ optionsSuccessStatus: 200 }));

// Serve static files (if you have any)
app.use(express.static('public'));

// API endpoint to handle date requests
app.get('/api/:date?', (req, res) => {
  const { date } = req.params;

  let parsedDate;

  // If date is not provided, use the current date
  if (!date) {
    parsedDate = new Date();
  } else if (!isNaN(date)) {
    // If date is a Unix timestamp in milliseconds
    parsedDate = new Date(parseInt(date));
  } else {
    // If date is a valid date string
    parsedDate = new Date(date);
  }

  // Check if the date is valid
  if (parsedDate.toString() === 'Invalid Date') {
    return res.json({ error: 'Invalid Date' });
  }

  // Return the Unix timestamp and UTC string
  res.json({
    unix: parsedDate.getTime(),
    utc: parsedDate.toUTCString(),
  });
});

// Listen on the environment's port or 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
