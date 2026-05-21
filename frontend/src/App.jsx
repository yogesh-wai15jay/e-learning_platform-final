import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Signup from './components/Signup';
import LandingPage from './components/LandingPage';
import TopicDetails from './components/TopicDetails';
import QuizResult from './components/QuizResult';
import AdminDashboard from './components/AdminDashboard';
import HomePage from './components/HomePage';  // import the new component
import AuthorDashboard from './components/AuthorDashboard';
import CreateCourse from './components/CreateCourse';
import EditCourse from './components/EditCourse';
import DeleteCourse from './components/DeleteCourse';
import BackgroundLayout from './components/BackgroundLayout';
import ForgotPassword from './components/ForgotPassword';
import AuthorCourses from './components/AuthorCourses';
import AuthorCourseDetail from './components/AuthorCourseDetail';
import AssignCourse from './components/AssignCourse';
import AssignDepartment from './components/AssignDepartment';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <BackgroundLayout>
        <Routes>

          <Route path="/author" element={<ProtectedRoute><AuthorDashboard /></ProtectedRoute>} />
          <Route path="/author/create-course" element={<ProtectedRoute><CreateCourse /></ProtectedRoute>} />
          <Route path="/author/edit-course" element={<ProtectedRoute><EditCourse /></ProtectedRoute>} />
          <Route path="/author/delete-course" element={<ProtectedRoute><DeleteCourse /></ProtectedRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/author/courses" element={<ProtectedRoute roles={['author', 'admin']}><AuthorCourses /></ProtectedRoute>} />
          <Route path="/author/course/:id" element={<ProtectedRoute roles={['author', 'admin']}><AuthorCourseDetail /></ProtectedRoute>} />
          <Route path="/author/assign-course" element={<ProtectedRoute><AssignCourse /></ProtectedRoute>} />

          {/* Public route */}
          <Route path="/" element={<HomePage />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <LandingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/topic/:topicId"
            element={
              <ProtectedRoute>
                <TopicDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/topic/:topicId/result"
            element={
              <ProtectedRoute>
                <QuizResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/assign-department" element={
  <ProtectedRoute roles={['admin']}>
    <AssignDepartment />
  </ProtectedRoute>
} />
        </Routes>
      </BackgroundLayout>
      </AuthProvider>
    </Router>
  );
}

export default App;