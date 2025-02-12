const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json()); // for parsing application/json

const port = 80;

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

// Student Registration (POST /register)
app.post('/register', async (req, res) => {
  const { sid, sname, semail, spass } = req.body;
  try {
    const existingStudent = await Student.findOne({ $or: [{ sid }, { email }] });
    if (existingStudent) {
      return res.status(400).json(createResponse(400, "Student already exists."));
    }
    const student = new Student({ sid, sname, semail, spass });
    await student.save();
    res.status(201).json(createResponse(200, "Student registered successfully.", { student }));
  } catch (err) {
    res.status(500).json(createResponse(500, "Error registering student.", { error: err.message }));
  }
});


// Student Login (POST /login)
app.post('/login', async (req, res) => {
  const { sid, spass } = req.body;
  try {
    const student = await Student.findOne({ sid });
    if (!student || student.spass !== spass) {
      return res.status(401).json(createResponse(401, "Invalid credentials."));
    }
    res.status(200).json(createResponse(200, "Login successful.", { student }));
  } catch (err) {
    res.status(500).json(createResponse(500, "Error logging in.", { error: err.message }));
  }
});

// Search Student by ID (GET /search/:sid)
app.get('/search/:sid', async (req, res) => {
  const { sid } = req.params;
  try {
    const student = await Student.findOne({ sid });
    if (!student) {
      return res.status(404).json(createResponse(404, "Student not found."));
    }
    res.status(200).json(createResponse(200, "Student found.", { student }));
  } catch (err) {
    res.status(500).json(createResponse(500, "Error searching student.", { error: err.message }));
  }
});


// Update Student Profile (PUT /update/:sid)
app.put('/update/:sid', async (req, res) => {
  const { sid } = req.params;
  const updates = req.body;
  try {
    const student = await Student.findOneAndUpdate({ sid }, updates, { new: true });
    if (!student) {
      return res.status(404).json(createResponse(404, "Student not found."));
    }
    res.status(200).json(createResponse(200, "Profile updated successfully.", { student }));
  } catch (err) {
    res.status(500).json(createResponse(500, "Error updating profile.", { error: err.message }));
  }
});

// Delete Student (DELETE /delete/:sid)
app.delete('/delete/:sid', async (req, res) => {
  const { sid } = req.params;
  try {
    const student = await Student.findOneAndDelete({ sid });
    if (!student) {
      return res.status(404).json(createResponse(404, "Student not found."));
    }
    res.status(200).json(createResponse(200, "Student deleted successfully."));
  } catch (err) {
    res.status(500).json(createResponse(500, "Error deleting student.", { error: err.message }));
  }
});


