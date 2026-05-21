import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const actions = [
  {
    id: 'view',
    label: 'View All Courses',
    description: 'Browse and learn from existing courses',
    route: '/author/courses',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <rect x="6" y="8" width="24" height="32" rx="3" fill="currentColor" opacity="0.15"/>
        <rect x="10" y="4" width="24" height="32" rx="3" fill="currentColor" opacity="0.25"/>
        <rect x="14" y="8" width="24" height="32" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
        <line x1="20" y1="18" x2="32" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="20" y1="24" x2="32" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="20" y1="30" x2="28" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    accent: '#60A5FA',
    glow: 'rgba(96,165,250,0.25)',
    tag: 'Library',
  },
  {
    id: 'create',
    label: 'Create a Course',
    description: 'Build a new course with modules and quiz',
    route: '/author/create-course',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <circle cx="24" cy="24" r="18" fill="currentColor" opacity="0.12"/>
        <line x1="24" y1="14" x2="24" y2="34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="14" y1="24" x2="34" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    ),
    accent: '#34D399',
    glow: 'rgba(52,211,153,0.25)',
    tag: 'New',
  },
  {
    id: 'edit',
    label: 'Edit a Course',
    description: 'Modify and improve existing courses',
    route: '/author/edit-course',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <rect x="8" y="10" width="26" height="32" rx="3" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="2"/>
        <path d="M30 6l8 8-16 16H14v-8L30 6z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
    accent: '#FBBF24',
    glow: 'rgba(251,191,36,0.25)',
    tag: 'Edit',
  },
  {
    id: 'delete',
    label: 'Delete a Course',
    description: 'Remove a course permanently',
    route: '/author/delete-course',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <rect x="12" y="16" width="24" height="24" rx="3" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="2"/>
        <line x1="8" y1="16" x2="40" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 16V12a2 2 0 012-2h4a2 2 0 012 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="20" y1="24" x2="20" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="28" y1="24" x2="28" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    accent: '#F87171',
    glow: 'rgba(248,113,113,0.25)',
    tag: 'Danger',
  },
  {
    id: 'assign',
    label: 'Assign a Course',
    description: 'Assign courses to users',
    route: '/author/assign-course',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <circle cx="18" cy="18" r="7" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 38c0-6 4.5-10 10-10h4c5.5 0 10 4 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8"/>
        <circle cx="34" cy="18" r="5" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2"/>
        <path d="M30 34c1-3.5 3-5.5 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
        <line x1="38" y1="12" x2="44" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="41" y1="9" x2="41" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    accent: '#C084FC',
    glow: 'rgba(192,132,252,0.25)',
    tag: 'Users',
  },
];

const AuthorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (user?.role !== 'author') {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
  <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
    <Logo className="h-10" />

    <div className="flex items-center gap-4">

      {/* Role Badge */}
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
        Author: {user?.name}
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

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-12">

        {/* Page heading */}
        <div style={{ marginBottom: 48 }}>
          
          <h1 style={{
            fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800,
            margin: 0, lineHeight: 1.15, letterSpacing: '-0.02em', color: '#0f172a',
          }}>
            Welcome back, <span style={{ color: '#0284c7' }}>{user.name.split(' ')[0]}</span>.
          </h1>
          <p style={{ marginTop: 10, fontSize: 15, color: '#64748b', lineHeight: 1.6, maxWidth: 440 }}>
            Manage your courses, create new content, and assign learning paths to your users.
          </p>
        </div>

        {/* Cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 22,
        }}>
          {actions.map((action, i) => {
            const isHovered = hoveredCard === action.id;

            return (
              <div
                key={action.id}
                onClick={() => navigate(action.route)}
                onMouseEnter={() => setHoveredCard(action.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  position: 'relative',
                  background: '#ffffff',
                  border: `1.5px solid ${isHovered ? action.accent : 'rgba(0,0,0,0.07)'}`,
                  borderRadius: 18,
                  padding: '32px 28px 28px',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                  transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
                  boxShadow: isHovered
                    ? `0 16px 40px ${action.glow}, 0 2px 8px rgba(0,0,0,0.06)`
                    : '0 2px 12px rgba(0,0,0,0.07)',
                  overflow: 'hidden',
                  opacity: mounted ? 1 : 0,
                  transitionDelay: mounted ? '0s' : `${i * 0.07}s`,
                }}
              >
                {/* Top accent bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                  background: action.accent,
                  borderRadius: '18px 18px 0 0',
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.25s',
                }} />

                {/* Subtle tint on hover */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `radial-gradient(ellipse at 15% 15%, ${action.glow} 0%, transparent 55%)`,
                  opacity: isHovered ? 0.6 : 0,
                  transition: 'opacity 0.3s',
                  pointerEvents: 'none',
                }} />

                {/* Top row: icon box + tag pill */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26 }}>
                  <div style={{
                    width: 58, height: 58, borderRadius: 14,
                    background: `${action.accent}18`,
                    border: `1.5px solid ${action.accent}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: action.accent,
                    transition: 'transform 0.25s, box-shadow 0.25s',
                    transform: isHovered ? 'scale(1.1) rotate(-3deg)' : 'scale(1)',
                    boxShadow: isHovered ? `0 6px 20px ${action.glow}` : 'none',
                  }}>
                    {action.icon}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: action.accent,
                    padding: '4px 10px',
                    background: `${action.accent}15`,
                    border: `1px solid ${action.accent}30`,
                    borderRadius: 100,
                  }}>
                    {action.tag}
                  </span>
                </div>

                {/* Text */}
                <h3 style={{
                  margin: '0 0 8px', fontSize: 18, fontWeight: 700,
                  color: '#0f172a', letterSpacing: '-0.01em',
                }}>
                  {action.label}
                </h3>
                <p style={{ margin: 0, fontSize: 14, color: '#64748b', lineHeight: 1.65 }}>
                  {action.description}
                </p>

                {/* Slide-in CTA */}
                <div style={{
                  marginTop: 22,
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 13, fontWeight: 700, color: action.accent,
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? 'translateX(0)' : 'translateX(-8px)',
                  transition: 'all 0.25s',
                }}>
                  Get started
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info strip */}
        <div style={{
          marginTop: 52, padding: '18px 26px',
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: 14, display: 'flex', alignItems: 'center',
          gap: 28, flexWrap: 'wrap',
        }}>
          {[
            { label: 'Total Actions', value: '5', accent: '#0284c7' },
            { label: 'Role', value: 'Author', accent: '#10b981' },
            { label: 'Status', value: 'Active', accent: '#f59e0b' },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: stat.accent }} />
              <span style={{ fontSize: 13, color: '#94a3b8' }}>{stat.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: stat.accent }}>{stat.value}</span>
            </div>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#cbd5e1' }}>
            Digital Business People · Author Studio
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthorDashboard;
