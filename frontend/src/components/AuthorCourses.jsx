import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

const AuthorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses/author/courses');
      setCourses(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
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

    <div className="relative z-10 max-w-7xl mx-auto px-4 py-10">

      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 20,
          flexWrap: 'wrap',
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
            My Courses
          </h1>

          <p
            style={{
              color: '#64748b',
              fontSize: 15,
              maxWidth: 650,
              lineHeight: 1.7,
            }}
          >
            Create, manage, and review your learning courses and training content.
          </p>
        </div>

        {/* Create Button */}
        <button
          onClick={() => navigate('/author/create-course')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 20px',
            borderRadius: 16,
            background: '#6366f1',
            color: '#ffffff',
            border: 'none',
            fontWeight: 700,
            fontSize: 14,
            boxShadow: '0 12px 28px rgba(99,102,241,0.28)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>

          Create New Course
        </button>
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
            📚
          </div>

          <h2
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: '#0f172a',
              marginBottom: 14,
            }}
          >
            No Courses Yet
          </h2>

          <p
            style={{
              color: '#64748b',
              fontSize: 16,
              marginBottom: 28,
            }}
          >
            You haven't created any courses yet.
          </p>

          <button
            onClick={() => navigate('/author/create-course')}
            style={{
              padding: '14px 22px',
              borderRadius: 16,
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              boxShadow: '0 12px 28px rgba(99,102,241,0.28)',
            }}
          >
            Create Your First Course →
          </button>
        </div>
      ) : (

        /* Course Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
          {courses.map((course) => (
            <div
              key={course._id}
              onClick={() => navigate(`/author/course/${course._id}`)}
              style={{
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 28,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: '0 18px 40px rgba(0,0,0,0.05)',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  'translateY(-6px)';
                e.currentTarget.style.boxShadow =
                  '0 24px 50px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 18px 40px rgba(0,0,0,0.05)';
              }}
            >
              {/* Accent Glow */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(circle at top right, rgba(99,102,241,0.10), transparent 45%)',
                  pointerEvents: 'none',
                }}
              />

              <div className="p-7 relative z-10">

                {/* Top */}
                <div className="flex justify-between items-start gap-4 mb-5">
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 18,
                      background:
                        'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))',
                      border:
                        '1px solid rgba(99,102,241,0.16)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                    }}
                  >
                    📘
                  </div>

                  {!course.contentAvailable && (
                    <div
                      style={{
                        padding: '7px 12px',
                        borderRadius: 999,
                        background:
                          'rgba(245,158,11,0.12)',
                        border:
                          '1px solid rgba(245,158,11,0.2)',
                        color: '#b45309',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Not Published
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: '#0f172a',
                    lineHeight: 1.3,
                    marginBottom: 16,
                  }}
                  className="line-clamp-2"
                >
                  {course.title}
                </h3>

                {/* Course ID */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 14px',
                    borderRadius: 999,
                    background:
                      'rgba(99,102,241,0.08)',
                    border:
                      '1px solid rgba(99,102,241,0.16)',
                    color: '#6366f1',
                    fontSize: 13,
                    fontWeight: 700,
                    marginBottom: 22,
                  }}
                >
                  🆔 {course.id}
                </div>

                {/* Footer */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    paddingTop: 18,
                    borderTop:
                      '1px solid rgba(255,255,255,0.35)',
                    color: '#64748b',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <span>
                    📅{' '}
                    {new Date(
                      course.createdAt
                    ).toLocaleDateString()}
                  </span>

                  <span>
                    ⏱️ {course.estimatedTime} min
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
};

export default AuthorCourses;