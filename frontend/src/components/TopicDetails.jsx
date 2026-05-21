import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';

/* ─── tiny shared style tokens ─── */
const PRIMARY = '#196bc5';
const PRIMARY_LIGHT = 'rgba(25,107,197,0.08)';
const GREEN = '#10b981';
const PINK = '#ec4899';

const TopicDetails = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topic, setTopic] = useState(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const startTimeRef = useRef(Date.now());
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizMetadata, setQuizMetadata] = useState(null);
  const [timeSpentPerModule, setTimeSpentPerModule] = useState([]);
  const [videoProgress, setVideoProgress] = useState([]);
  const videoRef = useRef(null);
  const [videoPlayedSeconds, setVideoPlayedSeconds] = useState([]);
  const lastTimeUpdateRef = useRef(null);
  const playbackIntervalRef = useRef(null);
  const [videoDurations, setVideoDurations] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  /* ─── All original logic — completely untouched ─── */

  const fetchQuizMetadata = async () => {
    try {
      const response = await api.get(`/quiz/${topicId}`);
      const questions = response.data.questions;
      const passingRatio = response.data.passingRatio;
      const total = questions.length;
      const required = Math.ceil(total * (passingRatio / 100));
      return { totalQuestions: total, passingScore: required };
    } catch (error) {
      console.error('Failed to fetch quiz metadata', error);
      const message = error.response?.data?.message || 'Failed to load quiz information';
      toast.error(message);
      return null;
    }
  };

  const fetchTopicDetails = async () => {
    try {
      const response = await api.get(`/topics/${topicId}`);
      setTopic(response.data);
    } catch (error) {
      toast.error('Failed to load topic details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadModuleProgress = async () => {
    setIsLoadingProgress(true);
    try {
      const res = await api.get(`/topics/${topicId}/progress`);
      setCurrentModuleIndex(res.data.lastModuleIndex || 0);
      setCompletedModules(res.data.completedModules || []);
      setTimeSpentPerModule(res.data.timeSpent || []);
      setVideoProgress(res.data.videoWatchedPercent || []);
      setVideoPlayedSeconds(res.data.videoPlayedSeconds || []);
    } catch (err) {
      console.error('Failed to load module progress', err);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const saveModuleProgress = async (completed, currentIdx) => {
    if (isLoadingProgress) return;
    if (!topic || !topic.contentAvailable) return;
    try {
      await api.post(`/topics/${topicId}/progress`, {
        completedModules: completed,
        currentModuleIndex: currentIdx
      });
    } catch (err) {
      console.error('Failed to save module progress', err);
    }
  };

  const sendTimeSpent = async (moduleIndex, seconds) => {
    if (!topic || !topic.contentAvailable) return;
    if (seconds <= 0) return;
    try {
      await api.post(`/topics/${topicId}/time-spent`, { moduleIndex, seconds });
      setTimeSpentPerModule(prev => {
        const newArr = [...prev];
        while (newArr.length <= moduleIndex) newArr.push(0);
        newArr[moduleIndex] = (newArr[moduleIndex] || 0) + seconds;
        return newArr;
      });
    } catch (err) {
      console.error('Failed to record time:', err);
    }
  };

  const lastReportedPercentRef = useRef({});

  const sendVideoProgress = async (moduleIndex, percent) => {
    const last = lastReportedPercentRef.current[moduleIndex] || 0;
    if (percent <= last) return;
    lastReportedPercentRef.current[moduleIndex] = percent;
    try {
      await api.post(`/topics/${topicId}/video-progress`, { moduleIndex, percent });
      setVideoProgress(prev => {
        const newArr = [...prev];
        while (newArr.length <= moduleIndex) newArr.push(0);
        newArr[moduleIndex] = Math.max(newArr[moduleIndex] || 0, percent);
        return newArr;
      });
    } catch (err) {
      console.error('Failed to report video progress', err);
    }
  };

  const hasEnoughTimeOnModule = (moduleIndex) => {
    if (topic?.progress?.completed) return true;
    if (completedModules.includes(moduleIndex)) return true;
    const module = topic?.subtopics?.[moduleIndex];
    const hasVideo = module?.videoUrl;
    const cumulativePlay = videoPlayedSeconds[moduleIndex] || 0;
    const videoDuration = videoRef.current?.duration || 0;
    if (hasVideo && videoDuration > 0) {
      const requiredSec = videoDuration * 0.7;
      if (cumulativePlay >= requiredSec) return true;
      return false;
    }
    const stored = timeSpentPerModule[moduleIndex] || 0;
    let additional = 0;
    if (moduleIndex === currentModuleIndex) {
      additional = Math.floor((Date.now() - startTimeRef.current) / 1000);
    }
    const totalTime = stored + additional;
    return totalTime >= 180;
  };

  const sendVideoPlaySeconds = async (moduleIndex, additionalSeconds) => {
    if (!topic || !topic.contentAvailable) return;
    if (additionalSeconds <= 0) return;
    try {
      await api.post(`/topics/${topicId}/video-play-time`, { moduleIndex, seconds: additionalSeconds });
      setVideoPlayedSeconds(prev => {
        const newArr = [...prev];
        while (newArr.length <= moduleIndex) newArr.push(0);
        newArr[moduleIndex] = (newArr[moduleIndex] || 0) + additionalSeconds;
        return newArr;
      });
    } catch (err) {
      console.error('Failed to record video play time:', err);
    }
  };

  useEffect(() => {
    if (!topic || !topic.contentAvailable) return;
    return () => {
      if (!completedModules.includes(currentModuleIndex)) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (elapsed > 0) sendTimeSpent(currentModuleIndex, elapsed);
      }
    };
  }, [currentModuleIndex, topic, topicId, completedModules]);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [currentModuleIndex]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (elapsed > 0 && topic && topic.contentAvailable) {
        fetch(`/api/topics/${topicId}/time-spent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify({ moduleIndex: currentModuleIndex, seconds: elapsed }),
          keepalive: true
        }).catch(err => console.error('Failed to send time on unload', err));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [topicId, currentModuleIndex, topic]);

  useEffect(() => {
    const video = videoRef.current;
    const module = topic?.subtopics?.[currentModuleIndex];
    if (!video || !module?.videoUrl) return;
    let lastTimestamp = null;
    const handleTimeUpdate = () => {
      if (video.paused || video.seeking) { lastTimestamp = null; return; }
      const now = Date.now();
      if (lastTimestamp !== null) {
        const delta = (now - lastTimestamp) / 1000;
        if (delta > 0 && delta < 10) sendVideoPlaySeconds(currentModuleIndex, delta);
      }
      lastTimestamp = now;
      lastTimeUpdateRef.current = now;
    };
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      if (lastTimestamp) {
        const finalDelta = (Date.now() - lastTimestamp) / 1000;
        if (finalDelta > 0) sendVideoPlaySeconds(currentModuleIndex, finalDelta);
      }
    };
  }, [currentModuleIndex, topic]);

  useEffect(() => {
    const video = videoRef.current;
    const module = topic?.subtopics?.[currentModuleIndex];
    if (!video || !module?.videoUrl) return;
    const handleTimeUpdate = () => {
      const percent = (video.currentTime / video.duration) * 100;
      if (isFinite(percent) && percent > 0) sendVideoProgress(currentModuleIndex, Math.min(percent, 100));
    };
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [currentModuleIndex, topic]);

  useEffect(() => {
    const video = videoRef.current;
    const module = topic?.subtopics?.[currentModuleIndex];
    if (!video || !module?.videoUrl) return;
    const handleLoadedMetadata = () => {
      const duration = video.duration;
      if (duration && isFinite(duration)) {
        setVideoDurations(prev => {
          const newArr = [...prev];
          while (newArr.length <= currentModuleIndex) newArr.push(0);
          newArr[currentModuleIndex] = duration;
          return newArr;
        });
      }
    };
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [currentModuleIndex, topic]);

  useEffect(() => { fetchTopicDetails(); }, [topicId]);

  useEffect(() => {
    if (topic && topic.contentAvailable) {
      loadModuleProgress();
      fetchQuizMetadata().then(meta => { if (meta) setQuizMetadata(meta); });
    }
  }, [topic]);

  useEffect(() => {
    if (!isLoadingProgress && topic && topic.contentAvailable && !topic.progress?.completed) {
      saveModuleProgress(completedModules, currentModuleIndex);
    }
  }, [completedModules, currentModuleIndex, topic]);

  const goToNextModule = async () => {
    const video = videoRef.current;
    if (video && !video.paused) {
      const now = Date.now();
      if (lastTimeUpdateRef.current) {
        const delta = (now - lastTimeUpdateRef.current) / 1000;
        if (delta > 0) await sendVideoPlaySeconds(currentModuleIndex, delta);
      }
    }
    const module = topic?.subtopics?.[currentModuleIndex];
    const storedTime = timeSpentPerModule[currentModuleIndex] || 0;
    const additionalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const totalTime = storedTime + additionalTime;
    if (!hasEnoughTimeOnModule(currentModuleIndex)) {
      if (module?.videoUrl) {
        const videoDur = videoRef.current?.duration || 0;
        const requiredSec = videoDur * 0.7;
        const currentCumulative = videoPlayedSeconds[currentModuleIndex] || 0;
        toast.error(`Please watch at least 70% of the video (${Math.round(requiredSec)} seconds cumulative playback). You have watched ${Math.round(currentCumulative)} seconds so far.`);
      } else {
        toast.error(`Please spend at least 3 minutes (180 seconds) on this module. You have spent ${totalTime} seconds.`);
      }
      return;
    }
    if (!topic?.subtopics) return;
    let newCompleted = [...completedModules];
    if (!newCompleted.includes(currentModuleIndex)) {
      newCompleted.push(currentModuleIndex);
      setCompletedModules(newCompleted);
      await saveModuleProgress(newCompleted, currentModuleIndex);
    }
    if (currentModuleIndex < topic.subtopics.length - 1) setCurrentModuleIndex(currentModuleIndex + 1);
  };

  const goToPreviousModule = () => {
    if (currentModuleIndex > 0) setCurrentModuleIndex(currentModuleIndex - 1);
  };

  const handleStartQuiz = async () => {
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    if (elapsed > 0) {
      await sendTimeSpent(currentModuleIndex, elapsed);
      startTimeRef.current = Date.now();
    }
    if (topic.progress?.completed) { toast('You have already completed this topic!', { icon: '🏆' }); return; }
    const totalModules = topic.subtopics.length;
    let updatedCompleted = [...completedModules];
    const lastModuleIndex = totalModules - 1;
    if (!updatedCompleted.includes(lastModuleIndex) && currentModuleIndex === lastModuleIndex) {
      updatedCompleted.push(lastModuleIndex);
      setCompletedModules(updatedCompleted);
      saveModuleProgress(updatedCompleted, currentModuleIndex);
    }
    if (updatedCompleted.length !== totalModules) {
      toast.error(`Please complete all modules first. (${updatedCompleted.length}/${totalModules} completed)`);
      return;
    }
    const metadata = await fetchQuizMetadata();
    if (!metadata) { toast.error('Unable to load quiz information. Please try again.'); return; }
    setQuizMetadata(metadata);
    setShowInstructions(true);
  };

  const handleStartQuizFromInstructions = () => { setShowInstructions(false); setShowQuiz(true); };
  const handleQuizComplete = () => { setShowQuiz(false); fetchTopicDetails(); };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!topic) return null;

  /* ─── Coming soon state ─── */
  if (!topic.contentAvailable) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              marginBottom: 24, color: PRIMARY, fontWeight: 600, fontSize: 14,
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px',
              borderRadius: 8, transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = PRIMARY_LIGHT}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <div style={{
            background: '#fff', borderRadius: 20, padding: '64px 32px',
            textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
            border: '1.5px solid rgba(0,0,0,0.07)',
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📚</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{topic.title}</h1>
            <p style={{ color: '#94a3b8', fontSize: 15 }}>{topic.placeholderContent || 'Content coming soon!'}</p>
          </div>
        </div>
      </div>
    );
  }

  const subtopics = topic.subtopics;
  const currentModule = currentModuleIndex < subtopics.length ? subtopics[currentModuleIndex] : null;
  const isLastModule = currentModuleIndex === subtopics.length - 1;
  const allModulesCompleted = completedModules.length === subtopics.length;
  const topicCompleted = topic.progress?.completed;
  const progressPct = Math.round((completedModules.length / subtopics.length) * 100);

  return (
    <div className="min-h-screen">
      <style>{`
        .module-content h1, .module-content h2, .module-content h3,
        .module-content h4, .module-content h5, .module-content h6 {
          color: #196bc5 !important;
        }
        .module-content p, .module-content li, .module-content td, .module-content th {
          color: #374151 !important;
          text-align: justify !important;
        }
        .module-content a { color: #196bc5 !important; }
        .module-content ul, .module-content ol { margin-left: 1.5rem !important; }
        .sidebar-module-item:hover { background: #f8faff; }
        .sidebar-module-item.active { background: rgba(25,107,197,0.07); border-left: 3px solid #196bc5; }
      `}</style>

      <div className="py-6">

        {/* ── Back button + topic header ── */}
        <div style={{ padding: '0 16px 20px', maxWidth: 1400, margin: '0 auto' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: PRIMARY, fontWeight: 600, fontSize: 14,
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px',
              borderRadius: 8, transition: 'background 0.2s', marginBottom: 16,
            }}
            onMouseEnter={e => e.currentTarget.style.background = PRIMARY_LIGHT}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 items-stretch" style={{ padding: '0 16px', maxWidth: 1400, margin: '0 auto' }}>

          {/* ══ LEFT SIDEBAR ══ */}
          <div className="lg:w-72 flex-shrink-0 h-[90vh]">
            <div style={{
              background: '#fff', borderRadius: 18,
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              border: '1.5px solid rgba(0,0,0,0.07)',
              display: 'flex', flexDirection: 'column', height: '100%',
              overflow: 'hidden', position: 'sticky', top: 24,
            }}>

              {/* Sidebar header */}
              <div style={{
                background: `linear-gradient(135deg, ${PRIMARY} 0%, #1e88e5 100%)`,
                padding: '20px 20px 16px', flexShrink: 0,
              }}>
                <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 15, margin: '0 0 4px', lineHeight: 1.3 }}>
                  {topic.title}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: '0 0 14px', fontWeight: 500 }}>
                  Course Modules
                </p>
                {/* Overall progress bar */}
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 100, height: 5, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 100,
                    background: '#fff',
                    width: `${progressPct}%`,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                    {completedModules.length}/{subtopics.length} completed
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>{progressPct}%</span>
                </div>
              </div>

              {/* Module list */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {subtopics.map((mod, idx) => {
                  const isCompleted = completedModules.includes(idx);
                  const isActive = currentModuleIndex === idx;
                  return (
                    <div
                      key={mod.id}
                      className={`sidebar-module-item${isActive ? ' active' : ''}`}
                      onClick={() => {
                        if (idx === currentModuleIndex) return;
                        if (!hasEnoughTimeOnModule(currentModuleIndex)) {
                          toast.error('Please spend at least 3 minutes on the current module before switching.');
                          return;
                        }
                        setCurrentModuleIndex(idx);
                      }}
                      style={{
                        padding: '14px 18px', cursor: 'pointer',
                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                        borderLeft: isActive ? `3px solid ${PRIMARY}` : '3px solid transparent',
                        background: isActive ? `rgba(25,107,197,0.06)` : 'transparent',
                        transition: 'all 0.18s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            {/* Step number or check */}
                            <div style={{
                              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                              background: isCompleted ? GREEN : isActive ? PRIMARY : 'rgba(0,0,0,0.1)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'background 0.2s',
                            }}>
                              {isCompleted ? (
                                <svg width="11" height="11" fill="white" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <span style={{ fontSize: 10, fontWeight: 700, color: isActive ? '#fff' : '#94a3b8' }}>{idx + 1}</span>
                              )}
                            </div>
                            <p style={{
                              fontSize: 13, fontWeight: isActive ? 700 : 500,
                              color: isActive ? PRIMARY : '#374151',
                              margin: 0, lineHeight: 1.3,
                            }}>
                              {mod.title}
                            </p>
                          </div>

                          <div style={{ paddingLeft: 30, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {mod.estimatedTime} min
                            </span>
                            {mod.videoUrl && (
                              <span style={{
                                fontSize: 11, color: PRIMARY, fontWeight: 600,
                                background: PRIMARY_LIGHT, padding: '1px 6px', borderRadius: 100,
                              }}>
                                🎥 {videoDurations[idx] ? Math.round(((videoPlayedSeconds[idx] || 0) / videoDurations[idx]) * 100) : 0}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Final Assessment item */}
                <div
                  onClick={handleStartQuiz}
                  style={{
                    padding: '14px 18px', cursor: 'pointer',
                    borderTop: '2px solid rgba(236,72,153,0.15)',
                    background: 'rgba(236,72,153,0.04)',
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.18s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(236,72,153,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(236,72,153,0.04)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: topicCompleted ? GREEN : 'rgba(236,72,153,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          {topicCompleted
                            ? <svg width="11" height="11" fill="white" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            : <span style={{ fontSize: 10 }}>🎯</span>
                          }
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: PINK, margin: 0 }}>
                          Final Assessment
                        </p>
                      </div>
                      <div style={{ paddingLeft: 30, fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {quizMetadata ? `${quizMetadata.totalQuestions} questions · 30 sec each` : 'Loading...'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══ RIGHT CONTENT AREA ══ */}
          <div className="flex-1 min-w-0 pr-2 h-[90vh]">
            <div style={{
              background: '#fff', borderRadius: 18,
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              border: '1.5px solid rgba(0,0,0,0.07)',
              display: 'flex', flexDirection: 'column', height: '100%',
              overflow: 'hidden',
            }}>

              {/* Content header bar */}
              {currentModule && (
                <div style={{
                  padding: '16px 28px', borderBottom: '1px solid rgba(0,0,0,0.07)',
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#fafcff',
                }}>
                  <div>
                    <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px' }}>
                      Module {currentModuleIndex + 1} of {subtopics.length}
                    </p>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
                      {currentModule.title}
                    </h3>
                  </div>
                  {completedModules.includes(currentModuleIndex) && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px',
                      borderRadius: 100, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                      fontSize: 12, fontWeight: 700, color: GREEN,
                    }}>
                      <svg width="11" height="11" fill={GREEN} viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Completed
                    </span>
                  )}
                </div>
              )}

              {/* Scrollable content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
                {currentModule ? (
                  <div className="module-content" style={{ maxWidth: 800, margin: '0 auto' }}>

                    {/* Video */}
                    {currentModule.videoUrl && (
                      <div style={{ marginBottom: 28, borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
                        <video ref={videoRef} controls style={{ width: '100%', display: 'block', background: '#000' }}>
                          <source src={`${window.location.origin}${currentModule.videoUrl}`} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}

                    {/* Images */}
                    {currentModule.imageUrls && currentModule.imageUrls.length > 0 && (
                      <div style={{ marginBottom: 24 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                          Images
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                          {currentModule.imageUrls.map((imgUrl, idx) => (
                            <img
                              key={idx}
                              src={imgUrl}
                              alt={`module-img-${idx}`}
                              onClick={() => setSelectedImage(imgUrl)}
                              style={{
                                maxHeight: 180, borderRadius: 10,
                                objectFit: 'cover', cursor: 'pointer',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                border: '1.5px solid rgba(0,0,0,0.07)',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.16)'; }}
                              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.10)'; }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PDFs */}
                    {currentModule.pdfUrls && currentModule.pdfUrls.length > 0 && (
                      <div style={{ marginBottom: 24 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                          Documents
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {currentModule.pdfUrls.map((pdfUrl, idx) => (
                            <a
                              key={idx}
                              href={pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 10,
                                padding: '10px 16px', borderRadius: 10,
                                background: 'rgba(25,107,197,0.06)',
                                border: '1.5px solid rgba(25,107,197,0.15)',
                                color: PRIMARY, fontSize: 13, fontWeight: 600,
                                textDecoration: 'none', transition: 'all 0.18s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = PRIMARY_LIGHT; e.currentTarget.style.borderColor = 'rgba(25,107,197,0.3)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(25,107,197,0.06)'; e.currentTarget.style.borderColor = 'rgba(25,107,197,0.15)'; }}
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              Document {idx + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div dangerouslySetInnerHTML={{ __html: currentModule.content }} />
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '80px 24px', color: '#94a3b8' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>👈</div>
                    <p style={{ fontSize: 15, fontWeight: 500 }}>Select a module to begin learning</p>
                  </div>
                )}
              </div>

              {/* ── Fixed footer nav ── */}
              <div style={{
                padding: '16px 28px', borderTop: '1px solid rgba(0,0,0,0.07)',
                flexShrink: 0, background: '#fafcff',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                  {/* Previous */}
                  <button
                    onClick={goToPreviousModule}
                    disabled={currentModuleIndex === 0}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                      border: '1.5px solid',
                      cursor: currentModuleIndex === 0 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.18s',
                      background: currentModuleIndex === 0 ? '#f1f5f9' : '#fff',
                      borderColor: currentModuleIndex === 0 ? '#e2e8f0' : '#d1d5db',
                      color: currentModuleIndex === 0 ? '#cbd5e1' : '#374151',
                    }}
                  >
                    ← Previous
                  </button>

                  {/* Centre status */}
                  {topicCompleted && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '8px 16px', borderRadius: 10,
                      background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                      color: GREEN, fontSize: 13, fontWeight: 700,
                    }}>
                      <svg width="16" height="16" fill={GREEN} viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Topic Completed!
                    </div>
                  )}

                  {/* Next */}
                  {!topicCompleted && !isLastModule && (
                    <button
                      onClick={goToNextModule}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '9px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                        background: PRIMARY, color: '#fff', border: 'none', cursor: 'pointer',
                        boxShadow: '0 2px 12px rgba(25,107,197,0.3)',
                        transition: 'all 0.18s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#1565c0'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(25,107,197,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = PRIMARY; e.currentTarget.style.boxShadow = '0 2px 12px rgba(25,107,197,0.3)'; }}
                    >
                      Next →
                    </button>
                  )}

                  {/* Take quiz button */}
                  {isLastModule && !topicCompleted && (
                    <button
                      onClick={handleStartQuiz}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '9px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                        background: GREEN, color: '#fff', border: 'none', cursor: 'pointer',
                        boxShadow: '0 2px 12px rgba(16,185,129,0.3)',
                        transition: 'all 0.18s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#059669'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = GREEN; }}
                    >
                      🎯 Take Final Quiz
                    </button>
                  )}
                </div>

                {/* Progress text */}
                <div style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                  Module {currentModuleIndex + 1} of {subtopics.length}&nbsp;&nbsp;·&nbsp;&nbsp;
                  {completedModules.length}/{subtopics.length} modules completed
                  &nbsp;&nbsp;·&nbsp;&nbsp;
                  <span style={{ color: PRIMARY, fontWeight: 700 }}>{progressPct}% done</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Instructions Modal ── */}
      {showInstructions && quizMetadata && (
        <InstructionsModal
          topicTitle={topic.title}
          totalQuestions={quizMetadata.totalQuestions}
          passingScore={quizMetadata.passingScore}
          onStart={handleStartQuizFromInstructions}
          onCancel={() => setShowInstructions(false)}
        />
      )}

      {/* ── Quiz Modal ── */}
      {showQuiz && (
        <QuizModal
          topicId={topicId}
          topicTitle={topic.title}
          onClose={() => setShowQuiz(false)}
          onComplete={handleQuizComplete}
          navigate={navigate}
        />
      )}

      {/* ── Image lightbox ── */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
            zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Zoomed view"
              style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
            />
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute', top: -12, right: -12,
                width: 32, height: 32, borderRadius: '50%',
                background: '#fff', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 700, color: '#374151',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══ Instructions Modal — UI enhanced, logic untouched ══ */
const InstructionsModal = ({ topicTitle, totalQuestions, passingScore, onStart, onCancel }) => {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16, backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        borderRadius: 20, maxWidth: 520, width: '100%', overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
        backgroundImage: "url('/quiz-bg.png')",
        backgroundSize: 'cover', backgroundPosition: 'center',
        position: 'relative',
      }}>
        <div style={{ position: 'relative', zIndex: 10, padding: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px',
            borderRadius: 100, background: 'rgba(25,107,197,0.12)', border: '1px solid rgba(25,107,197,0.2)',
            fontSize: 11, fontWeight: 700, color: PRIMARY, letterSpacing: '0.06em',
            textTransform: 'uppercase', marginBottom: 16,
          }}>
            📋 Quiz Instructions
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 20, letterSpacing: '-0.01em' }}>
            Ready to test your knowledge?
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Course', value: topicTitle },
              { label: 'Total Questions', value: totalQuestions },
              { label: 'Time per Question', value: '30 seconds' },
              { label: 'Passing Score', value: `${passingScore}/${totalQuestions} (${Math.round((passingScore / totalQuestions) * 100)}%)` },
              { label: 'Attempt Limit', value: 'Wait 2 hours after a failed attempt' },
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.07)',
                gap: 12,
              }}>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{row.label}</span>
                <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 700, textAlign: 'right' }}>{row.value}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 24, lineHeight: 1.6 }}>
            Once you start, the timer begins. Do not refresh the page during the quiz.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              onClick={onCancel}
              style={{
                padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: '#f1f5f9', border: '1.5px solid #e2e8f0', color: '#64748b', cursor: 'pointer',
                transition: 'all 0.18s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
              onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
            >
              Cancel
            </button>
            <button
              onClick={onStart}
              style={{
                padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: PRIMARY, color: '#fff', border: 'none', cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(25,107,197,0.35)',
                transition: 'all 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1565c0'; }}
              onMouseLeave={e => { e.currentTarget.style.background = PRIMARY; }}
            >
              Start Quiz →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══ Quiz Modal — UI enhanced, logic completely untouched ══ */
const QuizModal = ({ topicId, topicTitle, onClose, onComplete, navigate }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchQuestions(); }, []);

  useEffect(() => {
    if (!loading && !quizCompleted && questions.length > 0 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !quizCompleted && questions.length > 0) {
      handleTimeout();
    }
  }, [timeLeft, loading, quizCompleted]);

  const fetchQuestions = async () => {
    try {
      const response = await api.get(`/quiz/${topicId}`);
      setQuestions(response.data.questions);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load quiz');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleTimeout = () => {
    toast.error("Time's up! Moving to next question.");
    if (currentIndex < questions.length - 1) { setCurrentIndex(currentIndex + 1); setTimeLeft(30); }
    else submitQuiz();
  };

  const handleAnswerChange = (questionId, optionText) => {
    const currentAnswers = answers[questionId] || [];
    const question = questions.find(q => q.id === questionId);
    let newAnswers;
    if (question.correctAnswers.length > 1) {
      newAnswers = currentAnswers.includes(optionText)
        ? currentAnswers.filter(t => t !== optionText)
        : [...currentAnswers, optionText];
    } else {
      newAnswers = [optionText];
    }
    setAnswers({ ...answers, [questionId]: newAnswers });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) { setCurrentIndex(currentIndex + 1); setTimeLeft(30); }
    else submitQuiz();
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    try {
      const formattedAnswers = questions.map(q => ({
        questionId: q.id,
        selectedOptions: answers[q.id] || []
      }));
      const response = await api.post(`/quiz/${topicId}/submit`, { answers: formattedAnswers });
      const resultData = response.data;
      onClose();
      navigate(`/topic/${topicId}/result`, { state: { result: resultData, topicTitle } });
      if (resultData.passed) onComplete();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
        <div style={{ background: '#fff', borderRadius: 18, padding: 40, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (quizCompleted && result) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
        <div style={{ background: '#fff', borderRadius: 20, maxWidth: 640, width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}>
          <div style={{ padding: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, color: '#0f172a' }}>Quiz Results</h2>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 52, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{result.correctCount}/{result.totalQuestions}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: result.passed ? GREEN : '#ef4444', marginTop: 8 }}>{result.passed ? 'PASSED ✓' : 'FAILED ✗'}</div>
              <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 6 }}>{result.passed ? 'Great job! Topic completed.' : 'Need at least 7 correct to pass. Try again in 12 hours.'}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {result.results.map((res, idx) => (
                <div key={idx} style={{ border: `1.5px solid ${res.isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 12, padding: 16, background: res.isCorrect ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: '#374151', margin: 0, flex: 1 }}>Q{idx + 1}. {res.questionText}</p>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: res.isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)', color: res.isCorrect ? '#059669' : '#dc2626', whiteSpace: 'nowrap' }}>
                      {res.isCorrect ? 'Correct' : 'Wrong'}
                    </span>
                  </div>
                  {!res.isCorrect && (
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
                      <strong>Correct answer:</strong> {res.correctAnswers.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              style={{ marginTop: 24, width: '100%', padding: '12px 0', borderRadius: 12, background: PRIMARY, color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 12px rgba(25,107,197,0.3)' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isMultiSelect = currentQuestion?.correctAnswers.length > 1;
  const timerPct = (timeLeft / 30) * 100;
  const timerColor = timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#f59e0b' : PRIMARY;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: 20, maxWidth: 620, width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.25)', overflow: 'hidden' }}>

        {/* Quiz header */}
        <div style={{ padding: '20px 28px 16px', borderBottom: '1px solid rgba(0,0,0,0.07)', background: '#fafcff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px',
              borderRadius: 100, background: `${timerColor}12`, border: `1.5px solid ${timerColor}30`,
              fontSize: 14, fontWeight: 800, color: timerColor, transition: 'all 0.3s',
            }}>
              ⏱ {timeLeft}s
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ background: '#e2e8f0', borderRadius: 100, height: 5, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 100,
              background: `linear-gradient(90deg, ${PRIMARY}, #42a5f5)`,
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        <div style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 20, lineHeight: 1.45, letterSpacing: '-0.01em' }}>
            {currentQuestion?.text}
          </h3>

          {isMultiSelect && (
            <p style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              ✦ Select all that apply
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {currentQuestion?.options.map((option) => {
              const isSelected = (answers[currentQuestion.id] || []).includes(option.text);
              return (
                <label
                  key={option.letter}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                    border: `1.5px solid ${isSelected ? PRIMARY : 'rgba(0,0,0,0.09)'}`,
                    background: isSelected ? PRIMARY_LIGHT : '#fff',
                    transition: 'all 0.18s',
                  }}
                >
                  <input
                    type={isMultiSelect ? 'checkbox' : 'radio'}
                    checked={isSelected}
                    onChange={() => handleAnswerChange(currentQuestion.id, option.text)}
                    style={{ accentColor: PRIMARY, width: 15, height: 15, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 700, color: PRIMARY, marginRight: 6 }}>{option.letter}.</span>
                    {option.text}
                  </span>
                </label>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
            <button
              onClick={onClose}
              style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: '#f1f5f9', border: '1.5px solid #e2e8f0', color: '#64748b', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={handleNext}
              disabled={submitting}
              style={{
                padding: '9px 24px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: currentIndex === questions.length - 1 ? GREEN : PRIMARY,
                color: '#fff', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
                boxShadow: `0 2px 12px ${currentIndex === questions.length - 1 ? 'rgba(16,185,129,0.3)' : 'rgba(25,107,197,0.3)'}`,
                transition: 'all 0.18s',
              }}
            >
              {currentIndex === questions.length - 1 ? 'Submit Quiz' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicDetails;
