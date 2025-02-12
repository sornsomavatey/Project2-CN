const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json()); // for parsing application/json

const port = 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
});

// MongoDB connection
mongoose.connect('mongodb+srv://Vatey:vatey2609@cluster0.disrk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

// Define the Student Schema directly in index.js
const studentSchema = new mongoose.Schema({
  sid: { type: String, unique: true, required: true },
  sname: { type: String, required: true },
  semail: { type: String, required: true },
  spass: { type: String, required: true },
});

// **Fix: Create a Mongoose Model**
const Student = mongoose.model('Student', studentSchema);

// Registration - Post method
app.post('/register', async (req, res) => {
  const { sid, sname, semail, spass } = req.body;
  try {
    const newStudent = new Student({ sid, sname, semail, spass });
    await newStudent.save(); // Save to MongoDB
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(400).send('Error registering user');
  }
});

// Login - Post method
app.post('/login', async (req, res) => {
  const { sid, spass } = req.body;
  const user = await Student.findOne({ sid, spass });
  if (user) {
    res.status(200).send('Login successful');
  } else {
    res.status(401).send('Invalid credentials');
  }
});

// Search - Get method
app.get('/search', async (req, res) => {
  const { sid } = req.query;
  const user = await Student.findOne({ sid });
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).send('User not found');
  }
});

// Profile update
app.put('/update-profile', async (req, res) => {
  const { sid } = req.body;
  const updates = req.params;
  const user = await Student.findOneAndUpdate({ sid }, updates, { new: true });
  if (user) {
    res.status(200).send('Profile updated successfully');
  } else {
    res.status(404).send('User not found');
  }
});

// Delete user
app.delete('/delete-user', async (req, res) => {
  const { sid } = req.body;
  const result = await Student.deleteOne({ sid });
  if (result.deletedCount > 0) {
    res.status(200).send('User deleted successfully');
  } else {
    res.status(404).send('User not found');
  }
});
