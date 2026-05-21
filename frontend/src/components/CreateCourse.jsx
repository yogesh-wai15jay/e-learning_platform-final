import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import Logo from './Logo';

const CreateCourse = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState({
    title: '',
    id: '',
    estimatedTime: 30,
    showOnDashboard: true,
    subtopics: [],
    placeholderContent: ''
  });
  const [modules, setModules] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [passingRatio, setPassingRatio] = useState(70);

  // Module functions
  const addModule = () => {
  setModules([...modules, {
    title: '',
    estimatedTime: 5,
    content: '',
    videoUrl: '',
    imageUrls: [],
    pdfUrls: []
  }]);
};
  const updateModule = (idx, field, value) => {
    const updated = [...modules];
    updated[idx][field] = value;
    setModules(updated);
  };
  const removeModule = (idx) => {
    setModules(modules.filter((_, i) => i !== idx));
  };

  // Upload video for a module
const uploadModuleVideo = async (idx, file) => {
  if (!file) return;
  const formData = new FormData();
  formData.append('video', file);
  try {
    const response = await api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const updated = [...modules];
    updated[idx].videoUrl = response.data.videoUrl;
    setModules(updated);
    toast.success('Video uploaded');
  } catch (error) {
    toast.error('Video upload failed');
  }
};

// Remove video from a module
const removeModuleVideo = (idx) => {
  const updated = [...modules];
  updated[idx].videoUrl = '';
  setModules(updated);
};

// Upload a single image
const uploadSingleImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.imageUrl;
};

// Upload multiple images for a module
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
    const updated = [...modules];
    updated[idx].imageUrls = [...(updated[idx].imageUrls || []), ...uploadedUrls];
    setModules(updated);
    toast.success(`${uploadedUrls.length} image(s) uploaded`);
  }
};

// Remove an image from a module
const removeModuleImage = (idx, imageUrl) => {
  const updated = [...modules];
  updated[idx].imageUrls = updated[idx].imageUrls.filter(url => url !== imageUrl);
  setModules(updated);
};

// Upload a single PDF
const uploadSinglePdf = async (file) => {
  const formData = new FormData();
  formData.append('pdf', file);
  const response = await api.post('/upload/pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.pdfUrl;
};

// Upload multiple PDFs for a module
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
    const updated = [...modules];
    updated[idx].pdfUrls = [...(updated[idx].pdfUrls || []), ...uploadedUrls];
    setModules(updated);
    toast.success(`${uploadedUrls.length} PDF(s) uploaded`);
  }
};

