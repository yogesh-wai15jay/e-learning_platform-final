import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import Logo from './Logo';

const EditCourse = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all courses (the backend should return only the author's courses)
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
  setLoading(true);
  try {
    // Use author‑specific endpoint
    const res = await api.get('/courses/author/courses');
    setCourses(res.data);
  } catch (error) {
    toast.error('Failed to load your courses');
  } finally {
    setLoading(false);
  }
};

  const loadCourse = async (courseId) => {
    setLoading(true);
    try {
      const [courseRes, questionsRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/questions/${courseId}`)
      ]);
      // Ensure passingRatio exists (default to 70 if missing from old data)
      const courseData = courseRes.data;
      if (courseData.passingRatio === undefined) courseData.passingRatio = 70;
      setCourse(courseData);
      setQuestions(questionsRes.data);
    } catch (error) {
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (e) => {
    const id = e.target.value;
    setSelectedCourseId(id);
    if (id) loadCourse(id);
    else setCourse(null);
  };

  // Module management
  const addModule = () => {
  setCourse({
    ...course,
    subtopics: [...course.subtopics, { title: '', estimatedTime: 5, content: '', videoUrl: '', imageUrls: [], pdfUrls: [] }]
  });
};
  const updateModule = (idx, field, value) => {
    const updated = [...course.subtopics];
    updated[idx][field] = value;
    setCourse({ ...course, subtopics: updated });
  };
  const removeModule = (idx) => {
    const updated = course.subtopics.filter((_, i) => i !== idx);
    setCourse({ ...course, subtopics: updated });
  };

  // Upload video for a module (edit mode)
const uploadModuleVideo = async (idx, file) => {
  if (!file) return;
  const formData = new FormData();
  formData.append('video', file);
  try {
    const response = await api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const updated = [...course.subtopics];
    updated[idx].videoUrl = response.data.videoUrl;
    setCourse({ ...course, subtopics: updated });
    toast.success('Video uploaded');
  } catch (error) {
    toast.error('Upload failed');
  }
};

const removeModuleVideo = (idx) => {
  const updated = [...course.subtopics];
  updated[idx].videoUrl = '';
  setCourse({ ...course, subtopics: updated });
};

// ---------- Image upload ----------
const uploadSingleImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.imageUrl;
};

const uploadModuleImages = async (idx, files) => {
  const uploadedUrls = [];
  for (const file of files) {
    try {
      const url = await uploadSingleImage(file);
      uploadedUrls.push(url);
    } catch (err) {
      toast.error(`Failed to upload ${file.name}`);
    }
  }
  if (uploadedUrls.length) {
    const updated = [...course.subtopics];
    updated[idx].imageUrls = [...(updated[idx].imageUrls || []), ...uploadedUrls];
    setCourse({ ...course, subtopics: updated });
    toast.success(`${uploadedUrls.length} image(s) uploaded`);
  }
};

const removeModuleImage = (idx, imageUrl) => {
  const updated = [...course.subtopics];
  updated[idx].imageUrls = updated[idx].imageUrls.filter(url => url !== imageUrl);
  setCourse({ ...course, subtopics: updated });
};

// ---------- PDF upload ----------
const uploadSinglePdf = async (file) => {
  const formData = new FormData();
  formData.append('pdf', file);
  const response = await api.post('/upload/pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.pdfUrl;
};

const uploadModulePdfs = async (idx, files) => {
  const uploadedUrls = [];
  for (const file of files) {
    try {
      const url = await uploadSinglePdf(file);
      uploadedUrls.push(url);
    } catch (err) {
      toast.error(`Failed to upload ${file.name}`);
    }
  }
  if (uploadedUrls.length) {
    const updated = [...course.subtopics];
    updated[idx].pdfUrls = [...(updated[idx].pdfUrls || []), ...uploadedUrls];
    setCourse({ ...course, subtopics: updated });
    toast.success(`${uploadedUrls.length} PDF(s) uploaded`);
  }
};

const removeModulePdf = (idx, pdfUrl) => {
  const updated = [...course.subtopics];
  updated[idx].pdfUrls = updated[idx].pdfUrls.filter(url => url !== pdfUrl);
  setCourse({ ...course, subtopics: updated });
};


  // Question management
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        options: [
          { letter: 'A', text: '' },
          { letter: 'B', text: '' }
        ],
        correctAnswers: [],
        explanation: ''
      }
    ]);
  };
  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    updated[idx][field] = value;
    setQuestions(updated);
  };
  const updateOption = (qIdx, optIdx, field, value) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx][field] = value;
    setQuestions(updated);
  };
  const addOption = (qIdx) => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const nextLetter = letters[questions[qIdx].options.length];
    if (nextLetter) {
      const updated = [...questions];
      updated[qIdx].options.push({ letter: nextLetter, text: '' });
      setQuestions(updated);
    }
  };
  const removeOption = (qIdx, optIdx) => {
    const updated = [...questions];
    updated[qIdx].options = updated[qIdx].options.filter((_, i) => i !== optIdx);
    setQuestions(updated);
  };
  const removeQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!course) return;
    setSubmitting(true);
    try {
      // Update course metadata and modules
      await api.put(`/courses/${course.id}`, {
        title: course.title,
        estimatedTime: course.estimatedTime,
        subtopics: course.subtopics,
        showOnDashboard: course.showOnDashboard,
        placeholderContent: course.placeholderContent,
        passingRatio: course.passingRatio   // <-- added passingRatio
      });
      // Update questions (replace all)
      await api.post(`/questions/${course.id}`, { questions });
      toast.success('Course updated successfully');
      navigate('/author');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update course');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !course) {
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
              Author: {user.name}
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
      <main className="max-w-5xl mx-auto px-4 py-10">

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
            Edit Course
          </h1>

          <p
            style={{
              color: '#64748b',
              fontSize: 15,
              maxWidth: 700,
              lineHeight: 1.7,
            }}
          >
            Update course content, modules, documents,
            videos, and quiz assessments.
          </p>
        </div>

        {/* Course Selector */}
        <div
          style={{
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 28,
            padding: 28,
            marginBottom: 32,
            boxShadow: '0 18px 40px rgba(0,0,0,0.05)',
          }}
        >
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Select Course
          </label>

          <select
            value={selectedCourseId}
            onChange={handleCourseSelect}
            className="w-full rounded-2xl border border-white/30 bg-white/70 backdrop-blur-md px-4 py-3 outline-none"
          >
            <option value="">
              -- Choose a course --
            </option>

            {courses.map((c) => (
              <option
                key={c.id}
                value={c.id}
              >
                {c.title} ({c.id})
              </option>
            ))}
          </select>
        </div>

        {course && (
          <form
            onSubmit={handleSubmit}
            className="space-y-10"
          >

            {/* Course Info */}
            <div
              style={{
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 28,
                padding: 32,
                boxShadow:
                  '0 18px 40px rgba(0,0,0,0.05)',
              }}
            >
              <div className="mb-6">
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
                  Course Details
                </p>

                <h2
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: '#0f172a',
                  }}
                >
                  Course Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Title *
    </label>

    <input
      type="text"
      value={course.title}
      onChange={(e) =>
        setCourse({
          ...course,
          title: e.target.value,
        })
      }
      required
      className="w-full rounded-2xl border border-white/30 bg-white/70 backdrop-blur-md px-4 py-3 outline-none"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Estimated Time (minutes)
    </label>

    <input
      type="number"
      value={course.estimatedTime}
      onChange={(e) =>
        setCourse({
          ...course,
          estimatedTime: parseInt(
            e.target.value
          ),
        })
      }
      className="w-full rounded-2xl border border-white/30 bg-white/70 backdrop-blur-md px-4 py-3 outline-none"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Passing Ratio (%)
    </label>

    <input
      type="number"
      min="0"
      max="100"
      value={course.passingRatio}
      onChange={(e) =>
        setCourse({
          ...course,
          passingRatio: Number(
            e.target.value
          ),
        })
      }
      className="w-full rounded-2xl border border-white/30 bg-white/70 backdrop-blur-md px-4 py-3 outline-none"
    />

    <p className="text-xs text-gray-500 mt-2">
      e.g., 70 means 7 out of 10 correct
    </p>
  </div>

  <div className="flex items-center gap-3">
    <input
      type="checkbox"
      checked={course.showOnDashboard}
      onChange={(e) =>
        setCourse({
          ...course,
          showOnDashboard:
            e.target.checked,
        })
      }
      className="w-4 h-4"
    />

    <label className="text-sm text-gray-700">
      Show on dashboard
    </label>
  </div>
</div>
            </div>

            {/* Modules */}
            <div
              style={{
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 28,
                padding: 32,
                boxShadow:
                  '0 18px 40px rgba(0,0,0,0.05)',
              }}
            >
              <div className="flex justify-between items-center mb-6 flex-wrap gap-4">

                <div>
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
                    Modules / Subtopics
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={addModule}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 14,
                    background: '#6366f1',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    boxShadow:
                      '0 12px 24px rgba(99,102,241,0.28)',
                  }}
                >
                  + Add Module
                </button>
              </div>

              {course.subtopics.map((mod, idx) => (
  <div
    key={idx}
    className="border border-white/30 rounded-3xl p-6 bg-white/40 mb-6"
  >
    <div className="flex justify-between items-center mb-5">
      <h3 className="text-xl font-bold text-slate-800">
        Module {idx + 1}
      </h3>

      <button
        type="button"
        onClick={() => removeModule(idx)}
        className="text-red-500 font-semibold"
      >
        Remove
      </button>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <input
        type="text"
        placeholder="Module Title"
        value={mod.title}
        onChange={(e) =>
          updateModule(idx, 'title', e.target.value)
        }
        className="border rounded-xl px-4 py-3 bg-white/70"
      />

      <input
        type="number"
        placeholder="Est. time (min)"
        value={mod.estimatedTime}
        onChange={(e) =>
          updateModule(
            idx,
            'estimatedTime',
            parseInt(e.target.value)
          )
        }
        className="border rounded-xl px-4 py-3 bg-white/70"
      />
    </div>

    <textarea
      placeholder="Module content"
      value={mod.content}
      onChange={(e) =>
        updateModule(idx, 'content', e.target.value)
      }
      rows="5"
      className="w-full border rounded-2xl px-4 py-3 bg-white/70 mb-4"
    />

    {/* Video */}
    <div className="mb-5">
      <label className="block text-sm font-semibold mb-2">
        Video
      </label>

      <input
        type="file"
        accept="video/*"
        onChange={(e) => {
          if (e.target.files[0]) {
            uploadModuleVideo(idx, e.target.files[0]);
          }
        }}
      />

      {mod.videoUrl && (
        <div className="mt-3">
          <video
            src={mod.videoUrl}
            controls
            className="h-32 rounded-xl"
          />

          <button
            type="button"
            onClick={() => removeModuleVideo(idx)}
            className="text-red-500 text-sm mt-2"
          >
            Remove Video
          </button>
        </div>
      )}
    </div>

    {/* Images */}
    <div className="mb-5">
      <label className="block text-sm font-semibold mb-2">
        Images
      </label>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (e.target.files.length) {
            uploadModuleImages(
              idx,
              Array.from(e.target.files)
            );
          }
        }}
      />

      <div className="flex flex-wrap gap-3 mt-3">
        {mod.imageUrls?.map((img, imgIdx) => (
          <div key={imgIdx} className="relative">
            <img
              src={img}
              alt=""
              className="h-20 rounded-xl border"
            />

            <button
              type="button"
              onClick={() =>
                removeModuleImage(idx, img)
              }
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>

    {/* PDFs */}
    <div>
      <label className="block text-sm font-semibold mb-2">
        PDFs
      </label>

      <input
        type="file"
        accept="application/pdf"
        multiple
        onChange={(e) => {
          if (e.target.files.length) {
            uploadModulePdfs(
              idx,
              Array.from(e.target.files)
            );
          }
        }}
      />

      <div className="space-y-2 mt-3">
        {mod.pdfUrls?.map((pdf, pdfIdx) => (
          <div
            key={pdfIdx}
            className="flex items-center gap-3"
          >
            <a
              href={pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              PDF {pdfIdx + 1}
            </a>

            <button
              type="button"
              onClick={() =>
                removeModulePdf(idx, pdf)
              }
              className="text-red-500 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
))}

{course.subtopics.length === 0 && (
  <p className="text-gray-400 text-center py-4">
    No modules yet.
  </p>
)}
            </div>

            {/* Quiz */}
            <div
              style={{
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 28,
                padding: 32,
                boxShadow:
                  '0 18px 40px rgba(0,0,0,0.05)',
              }}
            >
              <div className="flex justify-between items-center mb-6 flex-wrap gap-4">

                <div>
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
                    Assessment
                  </p>

                  <h2
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: '#0f172a',
                    }}
                  >
                    Quiz Questions
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={addQuestion}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 14,
                    background: '#6366f1',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    boxShadow:
                      '0 12px 24px rgba(99,102,241,0.28)',
                  }}
                >
                  + Add Question
                </button>
              </div>

              {questions.map((q, qIdx) => (
  <div
    key={qIdx}
    className="border border-white/30 rounded-3xl p-6 bg-white/40 mb-6"
  >
    <div className="flex justify-between items-center mb-4">
      <span className="font-bold text-lg">
        Question {qIdx + 1}
      </span>

      <button
        type="button"
        onClick={() => removeQuestion(qIdx)}
        className="text-red-500 font-semibold"
      >
        Remove
      </button>
    </div>

    <textarea
      placeholder="Question text"
      value={q.text}
      onChange={(e) =>
        updateQuestion(
          qIdx,
          'text',
          e.target.value
        )
      }
      rows="3"
      className="w-full border rounded-2xl px-4 py-3 bg-white/70 mb-4"
    />

    <div className="mb-4">
      <label className="font-semibold text-sm">
        Options
      </label>

      {q.options.map((opt, optIdx) => (
        <div
          key={opt.letter}
          className="flex items-center gap-3 mt-3"
        >
          <span className="font-bold w-6">
            {opt.letter}.
          </span>

          <input
            type="text"
            value={opt.text}
            onChange={(e) =>
              updateOption(
                qIdx,
                optIdx,
                'text',
                e.target.value
              )
            }
            className="flex-1 border rounded-xl px-4 py-3 bg-white/70"
          />

          {optIdx > 1 && (
            <button
              type="button"
              onClick={() =>
                removeOption(qIdx, optIdx)
              }
              className="text-red-500"
            >
              ✕
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => addOption(qIdx)}
        className="mt-3 text-indigo-600 text-sm font-semibold"
      >
        + Add Option
      </button>
    </div>

    <div className="mb-4">
      <label className="font-semibold text-sm">
        Correct Answer(s)
      </label>

      <select
        multiple
        value={q.correctAnswers}
        onChange={(e) =>
          updateQuestion(
            qIdx,
            'correctAnswers',
            Array.from(
              e.target.selectedOptions,
              (o) => o.value
            )
          )
        }
        className="w-full border rounded-2xl px-4 py-3 bg-white/70 mt-2"
        size={Math.min(4, q.options.length)}
      >
        {q.options.map((opt) => (
          <option
            key={opt.letter}
            value={opt.text}
          >
            {opt.letter}. {opt.text}
          </option>
        ))}
      </select>
    </div>

    <textarea
      placeholder="Explanation (optional)"
      value={q.explanation}
      onChange={(e) =>
        updateQuestion(
          qIdx,
          'explanation',
          e.target.value
        )
      }
      rows="3"
      className="w-full border rounded-2xl px-4 py-3 bg-white/70"
    />
  </div>
))}

{questions.length === 0 && (
  <p className="text-gray-400 text-center py-4">
    No questions yet.
  </p>
)}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">

              <button
                type="button"
                onClick={() => navigate('/author')}
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
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  </div>
);
};

export default EditCourse;