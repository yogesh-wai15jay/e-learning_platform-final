import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import Logo from './Logo';

const AssignCourse = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);           // all users from API
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [deadlineDays, setDeadlineDays] = useState(0);
  const [deadlineHours, setDeadlineHours] = useState(0);

  useEffect(() => {
    if (user?.role !== 'author' && user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [usersRes, coursesRes, deptsRes] = await Promise.all([
        api.get('/assignments/users'),
        api.get('/assignments/courses'),
        api.get('/admin/departments')   // requires this endpoint
      ]);
      setUsers(usersRes.data);
      setCourses(coursesRes.data);
      setDepartments(deptsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Helper: get all user IDs belonging to a department
  const getUserIdsByDepartment = (deptName) => {
    return users.filter(u => u.departments && u.departments.includes(deptName)).map(u => u._id);
  };

  // Toggle department selection: add/remove all users in that department
  const toggleDepartment = (deptName) => {
    const isSelected = selectedDepartments.includes(deptName);
    let newSelectedDepartments;
    let newSelectedUsers = [...selectedUsers];
    const userIds = getUserIdsByDepartment(deptName);

    if (isSelected) {
      // Remove department: remove its users from selectedUsers
      newSelectedDepartments = selectedDepartments.filter(d => d !== deptName);
      newSelectedUsers = newSelectedUsers.filter(id => !userIds.includes(id));
    } else {
      // Add department: add its users (avoid duplicates)
      newSelectedDepartments = [...selectedDepartments, deptName];
      userIds.forEach(id => {
        if (!newSelectedUsers.includes(id)) newSelectedUsers.push(id);
      });
    }
    setSelectedDepartments(newSelectedDepartments);
    setSelectedUsers(newSelectedUsers);
  };

  // Toggle individual user
  const toggleUser = (userId) => {
    const isSelected = selectedUsers.includes(userId);
    let newSelectedUsers;
    if (isSelected) {
      newSelectedUsers = selectedUsers.filter(id => id !== userId);
      // Also check if this user was coming from a department – we need to remove department from selectedDepartments if all its users are gone
      // For simplicity, we don't auto-untick departments; user can untick department manually.
    } else {
      newSelectedUsers = [...selectedUsers, userId];
    }
    setSelectedUsers(newSelectedUsers);
  };

  const toggleCourse = (courseId) => {
    setSelectedCourses(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  // Filter users and departments by search term
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    (u.departments && u.departments.some(d => d.toLowerCase().includes(userSearchTerm.toLowerCase())))
  );

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(courseSearchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedUsers.length === 0 || selectedCourses.length === 0) {
      toast.error('Please select at least one user and one course');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/assignments/assign', {
  userIds: selectedUsers,
  courseIds: selectedCourses,
  message: customMessage.trim() || undefined,
  deadlineDays: deadlineDays,
  deadlineHours: deadlineHours
});
      toast.success('Course(s) assigned successfully!');
      // Reset selections
      setSelectedUsers([]);
      setSelectedCourses([]);
      setSelectedDepartments([]);
      setCustomMessage('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Assignment failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
  <div className="relative min-h-screen">

    {/* Background */}
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: '100% 100%',
      }}
    />

    <div className="absolute inset-0 bg-black/5" />

    <div className="relative z-10 min-h-screen">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Logo className="h-10" />

          <div className="flex items-center gap-4">

            <div
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.16)',
                color: '#6366f1',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {user?.role === 'author'
                ? 'Author'
                : 'Admin'}
              : {user?.name}
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              style={{
                padding: '10px 16px',
                borderRadius: 12,
                background: 'rgba(236,72,153,0.08)',
                color: '#ec4899',
                border: '1px solid rgba(236,72,153,0.12)',
                fontWeight: 700,
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-10">

        {/* Heading */}
        <div className="mb-10">
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#6366f1',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Learning Management
          </p>

          <h1
            style={{
              fontSize: 'clamp(30px, 4vw, 46px)',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            Assign Course(s)
          </h1>

          <p
            style={{
              color: '#64748b',
              fontSize: 15,
              maxWidth: 720,
              lineHeight: 1.7,
            }}
          >
            Assign learning courses to users or entire
            departments with custom messages and completion
            deadlines.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Users */}
            <div
              style={{
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(16px)',
                border:
                  '1px solid rgba(255,255,255,0.3)',
                borderRadius: 28,
                padding: 28,
                boxShadow:
                  '0 18px 40px rgba(0,0,0,0.05)',
              }}
            >
              <div className="mb-5">
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: '#6366f1',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  Recipients
                </p>

                <h2
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: '#0f172a',
                  }}
                >
                  Select Users
                </h2>
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search users or departments..."
                value={userSearchTerm}
                onChange={(e) =>
                  setUserSearchTerm(e.target.value)
                }
                className="w-full rounded-2xl border border-white/30 bg-white/70 px-4 py-3 outline-none mb-5"
              />

              {/* List */}
              <div
                style={{
                  maxHeight: 520,
                  overflowY: 'auto',
                  borderRadius: 22,
                  background:
                    'rgba(255,255,255,0.35)',
                  border:
                    '1px solid rgba(255,255,255,0.25)',
                  padding: 18,
                }}
              >

                {/* Departments */}
                {filteredDepartments.length > 0 && (
                  <div className="mb-8">
                    <div className="font-bold text-slate-700 mb-4">
                      Departments
                    </div>

                    <div className="space-y-3">
                      {filteredDepartments.map(
                        (dept) => (
                          <label
                            key={dept._id}
                            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/30 cursor-pointer transition"
                          >
                            <input
                              type="checkbox"
                              checked={selectedDepartments.includes(
                                dept.name
                              )}
                              onChange={() =>
                                toggleDepartment(
                                  dept.name
                                )
                              }
                              className="w-4 h-4"
                            />

                            <div className="flex-1">
                              <div className="font-semibold text-slate-800">
                                {dept.name}
                              </div>

                              <div className="text-xs text-gray-500">
                                {
                                  getUserIdsByDepartment(
                                    dept.name
                                  ).length
                                }{' '}
                                users
                              </div>
                            </div>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Users */}
                {filteredUsers.length > 0 && (
                  <div>
                    <div className="font-bold text-slate-700 mb-4">
                      Users
                    </div>

                    <div className="space-y-3">
                      {filteredUsers.map((u) => (
                        <label
                          key={u._id}
                          className="flex items-start gap-3 p-3 rounded-2xl hover:bg-white/30 cursor-pointer transition"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(
                              u._id
                            )}
                            onChange={() =>
                              toggleUser(u._id)
                            }
                            className="w-4 h-4 mt-1"
                          />

                          <div>
                            <div className="font-semibold text-slate-800">
                              {u.name}
                            </div>

                            <div className="text-sm text-gray-500">
                              {u.email}
                            </div>

                            <div className="text-xs text-indigo-500 mt-1">
                              Dept:{' '}
                              {u.departments?.join(
                                ', '
                              ) || 'None'}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {filteredUsers.length === 0 &&
                  filteredDepartments.length ===
                    0 && (
                    <div className="text-center text-gray-400 py-10">
                      No users found
                    </div>
                  )}
              </div>
            </div>

            {/* Courses + Message */}
            <div className="space-y-8">

              {/* Courses */}
              <div
                style={{
                  background:
                    'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(16px)',
                  border:
                    '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 28,
                  padding: 28,
                  boxShadow:
                    '0 18px 40px rgba(0,0,0,0.05)',
                }}
              >
                <div className="mb-5">
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: '#6366f1',
                      textTransform: 'uppercase',
                      marginBottom: 6,
                    }}
                  >
                    Learning Content
                  </p>

                  <h2
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: '#0f172a',
                    }}
                  >
                    Select Courses
                  </h2>
                </div>

                <input
                  type="text"
                  placeholder="Search courses..."
                  value={courseSearchTerm}
                  onChange={(e) =>
                    setCourseSearchTerm(
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-white/30 bg-white/70 px-4 py-3 outline-none mb-5"
                />

                <div
                  style={{
                    maxHeight: 280,
                    overflowY: 'auto',
                    borderRadius: 22,
                    background:
                      'rgba(255,255,255,0.35)',
                    border:
                      '1px solid rgba(255,255,255,0.25)',
                    padding: 18,
                  }}
                >
                  <div className="space-y-3">
                    {filteredCourses.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/30 cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(
                            c.id
                          )}
                          onChange={() =>
                            toggleCourse(c.id)
                          }
                          className="w-4 h-4"
                        />

                        <div className="flex-1">
                          <div className="font-semibold text-slate-800">
                            {c.title}
                          </div>

                          <div className="text-xs text-indigo-500">
                            {c.id}
                          </div>
                        </div>
                      </label>
                    ))}

                    {filteredCourses.length ===
                      0 && (
                      <div className="text-center text-gray-400 py-8">
                        No courses found
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Message + Deadline */}
              <div
                style={{
                  background:
                    'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(16px)',
                  border:
                    '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 28,
                  padding: 28,
                  boxShadow:
                    '0 18px 40px rgba(0,0,0,0.05)',
                }}
              >
                <div className="mb-5">
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: '#6366f1',
                      textTransform: 'uppercase',
                      marginBottom: 6,
                    }}
                  >
                    Assignment Settings
                  </p>

                  <h2
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: '#0f172a',
                    }}
                  >
                    Message & Deadline
                  </h2>
                </div>

                {/* Message */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Custom Message
                  </label>

                  <textarea
                    value={customMessage}
                    onChange={(e) =>
                      setCustomMessage(
                        e.target.value
                      )
                    }
                    rows="5"
                    placeholder="Write a personal message..."
                    className="w-full rounded-2xl border border-white/30 bg-white/70 px-4 py-3 outline-none"
                  />

                  <p className="text-xs text-gray-500 mt-2">
                    This message will be included in
                    assignment emails.
                  </p>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Completion Deadline
                  </label>

                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <label className="block text-xs text-gray-500 mb-2">
                        Days
                      </label>

                      <input
                        type="number"
                        min="0"
                        max="365"
                        value={deadlineDays}
                        onChange={(e) =>
                          setDeadlineDays(
                            parseInt(
                              e.target.value
                            )
                          )
                        }
                        className="w-full rounded-2xl border border-white/30 bg-white/70 px-4 py-3 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-2">
                        Hours
                      </label>

                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={deadlineHours}
                        onChange={(e) =>
                          setDeadlineHours(
                            parseInt(
                              e.target.value
                            )
                          )
                        }
                        className="w-full rounded-2xl border border-white/30 bg-white/70 px-4 py-3 outline-none"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Set at least one value.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-end gap-4">

            <button
              type="button"
              onClick={() =>
                navigate(
                  user?.role === 'admin'
                    ? '/admin'
                    : '/author'
                )
              }
              style={{
                padding: '14px 22px',
                borderRadius: 16,
                background:
                  'rgba(255,255,255,0.6)',
                border:
                  '1px solid rgba(255,255,255,0.3)',
                color: '#334155',
                fontWeight: 700,
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '14px 26px',
                borderRadius: 16,
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                boxShadow:
                  '0 12px 24px rgba(99,102,241,0.28)',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting
                ? 'Assigning...'
                : 'Assign Course'}
            </button>
          </div>
        </form>
      </main>
    </div>
  </div>
);
};

export default AssignCourse;