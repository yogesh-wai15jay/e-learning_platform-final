import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

const AuthorCourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourseDetail();
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      const response = await api.get(`/courses/author/course/${id}`);
      setCourse(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load course details');
      navigate('/author/courses');
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

  if (!course) return null;

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

    <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">

      {/* Back Button */}
      <button
        onClick={() => navigate('/author/courses')}
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
          marginBottom: 28,
          boxShadow: '0 10px 28px rgba(0,0,0,0.05)',
        }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>

        Back to My Courses
      </button>

      {/* Course Header */}
      <div
        style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 28,
          padding: 32,
          marginBottom: 38,
          boxShadow: '0 18px 40px rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex flex-wrap justify-between gap-6 items-start">

          <div className="flex-1 min-w-[280px]">
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#6366f1',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              Course Details
            </p>

            <h1
              style={{
                fontSize: 'clamp(30px, 4vw, 46px)',
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginBottom: 18,
              }}
            >
              {course.title}
            </h1>

            <div className="flex flex-wrap gap-3 text-sm">
              {[
                `🆔 Course ID: ${course.id}`,
                `⏱️ ${course.estimatedTime} min`,
                `📅 ${new Date(course.createdAt).toLocaleDateString()}`,
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 999,
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.16)',
                    color: '#6366f1',
                    fontWeight: 600,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            {course.contentAvailable === false && (
              <div
                style={{
                  marginTop: 18,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 16px',
                  borderRadius: 14,
                  background: 'rgba(245,158,11,0.12)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  color: '#b45309',
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                ⚠️ Not yet published – students cannot see this course
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="mb-12">
        <div className="mb-6">
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
            Learning Modules
          </p>

          <h2
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.03em',
            }}
          >
            Course Content
          </h2>
        </div>

        {course.subtopics && course.subtopics.length > 0 ? (
          <div className="space-y-8">
            {course.subtopics.map((sub, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 28,
                  overflow: 'hidden',
                  boxShadow: '0 18px 40px rgba(0,0,0,0.06)',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: '24px 28px',
                    borderBottom: '1px solid rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.28)',
                  }}
                >
                  <div className="flex justify-between items-center gap-4 flex-wrap">
                    <h3
                      style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: '#0f172a',
                      }}
                    >
                      {idx + 1}. {sub.title}
                    </h3>

                    <div
                      style={{
                        padding: '8px 14px',
                        borderRadius: 999,
                        background: 'rgba(99,102,241,0.08)',
                        border: '1px solid rgba(99,102,241,0.16)',
                        color: '#6366f1',
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      ⏱️ {sub.estimatedTime} min
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-7">

                  {/* Video */}
                  {sub.videoUrl && (
                    <div className="mb-8">
                      <video
                        controls
                        className="w-full rounded-2xl shadow-xl"
                      >
                        <source
                          src={`${window.location.origin}${sub.videoUrl}`}
                          type="video/mp4"
                        />
                      </video>
                    </div>
                  )}

                  {/* Images */}
                  {sub.imageUrls && sub.imageUrls.length > 0 && (
                    <div className="mb-8">
                      <h4
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: '#334155',
                          marginBottom: 16,
                        }}
                      >
                        Images
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sub.imageUrls.map((imgUrl, idx) => (
                          <img
                            key={idx}
                            src={imgUrl}
                            alt={`module-img-${idx}`}
                            className="w-full h-56 object-cover rounded-2xl shadow-lg cursor-pointer hover:scale-[1.02] transition"
                            onClick={() => setSelectedImage(imgUrl)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PDFs */}
                  {sub.pdfUrls && sub.pdfUrls.length > 0 && (
                    <div className="mb-8">
                      <h4
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: '#334155',
                          marginBottom: 16,
                        }}
                      >
                        Documents
                      </h4>

                      <div className="space-y-3">
                        {sub.pdfUrls.map((pdfUrl, pdfIdx) => (
                          <a
                            key={pdfIdx}
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '14px 16px',
                              borderRadius: 16,
                              background: 'rgba(255,255,255,0.45)',
                              border: '1px solid rgba(255,255,255,0.3)',
                              color: '#2563eb',
                              fontWeight: 700,
                              textDecoration: 'none',
                            }}
                          >
                            📄 Document {pdfIdx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div
                    className="prose max-w-none"
                    style={{
                      color: '#334155',
                      lineHeight: 1.8,
                    }}
                    dangerouslySetInnerHTML={{
                      __html:
                        sub.content ||
                        '<em>No content provided</em>',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              background: 'rgba(255,255,255,0.45)',
              backdropFilter: 'blur(14px)',
              borderRadius: 24,
              padding: 60,
              textAlign: 'center',
            }}
          >
            <p className="text-gray-500">
              No subtopics added to this course yet.
            </p>
          </div>
        )}
      </div>

      {/* Quiz */}
      <div>
        <div className="mb-6">
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
            Final Assessment
          </p>

          <h2
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.03em',
            }}
          >
            Assessment Quiz
          </h2>
        </div>

        {course.questions && course.questions.length > 0 ? (
          <div className="space-y-6">
            {course.questions.map((q, qIdx) => (
              <div
                key={q._id}
                style={{
                  background: 'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 24,
                  padding: 28,
                  boxShadow: '0 18px 40px rgba(0,0,0,0.05)',
                }}
              >
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: '#0f172a',
                    marginBottom: 24,
                    lineHeight: 1.5,
                  }}
                >
                  Question {qIdx + 1}: {q.text}
                </p>

                {q.options && q.options.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {q.options.map((opt) => {
                      const isCorrect =
                        q.correctAnswers.includes(opt.text);

                      return (
                        <div
                          key={opt.letter}
                          style={{
                            padding: '16px 18px',
                            borderRadius: 16,
                            background: isCorrect
                              ? 'rgba(16,185,129,0.1)'
                              : 'rgba(255,255,255,0.4)',
                            border: isCorrect
                              ? '1px solid rgba(16,185,129,0.2)'
                              : '1px solid rgba(255,255,255,0.3)',
                            color: isCorrect
                              ? '#047857'
                              : '#334155',
                            fontWeight: isCorrect ? 700 : 500,
                          }}
                        >
                          <span className="font-mono mr-2">
                            {opt.letter}.
                          </span>

                          {opt.text}

                          {isCorrect && (
                            <span className="ml-3 text-sm">
                              ✓ Correct Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.explanation && (
                  <div
                    style={{
                      padding: '18px 20px',
                      borderRadius: 18,
                      background: 'rgba(59,130,246,0.08)',
                      border: '1px solid rgba(59,130,246,0.14)',
                      color: '#1d4ed8',
                      lineHeight: 1.7,
                    }}
                  >
                    <span className="font-semibold">
                      💡 Explanation:
                    </span>{' '}
                    {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              background: 'rgba(255,255,255,0.45)',
              backdropFilter: 'blur(14px)',
              borderRadius: 24,
              padding: 60,
              textAlign: 'center',
            }}
          >
            <p className="text-gray-500">
              No quiz questions for this course yet.
            </p>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-full">
            <img
              src={selectedImage}
              alt="Zoomed view"
              className="max-w-full max-h-[90vh] object-contain rounded-3xl shadow-2xl"
            />

            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                border: 'none',
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default AuthorCourseDetail;