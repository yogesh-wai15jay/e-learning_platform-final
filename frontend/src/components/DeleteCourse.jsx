import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import Logo from './Logo';

const DeleteCourse = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('available'); // 'available' or 'deleted'

  useEffect(() => {
    fetchCourses();
  }, [filter]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/author/courses?status=${filter}`);
      setCourses(res.data);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete the course "${courseTitle}"? It will be moved to deleted list and can be restored later.`)) return;
    setActionLoading(courseId);
    try {
      await api.delete(`/courses/${courseId}`);
      toast.success(`Course "${courseTitle}" moved to deleted`);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete course');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (courseId, courseTitle) => {
    if (!window.confirm(`Restore the course "${courseTitle}"? It will become available again.`)) return;
    setActionLoading(courseId);
    try {
      await api.put(`/courses/${courseId}/restore`);
      toast.success(`Course "${courseTitle}" restored`);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restore course');
    } finally {
      setActionLoading(null);
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

            {/* Author Badge */}
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
              Author: {user.name}
            </div>

            {/* Logout */}
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
      <main className="max-w-5xl mx-auto px-4 py-10">

        {/* Heading */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 20,
            marginBottom: 36,
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
              Author Workspace
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
              Manage Courses
            </h1>

            <p
              style={{
                color: '#64748b',
                fontSize: 15,
                maxWidth: 650,
                lineHeight: 1.7,
              }}
            >
              Delete unused courses or restore previously removed
              learning content.
            </p>
          </div>

          {/* Filter */}
          <div
            style={{
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 18,
              padding: 12,
              boxShadow: '0 12px 28px rgba(0,0,0,0.05)',
            }}
          >
            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
              style={{
                padding: '10px 16px',
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.08)',
                background: 'rgba(255,255,255,0.75)',
                outline: 'none',
                fontWeight: 600,
                color: '#334155',
              }}
            >
              <option value="available">
                Available Courses
              </option>

              <option value="deleted">
                Deleted Courses
              </option>
            </select>
          </div>
        </div>

        {/* Empty State */}
        {courses.length === 0 ? (
          <div
            style={{
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 32,
              padding: '80px 40px',
              textAlign: 'center',
              boxShadow: '0 18px 40px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                fontSize: 64,
                marginBottom: 18,
              }}
            >
              {filter === 'available'
                ? '📚'
                : '🗑️'}
            </div>

            <h2
              style={{
                fontSize: 30,
                fontWeight: 900,
                color: '#0f172a',
                marginBottom: 14,
              }}
            >
              {filter === 'available'
                ? 'No Courses Available'
                : 'No Deleted Courses'}
            </h2>

            <p
              style={{
                color: '#64748b',
                fontSize: 16,
              }}
            >
              {filter === 'available'
                ? 'Create a new course to get started.'
                : 'Deleted courses will appear here.'}
            </p>
          </div>
        ) : (

          /* Course Table */
          <div
            style={{
              overflowX: 'auto',
              borderRadius: 28,
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 18px 40px rgba(0,0,0,0.06)',
            }}
          >
            <table className="min-w-full">

              {/* Head */}
              <thead>
                <tr
                  style={{
                    background:
                      'rgba(255,255,255,0.35)',
                    borderBottom:
                      '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {[
                    'Course Title',
                    'Course ID',
                    'Actions',
                  ].map((head) => (
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

              {/* Body */}
              <tbody>
                {courses.map((course) => (
                  <tr
                    key={course.id}
                    style={{
                      borderTop:
                        '1px solid rgba(255,255,255,0.25)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        'rgba(255,255,255,0.28)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        'transparent';
                    }}
                  >
                    {/* Title */}
                    <td
                      style={{
                        padding: '22px 24px',
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          color: '#0f172a',
                          marginBottom: 4,
                        }}
                      >
                        {course.title}
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          color: '#64748b',
                        }}
                      >
                        Learning Course
                      </div>
                    </td>

                    {/* Slug */}
                    <td
                      style={{
                        padding: '22px 24px',
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 14px',
                          borderRadius: 999,
                          background:
                            'rgba(99,102,241,0.08)',
                          border:
                            '1px solid rgba(99,102,241,0.16)',
                          color: '#6366f1',
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        🆔 {course.id}
                      </div>
                    </td>

                    {/* Actions */}
                    <td
                      style={{
                        padding: '22px 24px',
                      }}
                    >
                      {filter === 'available' ? (
                        <button
                          onClick={() =>
                            handleDelete(
                              course.id,
                              course.title
                            )
                          }
                          disabled={
                            actionLoading ===
                            course.id
                          }
                          style={{
                            padding: '10px 16px',
                            borderRadius: 14,
                            background:
                              'rgba(239,68,68,0.08)',
                            border:
                              '1px solid rgba(239,68,68,0.14)',
                            color: '#ef4444',
                            fontWeight: 700,
                          }}
                        >
                          {actionLoading ===
                          course.id
                            ? 'Deleting...'
                            : 'Delete'}
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleRestore(
                              course.id,
                              course.title
                            )
                          }
                          disabled={
                            actionLoading ===
                            course.id
                          }
                          style={{
                            padding: '10px 16px',
                            borderRadius: 14,
                            background:
                              'rgba(16,185,129,0.08)',
                            border:
                              '1px solid rgba(16,185,129,0.14)',
                            color: '#10b981',
                            fontWeight: 700,
                          }}
                        >
                          {actionLoading ===
                          course.id
                            ? 'Restoring...'
                            : 'Restore'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/author')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 18px',
              borderRadius: 14,
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#6366f1',
              fontWeight: 700,
              boxShadow: '0 10px 28px rgba(0,0,0,0.05)',
            }}
          >
            ← Back to Author Dashboard
          </button>
        </div>
      </main>
    </div>
  </div>
);
};

export default DeleteCourse;