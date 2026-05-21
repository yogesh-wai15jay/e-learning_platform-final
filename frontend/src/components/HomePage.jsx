import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

// Import your local course images
// Place these images inside frontend/src/assets/ folder
// Update the file names to match your actual image names
import aiCourseImg from '../assets/ai-course.jpeg';
import serverCourseImg from '../assets/server-course.webp';
import leaveCourseImg from '../assets/leave-course.jfif';

const HomePage = () => {
  return (
  <div className="relative min-h-screen overflow-x-hidden bg-black">

    {/* ================= NAVBAR ================= */}
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Logo className="h-10" />

        <div className="flex items-center gap-4">

          {/* Login */}
          <Link
            to="/login"
            style={{
              padding: '10px 18px',
              borderRadius: 14,
              background: 'rgba(15,23,42,0.08)',
              border: '1px solid rgba(15,23,42,0.12)',
              color: '#0f172a',
              fontWeight: 700,
              transition: 'all 0.2s',
            }}
          >
            Login
          </Link>

          {/* Signup */}
          <Link
            to="/signup"
            style={{
              padding: '10px 18px',
              borderRadius: 14,
              background: '#ec4899',
              color: '#ffffff',
              fontWeight: 700,
              boxShadow:
                '0 12px 24px rgba(236,72,153,0.28)',
              transition: 'all 0.2s',
            }}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>

    {/* ================= HERO ================= */}
    <section className="relative min-h-screen flex items-center justify-center">

      {/* Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="/videos/hero-bg.mp4"
          type="video/mp4"
        />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Decorative Glow */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(236,72,153,0.18), transparent 70%)',
          top: -120,
          right: -100,
          filter: 'blur(20px)',
        }}
      />

      {/* Hero Content */}
      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">



        {/* Heading */}
        <h1
  className="leading-[1.25] pb-6"
  style={{
    fontSize: 'clamp(42px, 7vw, 82px)',
    fontWeight: 900,
    letterSpacing: '-0.01em',
    color: '#ffffff',
    marginBottom: 26,
  }}
>
  <span
    className="inline-block"
    style={{
      background:
        'linear-gradient(135deg, #ec4899, #8b5cf6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}
  >
    Learn with DBP
  </span>

  <br />

  where business meets excellence.
</h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(18px, 2vw, 24px)',
            color: 'rgba(255,255,255,0.82)',
            lineHeight: 1.8,
            maxWidth: 900,
            margin: '0 auto 42px',
            fontWeight: 500,
          }}
        >
          Empower your career, one module at a time.
          Learn modern business practices, security,
          compliance, and digital transformation through
          interactive enterprise-grade courses.
        </p>

        {/* CTA */}
        <div className="flex flex-wrap justify-center gap-5">

          <Link
            to="/signup"
            style={{
              padding: '16px 28px',
              borderRadius: 18,
              background: '#ec4899',
              color: '#fff',
              fontWeight: 800,
              fontSize: 16,
              boxShadow:
                '0 14px 32px rgba(236,72,153,0.32)',
            }}
          >
            Get Started
          </Link>

          <Link
            to="/login"
            style={{
              padding: '16px 28px',
              borderRadius: 18,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              fontWeight: 700,
              backdropFilter: 'blur(12px)',
            }}
          >
            Explore Platform
          </Link>
        </div>
      </div>
    </section>

    {/* ================= COURSES ================= */}
    <section
      className="relative py-24"
      style={{
        background:
          'linear-gradient(to bottom, #f8fafc, #eef2ff)',
      }}
    >

      {/* Decorative Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at top right, rgba(99,102,241,0.08), transparent 30%)',
          pointerEvents: 'none',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-16">

          <p
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#6366f1',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Featured Learning
          </p>

          <h2
            style={{
              fontSize: 'clamp(34px, 5vw, 58px)',
              fontWeight: 900,
              color: '#0f172a',
              
              lineHeight: 1.05,
              marginBottom: 18,
            }}
          >
            Featured Courses
          </h2>

          <p
            style={{
              color: '#64748b',
              fontSize: 18,
              maxWidth: 700,
              margin: '0 auto',
              lineHeight: 1.8,
            }}
          >
            Start your learning journey with expert-led
            enterprise training courses designed for
            modern professionals.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

          {[
            {
              image: aiCourseImg,
              title:
                'Secure & Responsible AI Usage',
              description:
                'Learn how to use AI tools securely, protect sensitive data, and adopt a Zero-Trust mindset.',
              duration: '60 min',
              emoji: '🤖',
            },
            {
              image: serverCourseImg,
              title: 'Server Policies',
              description:
                'Master server configuration, security policies, and best practices for enterprise infrastructure.',
              duration: '40 min',
              emoji: '🖥️',
            },
            {
              image: leaveCourseImg,
              title: 'Leave Policy',
              description:
                "Understand company leave policies, approvals, compliance, and employee procedures.",
              duration: '30 min',
              emoji: '📄',
            },
          ].map((course, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255,255,255,0.68)',
                backdropFilter: 'blur(18px)',
                border:
                  '1px solid rgba(255,255,255,0.45)',
                borderRadius: 30,
                overflow: 'hidden',
                transition: 'all 0.25s ease',
                boxShadow:
                  '0 20px 45px rgba(0,0,0,0.06)',
              }}
              className="group"
            >

              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-60 object-cover group-hover:scale-105 transition duration-500"
                />

                <div
                  style={{
                    position: 'absolute',
                    top: 18,
                    left: 18,
                    padding: '8px 14px',
                    borderRadius: 999,
                    background:
                      'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(12px)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {course.emoji} Featured
                </div>
              </div>

              {/* Content */}
              <div className="p-7">

                <h3
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: '#0f172a',
                    lineHeight: 1.25,
                    marginBottom: 14,
                  }}
                >
                  {course.title}
                </h3>

                <p
                  style={{
                    color: '#64748b',
                    lineHeight: 1.8,
                    marginBottom: 24,
                    fontSize: 15,
                  }}
                >
                  {course.description}
                </p>

                {/* Bottom */}
                <div className="flex justify-between items-center">

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
                        '1px solid rgba(99,102,241,0.14)',
                      color: '#6366f1',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    ⏱️ {course.duration}
                  </div>

                  <Link
                    to="/signup"
                    style={{
                      padding: '12px 18px',
                      borderRadius: 14,
                      background: '#6366f1',
                      color: '#fff',
                      fontWeight: 700,
                      boxShadow:
                        '0 12px 24px rgba(99,102,241,0.22)',
                    }}
                  >
                    Enroll
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ================= FOOTER ================= */}
    <footer
      style={{
        background:
          'linear-gradient(135deg, #0f172a, #111827)',
        color: '#fff',
        padding: '42px 20px',
        textAlign: 'center',
        borderTop:
          '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto">

        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            marginBottom: 12,
            letterSpacing: '-0.03em',
          }}
        >
          Digital Business People
        </div>

        <p
          style={{
            color: 'rgba(255,255,255,0.65)',
            marginBottom: 18,
            lineHeight: 1.8,
          }}
        >
          Empowering modern enterprise learning experiences.
        </p>

        <div
          style={{
            width: 80,
            height: 1,
            background:
              'rgba(255,255,255,0.12)',
            margin: '0 auto 18px',
          }}
        />

        <p
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 14,
          }}
        >
          © 2026 Digital Business People. All rights
          reserved.
        </p>
      </div>
    </footer>
  </div>
);
};

export default HomePage;