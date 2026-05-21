import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const PRIMARY = '#6366f1';
const GREEN = '#10b981';
const RED = '#ef4444';

const QuizResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { topicId } = useParams();
  const { result, topicTitle } = location.state || {};

  if (!result) {
    navigate(`/topic/${topicId}`);
    return null;
  }

  const { correctCount, totalQuestions, passed, results } = result;
  const percentage = (correctCount / totalQuestions) * 100;

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'transparent',
        padding: '40px 16px',
      }}
    >
      <div className="max-w-5xl mx-auto">

        {/* Top Result Hero */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 24,
            overflow: 'hidden',
            border: `1.5px solid ${
              passed ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)'
            }`,
            boxShadow: passed
              ? '0 20px 60px rgba(16,185,129,0.12)'
              : '0 20px 60px rgba(239,68,68,0.10)',
            marginBottom: 28,
            position: 'relative',
          }}
        >
          {/* Accent Glow */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: passed
                ? 'radial-gradient(circle at top left, rgba(16,185,129,0.10), transparent 45%)'
                : 'radial-gradient(circle at top left, rgba(239,68,68,0.10), transparent 45%)',
            }}
          />

          {/* Top Bar */}
          <div
            style={{
              height: 5,
              background: passed
                ? 'linear-gradient(90deg, #10b981, #34d399)'
                : 'linear-gradient(90deg, #ef4444, #fb7185)',
            }}
          />

          <div
            style={{
              padding: '42px 32px',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              {/* Score Circle */}
              <div
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  background: passed
                    ? 'rgba(16,185,129,0.08)'
                    : 'rgba(239,68,68,0.08)',
                  border: `8px solid ${
                    passed
                      ? 'rgba(16,185,129,0.18)'
                      : 'rgba(239,68,68,0.18)'
                  }`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 28,
                  boxShadow: passed
                    ? '0 10px 30px rgba(16,185,129,0.18)'
                    : '0 10px 30px rgba(239,68,68,0.15)',
                }}
              >
                <div
                  style={{
                    fontSize: 42,
                    fontWeight: 900,
                    lineHeight: 1,
                    color: passed ? GREEN : RED,
                  }}
                >
                  {correctCount}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#64748b',
                    marginTop: 4,
                  }}
                >
                  / {totalQuestions}
                </div>
              </div>

              {/* Heading */}
              <h1
                style={{
                  fontSize: 'clamp(28px, 4vw, 42px)',
                  fontWeight: 900,
                  color: '#0f172a',
                  margin: '0 0 12px',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                }}
              >
                {passed
                  ? '🎉 Congratulations!'
                  : '❌ Better Luck Next Time'}
              </h1>

              <p
                style={{
                  fontSize: 16,
                  color: '#64748b',
                  maxWidth: 640,
                  lineHeight: 1.7,
                  marginBottom: 26,
                }}
              >
                {passed
                  ? `You have successfully completed "${topicTitle}" and passed the final assessment.`
                  : `You need at least 7 correct answers to pass the assessment. Review the modules and try again after 2 hours.`}
              </p>

              {/* Progress Bar */}
              <div style={{ width: '100%', maxWidth: 520 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#64748b',
                    }}
                  >
                    Final Score
                  </span>

                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: passed ? GREEN : RED,
                    }}
                  >
                    {Math.round(percentage)}%
                  </span>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: 10,
                    background: '#e2e8f0',
                    borderRadius: 100,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${percentage}%`,
                      borderRadius: 100,
                      background: passed
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : 'linear-gradient(90deg, #ef4444, #fb7185)',
                      transition: 'width 0.6s ease',
                      boxShadow: passed
                        ? '0 0 18px rgba(16,185,129,0.35)'
                        : '0 0 18px rgba(239,68,68,0.3)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 22,
            border: '1.5px solid rgba(0,0,0,0.06)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '24px 28px',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              background: '#fafcff',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <p
                  style={{
                    margin: '0 0 4px',
                    fontSize: 12,
                    fontWeight: 700,
                    color: PRIMARY,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Assessment Review
                </p>

                <h2
                  style={{
                    margin: 0,
                    fontSize: 24,
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Detailed Results
                </h2>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 100,
                  background: passed
                    ? 'rgba(16,185,129,0.08)'
                    : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${
                    passed
                      ? 'rgba(16,185,129,0.2)'
                      : 'rgba(239,68,68,0.2)'
                  }`,
                  fontSize: 13,
                  fontWeight: 700,
                  color: passed ? GREEN : RED,
                }}
              >
                {passed ? 'Passed ✓' : 'Failed ✗'}
              </div>
            </div>
          </div>

          {/* Questions */}
          <div
            style={{
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              maxHeight: '65vh',
              overflowY: 'auto',
            }}
          >
            {results.map((res, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: 16,
                  padding: 20,
                  border: `1.5px solid ${
                    res.isCorrect
                      ? 'rgba(16,185,129,0.16)'
                      : 'rgba(239,68,68,0.16)'
                  }`,
                  background: res.isCorrect
                    ? 'rgba(16,185,129,0.03)'
                    : 'rgba(239,68,68,0.03)',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 16,
                    marginBottom: res.isCorrect ? 0 : 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: res.isCorrect
                            ? 'rgba(16,185,129,0.12)'
                            : 'rgba(239,68,68,0.12)',
                          color: res.isCorrect ? GREEN : RED,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </div>

                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: '#94a3b8',
                        }}
                      >
                        Question
                      </span>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: 15,
                        lineHeight: 1.7,
                        color: '#334155',
                        fontWeight: 600,
                      }}
                    >
                      {res.questionText}
                    </p>
                  </div>

                  <span
                    style={{
                      padding: '6px 12px',
                      borderRadius: 100,
                      fontSize: 12,
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      background: res.isCorrect
                        ? 'rgba(16,185,129,0.12)'
                        : 'rgba(239,68,68,0.12)',
                      color: res.isCorrect ? GREEN : RED,
                      border: `1px solid ${
                        res.isCorrect
                          ? 'rgba(16,185,129,0.2)'
                          : 'rgba(239,68,68,0.2)'
                      }`,
                    }}
                  >
                    {res.isCorrect ? 'Correct ✓' : 'Wrong ✗'}
                  </span>
                </div>

                {!res.isCorrect && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.7)',
                      border: '1px dashed rgba(239,68,68,0.25)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#ef4444',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        display: 'block',
                        marginBottom: 6,
                      }}
                    >
                      Correct Answer
                    </span>

                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        color: '#475569',
                        lineHeight: 1.6,
                        fontWeight: 500,
                      }}
                    >
                      {res.correctAnswers.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Buttons */}
          <div
            style={{
              padding: '22px 28px',
              borderTop: '1px solid rgba(0,0,0,0.06)',
              background: '#fafcff',
              display: 'flex',
              justifyContent: 'center',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '11px 24px',
                borderRadius: 12,
                background: PRIMARY,
                color: '#ffffff',
                border: 'none',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(99,102,241,0.28)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 8px 24px rgba(99,102,241,0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 4px 18px rgba(99,102,241,0.28)';
              }}
            >
              ← Back to Dashboard
            </button>

            {!passed && (
              <button
                onClick={() => navigate(`/topic/${topicId}`)}
                style={{
                  padding: '11px 24px',
                  borderRadius: 12,
                  background: '#ffffff',
                  color: '#475569',
                  border: '1.5px solid rgba(0,0,0,0.08)',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Review Modules
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;