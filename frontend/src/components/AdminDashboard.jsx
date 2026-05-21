import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import Logo from './Logo';
import * as XLSX from 'xlsx';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [attemptsData, setAttemptsData] = useState(null);
  const [showAttemptsModal, setShowAttemptsModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [sendingTopicId, setSendingTopicId] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Fetch all courses (including author-created)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        const courses = res.data.map(c => ({
          id: c.id,
          name: c.title,
          totalModules: c.subtopics ? c.subtopics.length : 0
        }));
        setAllCourses(courses);
      } catch (error) {
        console.error('Failed to load courses', error);
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      try {
        await api.delete(`/admin/users/${userId}`);
        toast.success(`User ${userName} deleted`);
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handlePromoteToAuthor = async (userId, userName) => {
    if (window.confirm(`Promote "${userName}" to author? They will be able to create and manage courses.`)) {
      try {
        await api.post(`/admin/users/${userId}/promote-to-author`);
        toast.success(`${userName} is now an author.`);
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to promote user');
      }
    }
  };

  const handleDemoteToUser = async (userId, userName) => {
    if (window.confirm(`Demote "${userName}" from author to regular user? They will lose author privileges.`)) {
      try {
        await api.post(`/admin/users/${userId}/demote-to-user`);
        toast.success(`${userName} is now a regular user.`);
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to demote user');
      }
    }
  };

  const handleViewAttempts = async (user) => {
    setSelectedUser(user);
    setLoading(true);
    try {
      const response = await api.get(`/admin/users/${user._id}/attempts`);
      setAttemptsData(response.data);
      setShowAttemptsModal(true);
    } catch (error) {
      toast.error('Failed to load quiz attempts');
    } finally {
      setLoading(false);
    }
  };

  const handleShowProgress = (user) => {
    setSelectedUser(user);
    const progressMap = {};
    allCourses.forEach(course => {
      if (course.totalModules > 0) {
        const progress = getTopicProgress(user, course.id, course.totalModules);
        progressMap[course.name] = progress;
      }
    });
    setProgressData({ name: user.name, progress: progressMap });
    setShowProgressModal(true);
  };

  const handleSendAcknowledgement = async (topicId) => {
    if (!selectedUser) return;
    setSendingTopicId(topicId);
    try {
      await api.post(`/admin/users/${selectedUser._id}/acknowledge/${topicId}`);
      toast.success(`Acknowledgement sent to ${selectedUser.name} for ${allCourses.find(c => c.id === topicId)?.name}`);
      if (attemptsData) {
        setAttemptsData({
          ...attemptsData,
          acknowledgedTopics: [...(attemptsData.acknowledgedTopics || []), topicId]
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send acknowledgement');
    } finally {
      setSendingTopicId(null);
    }
  };

  const getTopicProgress = (user, courseId, totalModules) => {
    if (totalModules === 0) return null;
    const course = allCourses.find(c => c.id === courseId);
    if (!course) return null;
    const topicCompleted = user.topicsProgress?.[course.name]?.completed === true;
    if (topicCompleted) return 100;
    const moduleProg = user.moduleProgress?.[courseId];
    const completedModules = moduleProg?.completedModules?.length || 0;
    if (completedModules === totalModules) return 99;
    if (completedModules === 0) return 0;
    return Math.round((completedModules / totalModules) * 100);
  };

  const handleDownloadExcel = () => {
  const topicHeaders = allCourses.filter(c => c.totalModules > 0).map(c => c.name);
  const headers = ['Name', 'Email', 'Role', ...topicHeaders];

  const rows = filteredUsers.map(u => {
    const row = [u.name, u.email, u.role];
    allCourses.forEach(course => {
      if (course.totalModules > 0) {
        const progress = getTopicProgress(u, course.id, course.totalModules);
        row.push(progress !== null ? progress : 'N/A');
      }
    });
    return row;
  });

  // Build worksheet data
  const sheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'User Progress');
  
  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `users_progress_${new Date().toISOString().slice(0,19)}.xlsx`);
  toast.success('Excel file downloaded successfully');
};

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(users.filter(u => 
        u.name.toLowerCase().includes(term) || 
        u.email.toLowerCase().includes(term)
      ));
    }
  }, [searchTerm, users]);

  if ((loading || coursesLoading) && !showAttemptsModal && !showProgressModal) {
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

    {/* Soft overlay */}

    <div className="relative z-10 min-h-screen">

      {/* Header */}
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
              Admin: {user?.name}
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
                transition: 'all 0.2s',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10">

        {/* Top Heading */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 20,
            flexWrap: 'wrap',
            marginBottom: 28,
          }}
        >
          <div>
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
              Admin Control Center
            </p>

            <h1
              style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginBottom: 10,
              }}
            >
              All Users & Progress
            </h1>

            <p
              style={{
                color: '#64748b',
                fontSize: 15,
                maxWidth: 650,
                lineHeight: 1.7,
              }}
            >
              Manage users, monitor learning progress, review quiz attempts,
              and control author permissions from one place.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4 flex-wrap">
            {[
              {
                label: 'Users',
                value: filteredUsers.length,
                color: '#6366f1',
              },
              {
                label: 'Courses',
                value: allCourses.length,
                color: '#10b981',
              },
              {
                label: 'Authors',
                value: users.filter(u => u.role === 'author').length,
                color: '#f59e0b',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  minWidth: 120,
                  padding: '16px 18px',
                  borderRadius: 18,
                  background: 'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(14px)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  boxShadow: '0 10px 28px rgba(0,0,0,0.05)',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 6,
                  }}
                >
                  {stat.label}
                </div>

                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 24,
            padding: '18px 22px',
            borderRadius: 20,
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.35)',
            boxShadow: '0 10px 32px rgba(0,0,0,0.05)',
          }}
        >
          <div className="flex gap-3 flex-wrap">

            <button
              onClick={handleDownloadExcel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 18px',
                borderRadius: 12,
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.18)',
                color: '#059669',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Excel
            </button>

            <button
              onClick={() => navigate('/admin/assign-department')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 18px',
                borderRadius: 12,
                background: 'rgba(168,85,247,0.08)',
                border: '1px solid rgba(168,85,247,0.18)',
                color: '#9333ea',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              Assign Department
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: 280,
                padding: '12px 16px 12px 42px',
                borderRadius: 14,
                border: '1px solid rgba(0,0,0,0.08)',
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(10px)',
                outline: 'none',
                fontSize: 14,
              }}
            />

            <svg
              className="absolute left-4 top-3.5 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            overflowX: 'auto',
            borderRadius: 24,
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(18px)',
            border: '1px solid rgba(255,255,255,0.35)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.06)',
          }}
        >
          <table className="min-w-full">
            <thead>
              <tr
                style={{
                  background: 'rgba(248,250,252,0.85)',
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                {['Name', 'Email', 'Role', 'Topic Progress (%)', 'Actions'].map((head) => (
                  <th
                    key={head}
                    style={{
                      padding: '18px 24px',
                      textAlign: 'left',
                      fontSize: 13,
                      fontWeight: 800,
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u) => (
                <tr
                  key={u._id}
                  style={{
                    borderTop: '1px solid rgba(0,0,0,0.05)',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '20px 24px', fontWeight: 700 }}>
                    {u.name}
                  </td>

                  <td style={{ padding: '20px 24px', color: '#64748b' }}>
                    {u.email}
                  </td>

                  <td style={{ padding: '20px 24px' }}>
                    <span
                      style={{
                        padding: '6px 12px',
                        borderRadius: 999,
                        background:
                          u.role === 'author'
                            ? 'rgba(168,85,247,0.1)'
                            : 'rgba(99,102,241,0.1)',
                        color:
                          u.role === 'author'
                            ? '#9333ea'
                            : '#6366f1',
                        fontSize: 12,
                        fontWeight: 800,
                        textTransform: 'capitalize',
                      }}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td style={{ padding: '20px 24px' }}>
                    <button
                      onClick={() => handleShowProgress(u)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 10,
                        border: '1px solid rgba(99,102,241,0.18)',
                        background: 'rgba(99,102,241,0.08)',
                        color: '#6366f1',
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      Show Progress
                    </button>
                  </td>

                  <td style={{ padding: '20px 24px' }}>
                    <div className="flex items-center gap-4 flex-wrap">

                      <button
                        onClick={() => handleViewAttempts(u)}
                        className="text-blue-600 font-semibold text-sm"
                      >
                        View Attempts
                      </button>

                      {u.role === 'user' && (
                        <button
                          onClick={() => handlePromoteToAuthor(u._id, u.name)}
                          className="text-purple-600 font-semibold text-sm"
                        >
                          Promote
                        </button>
                      )}

                      {u.role === 'author' && (
                        <button
                          onClick={() => handleDemoteToUser(u._id, u.name)}
                          className="text-orange-600 font-semibold text-sm"
                        >
                          Demote
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.14)',
                          color: '#ef4444',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty */}
        {filteredUsers.length === 0 && (
          <div
            style={{
              marginTop: 40,
              padding: '60px 24px',
              borderRadius: 24,
              textAlign: 'center',
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(14px)',
            }}
          >
            <div style={{ fontSize: 54, marginBottom: 12 }}>🔍</div>

            <h3 className="text-2xl font-bold mb-2">
              No users found
            </h3>

            <p className="text-gray-500">
              Try adjusting your search query.
            </p>
          </div>
        )}
      </main>

      {/* KEEP YOUR EXISTING MODALS EXACTLY AS THEY ARE BELOW */}

      {/* Modal for quiz attempts */}
      {showAttemptsModal && attemptsData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Quiz Attempts: {attemptsData.name}</h3>
                <button onClick={() => setShowAttemptsModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <div className="space-y-6">
                {allCourses.map(course => {
                  const userAttempts = attemptsData.attempts.filter(a => a.topicId === course.id);
                  if (userAttempts.length === 0) return null;
                  const hasPassed = userAttempts.some(a => a.passed);
                  const alreadyAcknowledged = attemptsData.acknowledgedTopics?.includes(course.id);
                  return (
                    <div key={course.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-lg">{course.name}</h4>
                        {hasPassed && (
                          alreadyAcknowledged ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Sent
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSendAcknowledgement(course.id)}
                              disabled={sendingTopicId === course.id}
                              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                            >
                              {sendingTopicId === course.id ? 'Sending...' : 'Send Acknowledgment'}
                            </button>
                          )
                        )}
                      </div>
                      <div className="space-y-2">
                        {userAttempts.map((attempt, idx) => (
                          <div key={idx} className="text-sm border-b pb-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">{new Date(attempt.attemptDate).toLocaleString()}</span>
                              <span className={attempt.passed ? 'text-green-600 font-medium' : 'text-red-600'}>
                                {attempt.passed ? 'PASSED' : 'FAILED'}
                              </span>
                            </div>
                            <div className="mt-1">Score: {attempt.score}/{attempt.totalQuestions} ({Math.round((attempt.score/attempt.totalQuestions)*100)}%)</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {attemptsData.attempts.length === 0 && <p className="text-gray-500">No quiz attempts yet.</p>}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setShowAttemptsModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for topic progress */}
      {showProgressModal && progressData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Topic Progress: {progressData.name}</h3>
                <button onClick={() => setShowProgressModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <div className="space-y-3">
                {Object.entries(progressData.progress).map(([topicName, progress]) => (
                  <div key={topicName} className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-700">{topicName}</span>
                    <span className="font-medium text-primary-600">{progress}%</span>
                  </div>
                ))}
                {Object.keys(progressData.progress).length === 0 && (
                  <p className="text-gray-500">No progress recorded.</p>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setShowProgressModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default AdminDashboard;