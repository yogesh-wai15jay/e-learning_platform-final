import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import Logo from './Logo';
import HorizontalScrollSection from './HorizontalScrollSection';

/* ── Status pill component ── */
const StatusPill = ({ label, color }) => {
  const colorMap = {
    'text-gray-400':  { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8', border: 'rgba(148,163,184,0.25)', dot: '#94a3b8' },
    'text-green-600': { bg: 'rgba(16,185,129,0.10)',  text: '#059669', border: 'rgba(16,185,129,0.25)',  dot: '#10b981' },
    'text-yellow-600':{ bg: 'rgba(245,158,11,0.10)',  text: '#d97706', border: 'rgba(245,158,11,0.25)',  dot: '#f59e0b' },
    'text-gray-500':  { bg: 'rgba(100,116,139,0.10)', text: '#475569', border: 'rgba(100,116,139,0.2)', dot: '#64748b' },
  };
  const c = colorMap[color] || colorMap['text-gray-500'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 100, whiteSpace: 'nowrap',
      fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
      {label}
    </span>
  );
};

const LandingPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignedTopics, setAssignedTopics] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    fetchAssignedCourses();
  }, []);

  const fetchAssignedCourses = async () => {
    try {
      const response = await api.get('/assignments/my-assignments');
      setAssignedTopics(response.data);
    } catch (error) {
      console.error('Failed to load assigned courses');
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') navigate('/admin');
  }, [user]);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await api.get('/topics');
      setTopics(response.data);
    } catch (error) {
      toast.error('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  /* ── All original helper functions — completely untouched ── */
  const getProgressText = (topic) => {
    if (!topic.contentAvailable) return 'Coming Soon';
    if (topic.progress?.completed) return 'Completed ✓';
    if (topic.completedModules > 0) return 'In Progress';
    return 'Not Started';
  };

  const getProgressColor = (topic) => {
    if (!topic.contentAvailable) return 'text-gray-400';
    if (topic.progress?.completed) return 'text-green-600';
    if (topic.completedModules > 0) return 'text-yellow-600';
    return 'text-gray-500';
  };

  const getProgressPercentage = (topic) => {
    if (topic.progress?.completed) return 100;
    if (!topic.contentAvailable || topic.totalModules === 0) return 0;
    const modulePercentage = Math.round((topic.completedModules / topic.totalModules) * 100);
    if (modulePercentage === 100 && !topic.progress?.completed) return 99;
    return modulePercentage;
  };

  const handleTopicClick = (topic) => {
    if (topic.contentAvailable) {
      navigate(`/topic/${topic.id}`);
    } else {
      toast('Content coming soon!', { icon: '📚' });
    }
  };

  /* ── accent colour derived from existing getProgressColor logic ── */
  const getAccent = (topic) => {
    const c = getProgressColor(topic);
    if (c === 'text-green-600')  return '#10b981';
    if (c === 'text-yellow-600') return '#f59e0b';
    if (c === 'text-gray-400')   return '#94a3b8';
    return '#6366f1'; // not started → indigo
  };

  const renderTopicCard = (topic) => {
    const percentage = getProgressPercentage(topic);
    const isNotStarted = !topic.progress?.completed && topic.completedModules === 0 && topic.contentAvailable;
    const isInProgress = !topic.progress?.completed && topic.completedModules > 0;
    const isCompleted = topic.progress?.completed === true;

    const accent = getAccent(topic);
    const isHovered = hoveredCard === topic.id;

    return (
      <div
        onClick={() => handleTopicClick(topic)}
        onMouseEnter={() => setHoveredCard(topic.id)}
        onMouseLeave={() => setHoveredCard(null)}
        style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '24px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          border: `1.5px solid ${isHovered ? accent : 'rgba(0,0,0,0.07)'}`,
          boxShadow: isHovered
            ? `0 16px 36px ${accent}22, 0 2px 8px rgba(0,0,0,0.06)`
            : '0 2px 12px rgba(0,0,0,0.06)',
          transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
          transition: 'all 0.26s cubic-bezier(0.4,0,0.2,1)',
          opacity: !topic.contentAvailable ? 0.78 : 1,
        }}
      >
        {/* Top accent bar — appears on hover */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: accent, borderRadius: '16px 16px 0 0',
          opacity: isHovered ? 1 : 0, transition: 'opacity 0.25s',
        }} />

        {/* Subtle radial tint on hover */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse at 10% 0%, ${accent}12 0%, transparent 55%)`,
          opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s',
        }} />

        {/* Title + status pill */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
          <h3 style={{
            margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a',
            lineHeight: 1.35, letterSpacing: '-0.01em', flex: 1,
          }}>
            {topic.name}
          </h3>
          <StatusPill label={getProgressText(topic)} color={getProgressColor(topic)} />
        </div>

        {/* Est. time — original icon + text, just restyled */}
        <div className="flex-1">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', marginBottom: 16 }}>
            <svg style={{ width: 15, height: 15, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span style={{ fontSize: 13 }}>Est. {topic.estimatedTime} min</span>
          </div>
        </div>

        {/* Bottom CTAs — all original conditions preserved */}
        <div className="mt-auto">

          {isNotStarted && (
            <button
              style={{
                width: '100%', padding: '10px 0', borderRadius: 10,
                background: isHovered ? '#6366f1' : 'rgba(99,102,241,0.08)',
                color: isHovered ? '#ffffff' : '#6366f1',
                border: `1.5px solid ${isHovered ? '#6366f1' : 'rgba(99,102,241,0.2)'}`,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.22s', letterSpacing: '0.01em',
              }}
            >
              Enroll Now →
            </button>
          )}

          {isInProgress && topic.totalModules > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Progress</span>
                <span style={{ color: '#d97706', fontWeight: 700 }}>{percentage}%</span>
              </div>
              <div style={{ width: '100%', height: 7, background: '#e2e8f0', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 100,
                  width: `${percentage}%`,
                  background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                  boxShadow: '0 0 8px rgba(245,158,11,0.45)',
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 5 }}>
                {topic.completedModules} of {topic.totalModules} modules completed
              </div>
            </div>
          )}

          {isCompleted && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="11" height="11" fill="white" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>Course Completed</span>
            </div>
          )}

          {!topic.contentAvailable && (
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.18)',
              fontSize: 13, color: '#94a3b8', fontWeight: 500,
            }}>
              Content under development
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ── Original loading spinner — untouched ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  /* ── All original data processing — completely untouched ── */
  const topicsMap = new Map();
  topics.forEach(t => topicsMap.set(t.id, t));

  const enrichedAssignedTopics = assignedTopics.map(assigned => {
    const fullTopic = topicsMap.get(assigned.id);
    if (fullTopic) {
      return { ...assigned, progress: fullTopic.progress, completedModules: fullTopic.completedModules, totalModules: fullTopic.totalModules };
    }
    return assigned;
  });

  const assignedNotStarted = enrichedAssignedTopics.filter(t =>
    t.contentAvailable && !t.progress?.completed && t.completedModules === 0
  );

  const continueLearning = topics.filter(t =>
    t.contentAvailable && (t.completedModules > 0 || t.progress?.completed === true)
  );
  continueLearning.sort((a, b) => {
    const aCompleted = a.progress?.completed === true;
    const bCompleted = b.progress?.completed === true;
    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;
    return 0;
  });

  const assignedIds = new Set(enrichedAssignedTopics.map(t => t.id));
  const availableCourses = topics.filter(t =>
    t.contentAvailable && !assignedIds.has(t.id) && !t.progress?.completed && t.completedModules === 0
  );
  availableCourses.sort((a, b) => a.name.localeCompare(b.name));

  const upcoming = topics.filter(t => !t.contentAvailable && !assignedIds.has(t.id));
  upcoming.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen">

      {/* ── Exact original navbar — zero changes ── */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
    <Logo className="h-10" />

    <div className="flex items-center gap-4">

      {/* Welcome Badge */}
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
        Welcome, {user?.name}
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
          transition: 'all 0.2s',
        }}
      >
        Logout
      </button>
    </div>
  </div>
</header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Greeting strip (UI-only addition, no data or routing changes) ── */}
        <div style={{ marginBottom: 36 }}>
          <p style={{
            fontSize: 13, fontWeight: 600, color: '#6366f1',
            letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px',
          }}>
            Your Learning Hub
          </p>
          <h1 style={{
            fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800,
            color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 6px', lineHeight: 1.2,
          }}>
            Welcome back, <span style={{ color: '#6366f1' }}>{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
            Pick up where you left off, or explore something new.
          </p>
        </div>

        {/* ── Course sections — exact same components, same props, same conditions ── */}
        {continueLearning.length > 0 && (
          <HorizontalScrollSection
            title="Continue Learning"
            topics={continueLearning}
            renderTopicCard={renderTopicCard}
          />
        )}

        {assignedNotStarted.length > 0 && (
          <HorizontalScrollSection
            title="Assigned to You"
            topics={assignedNotStarted}
            renderTopicCard={renderTopicCard}
          />
        )}

        {availableCourses.length > 0 && (
          <HorizontalScrollSection
            title="Available Courses"
            topics={availableCourses}
            renderTopicCard={renderTopicCard}
          />
        )}

        {upcoming.length > 0 && (
          <HorizontalScrollSection
            title="Upcoming Courses"
            topics={upcoming}
            renderTopicCard={renderTopicCard}
          />
        )}
      </main>
    </div>
  );
};

export default LandingPage;