// Remove a PDF from a module
const removeModulePdf = (idx, pdfUrl) => {
  const updated = [...modules];
  updated[idx].pdfUrls = updated[idx].pdfUrls.filter(url => url !== pdfUrl);
  setModules(updated);
};

  // Question functions
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
  const removeQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };
  const addOption = (qIdx) => {
    const updated = [...questions];
    const newLetter = String.fromCharCode(65 + updated[qIdx].options.length); // A, B, C, ...
    updated[qIdx].options.push({ letter: newLetter, text: '' });
    setQuestions(updated);
  };
  const updateOption = (qIdx, optIdx, field, value) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx][field] = value;
    setQuestions(updated);
  };
  const removeOption = (qIdx, optIdx) => {
    const updated = [...questions];
    updated[qIdx].options = updated[qIdx].options.filter((_, i) => i !== optIdx);
    // Re‑letter remaining options
    updated[qIdx].options = updated[qIdx].options.map((opt, idx) => ({
      ...opt,
      letter: String.fromCharCode(65 + idx)
    }));
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
    if (!course.title.trim()) {
      toast.error('Course title is required');
      return;
    }
    if (!course.id.trim()) {
      toast.error('URL slug (id) is required');
      return;
    }
    if (modules.length === 0) {
      toast.error('Please add at least one module');
      return;
    }
    if (questions.length === 0) {
      toast.error('Please add at least one quiz question');
      return;
    }
    // Validate each module has title and content
    for (let i = 0; i < modules.length; i++) {
      if (!modules[i].title.trim()) {
        toast.error(`Module ${i+1} title is required`);
        return;
      }
      if (!modules[i].content.trim()) {
        toast.error(`Module ${i+1} content is required`);
        return;
      }
    }
    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) {
        toast.error(`Question ${i+1} text is required`);
        return;
      }
      if (questions[i].options.some(opt => !opt.text.trim())) {
        toast.error(`All options for question ${i+1} must have text`);
        return;
      }
      if (questions[i].correctAnswers.length === 0) {
        toast.error(`Please select at least one correct answer for question ${i+1}`);
        return;
      }
    }

    setLoading(true);
    try {
      // Create course
      const courseData = {
        title: course.title,
        id: course.id.toLowerCase().replace(/\s+/g, '-'),
        estimatedTime: course.estimatedTime,
        showOnDashboard: course.showOnDashboard,
        subtopics: modules,
        placeholderContent: course.placeholderContent,
        passingRatio: passingRatio   // <-- add this line
      };
      const courseRes = await api.post('/courses', courseData);
      const createdCourse = courseRes.data;

      // Save questions
      const questionsToSave = questions.map((q, idx) => ({
        courseId: createdCourse.id,
        text: q.text,
        options: q.options,
        correctAnswers: q.correctAnswers,
        explanation: q.explanation || ''
      }));
      await api.post(`/questions/${createdCourse.id}`, { questions: questionsToSave });
      toast.success('Course created successfully!');
      navigate('/author');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

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

        {/* Page Heading */}
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
            Create New Course
          </h1>

          <p
            style={{
              color: '#64748b',
              fontSize: 15,
              maxWidth: 700,
              lineHeight: 1.7,
            }}
          >
            Build interactive learning experiences with modules,
            videos, documents, and quiz assessments.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* Course Information */}
          <div
            style={{
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 28,
              padding: 32,
              boxShadow: '0 18px 40px rgba(0,0,0,0.05)',
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
                Basic Details
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

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                  className="w-full rounded-2xl border border-white/30 bg-white/70 backdrop-blur-md px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  URL Slug (id) *
                </label>

                <input
                  type="text"
                  value={course.id}
                  onChange={(e) =>
                    setCourse({
                      ...course,
                      id: e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, '-'),
                    })
                  }
                  required
                  className="w-full rounded-2xl border border-white/30 bg-white/70 backdrop-blur-md px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
                />

                <p className="text-xs text-gray-500 mt-2">
                  Example: my-course-name
                </p>
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                  className="w-full rounded-2xl border border-white/30 bg-white/70 backdrop-blur-md px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Passing Ratio */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Passing Ratio (%)
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={passingRatio}
                  onChange={(e) =>
                    setPassingRatio(
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-2xl border border-white/30 bg-white/70 backdrop-blur-md px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
                />

                <p className="text-xs text-gray-500 mt-2">
                  Example: 70 means 7/10 correct
                </p>
              </div>

              {/* Checkbox */}
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

                <label className="text-sm text-slate-700 font-medium">
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
              boxShadow: '0 18px 40px rgba(0,0,0,0.05)',
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

            {modules.map((mod, idx) => (
              <div
                key={idx}
                style={{
                  background:
                    'rgba(255,255,255,0.45)',
                  border:
                    '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 24,
                  padding: 24,
                  marginBottom: 24,
                }}
              >
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl font-bold text-slate-800">
                    Module {idx + 1}
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      removeModule(idx)
                    }
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
  placeholder="Module content (HTML allowed)"
  value={mod.content}
  onChange={(e) =>
    updateModule(idx, 'content', e.target.value)
  }
  rows="5"
  className="w-full border rounded-2xl px-4 py-3 bg-white/70 mb-4"
/>

{/* Video Upload */}
<div className="mb-5">
  <label className="block text-sm font-semibold text-slate-700 mb-2">
    Course Video (optional)
  </label>

  <input
    type="file"
    accept="video/mp4,video/webm,video/ogg"
    onChange={(e) => {
      if (e.target.files[0]) {
        uploadModuleVideo(idx, e.target.files[0]);
      }
    }}
    className="block w-full text-sm"
  />

  {mod.videoUrl && (
    <div className="mt-3">
      <video
        src={mod.videoUrl}
        controls
        className="h-32 rounded-xl"
      />
    </div>
  )}
</div>

{/* Images */}
<div className="mb-5">
  <label className="block text-sm font-semibold text-slate-700 mb-2">
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
    className="block w-full text-sm"
  />

  {mod.imageUrls?.length > 0 && (
    <div className="flex flex-wrap gap-3 mt-4">
      {mod.imageUrls.map((imgUrl, imgIdx) => (
        <div
          key={imgIdx}
          className="relative"
        >
          <img
            src={imgUrl}
            alt=""
            className="h-20 rounded-xl border"
          />

          <button
            type="button"
            onClick={() =>
              removeModuleImage(idx, imgUrl)
            }
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )}
</div>

{/* PDFs */}
<div>
  <label className="block text-sm font-semibold text-slate-700 mb-2">
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
    className="block w-full text-sm"
  />

  {mod.pdfUrls?.length > 0 && (
    <div className="space-y-2 mt-4">
      {mod.pdfUrls.map((pdfUrl, pdfIdx) => (
        <div
          key={pdfIdx}
          className="flex items-center gap-3"
        >
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            PDF {pdfIdx + 1}
          </a>

          <button
            type="button"
            onClick={() =>
              removeModulePdf(idx, pdfUrl)
            }
            className="text-red-500 text-sm"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )}
</div>

              </div>
            ))}

            {modules.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No modules added yet.
              </div>
            )}
          </div>

          {/* Quiz Questions */}
          <div
            style={{
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 28,
              padding: 32,
              boxShadow: '0 18px 40px rgba(0,0,0,0.05)',
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

          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">

            <button
              type="button"
              onClick={() => navigate('/author')}
              style={{
                padding: '14px 22px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#334155',
                fontWeight: 700,
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px 26px',
                borderRadius: 16,
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                boxShadow:
                  '0 12px 24px rgba(99,102,241,0.28)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? 'Creating...'
                : 'Create Course'}
            </button>
          </div>
        </form>
      </main>
    </div>
  </div>
);
};

export default CreateCourse;