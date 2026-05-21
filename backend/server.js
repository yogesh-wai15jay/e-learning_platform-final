require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');
const path = require('path');

const authRoutes = require('./routes/auth');
const topicsRoutes = require('./routes/topics');
const quizRoutes = require('./routes/quiz');
const adminRoutes = require('./routes/admin');

const courseRoutes = require('./routes/courses');
const questionRoutes = require('./routes/questions');

const seedInitialCourses = require('./scripts/seedCourses');
seedInitialCourses();

const passwordResetRoutes = require('./routes/passwordReset');
const uploadRoutes = require('./routes/upload');

const assignmentRoutes = require('./routes/assignments');

const app = express();

// Connect to MongoDB
connectDB();

const startDeadlineChecker = require('./jobs/checkDeadlines');
startDeadlineChecker;

// Seed departments
const Department = require('./models/Department');
const seedDepartments = async () => {
  const predefined = ['HR', 'Staffing', 'CCM Developer', 'CCM Testing', 'Management', 'Tech Intern'];
  for (const name of predefined) {
    await Department.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
  }
  console.log('Departments seeded');
};
seedDepartments().catch(err => console.error('Failed to seed departments:', err));

// Create admin user if not exists
const createAdmin = async () => {
  try {
    const adminEmail = 'admin@example.com';
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const admin = new User({
        name: 'Admin',
        email: adminEmail,
        password: 'admin@1234',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created (email: admin@example.com, password: admin@1234)');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};
createAdmin();

// Middleware
// In server.js, before static middleware
express.static.mime.define({ 'video/mp4': ['mp4'] });
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/assignments', assignmentRoutes);

// ... after all your `app.use('/api', ...)` routes ...

// Serve static files from the React frontend build
const frontendBuildPath = path.join(__dirname, '../frontend/dist');  // adjust path if frontend folder is at different level
app.use(express.static(frontendBuildPath));

// For any other route (not starting with /api), serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});