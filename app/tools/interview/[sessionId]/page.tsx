'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mic, MicOff, Volume2, VolumeX, Send, CheckCircle, MessageCircle, User, Bot, Pause, Play } from 'lucide-react';
import Link from 'next/link';
import { InterviewPrepService, InterviewSession, ChatMessage } from '@/lib/services/interviewPrepService';
import { SpeechUtils } from '@/lib/utils/speechUtils';
import { theme } from '@/lib/theme';
import { supabase } from '@/lib/supabase';

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [autoMode, setAutoMode] = useState(true); // Auto TTS + STT mode

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  useEffect(() => {
    const chat = session?.chat || [];
    if (session && chat.length > 0) {
      scrollToBottom();
      // Auto-start TTS for the latest question if in auto mode
      const latestMessage = chat[chat.length - 1];
      if (latestMessage.type === 'question' && autoMode && !isWaitingForResponse) {
        playLatestQuestion();
      }
    }
  }, [session?.chat]);

  const loadSession = () => {
    try {
      const foundSession = InterviewPrepService.getSessionById(sessionId);
      if (foundSession) {
        // Ensure chat array exists (migration for old sessions)
        const sessionWithChat = {
          ...foundSession,
          chat: foundSession.chat || [],
        };
        setSession(sessionWithChat);
      } else {
        router.push('/tools/interview');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      router.push('/tools/interview');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const playLatestQuestion = async () => {
    if (!session) return;

    const chat = session.chat || [];
    const latestQuestion = chat.filter(msg => msg.type === 'question').pop();
    if (!latestQuestion) return;

    try {
      setIsPlaying(true);
      await SpeechUtils.speak(latestQuestion.content);
    } catch (error) {
      console.error('Error playing question:', error);
    } finally {
      setIsPlaying(false);
      // Auto-start recording after TTS finishes
      if (autoMode) {
        startRecording();
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) return;

    mediaRecorder.onstop = async () => {
      const mimeType = mediaRecorder.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

      // Stop all tracks to release mic
      mediaRecorder.stream.getTracks().forEach(t => t.stop());

      setIsRecording(false);
      await sendAudioMessage(audioBlob, mimeType);
    };

    mediaRecorder.stop();
  };

  const sendAudioMessage = async (audioBlob: Blob, mimeType: string) => {
    if (!session || isWaitingForResponse) return;

    setIsWaitingForResponse(true);

    // Convert blob to base64
    const base64Audio = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip the data URL prefix
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    // Get last question for context
    const chat = session.chat || [];
    const lastQuestion = chat.filter(msg => msg.type === 'question').pop();

    // Extract CV if available
    let cvText = '';
    if (session.cvUsed) {
      try {
        const cvDocs = localStorage.getItem('cv_documents');
        if (cvDocs) {
          const docs = JSON.parse(cvDocs);
          const latestCV = docs.find((doc: any) => doc.type === 'cv');
          if (latestCV) {
            cvText = InterviewPrepService.extractCVText(latestCV.content || latestCV.structured_data || '');
          }
        }
      } catch (e) {
        console.error('Error extracting CV:', e);
      }
    }

    // Build conversation history for next question prompt
    const recentMessages = chat
      .filter(msg => msg.type === 'question' || msg.type === 'answer')
      .slice(-6)
      .map(msg => `${msg.type === 'question' ? 'Interviewer' : 'Candidate'}: ${msg.content}`)
      .join('\n');

    const questionNumber = chat.filter(msg => msg.type === 'question').length;
    const jobDesc = session.jobDescription.substring(0, 1000);

    // Single combined prompt: transcribe audio + evaluate + get next question
    const combinedPrompt = `The attached audio is the candidate's spoken answer to an interview question. 

STEP 1 - TRANSCRIBE: First, transcribe the spoken audio exactly.

STEP 2 - EVALUATE: As an AI interview coach, evaluate the answer.

STEP 3 - NEXT QUESTION: As the interviewer, ask the next question (or return null if ${questionNumber} questions have been asked and the interview should end after 8-10 questions).

Job Details:
- Title: ${session.jobTitle || 'Not specified'}
- Company: ${session.jobCompany || 'Not specified'}
- Description: ${jobDesc}${session.jobDescription.length > 1000 ? '...' : ''}

${cvText ? `Candidate CV:\n${cvText}\n` : ''}

Current interview question (Question ${questionNumber} of ~10):
"${lastQuestion?.content || ''}"

Conversation so far:
${recentMessages}

${cvText ? '' : 'Note: No CV provided.'}

Respond with ONLY valid JSON in this exact structure:
{
  "transcript": "exact transcription of what the candidate said",
  "score": 85,
  "feedback": "Brief coaching feedback (50-70 words max) - what was good and what needs improvement",
  "nextQuestion": "The next interview question as the interviewer, or null if interview should end"
}

Rules:
- score: 0-100 (excellent 80-100, good 60-79, average 40-59, needs work 20-39, poor 0-19)
- feedback: 50-70 words max, concise and constructive
- nextQuestion: null only after 8-10 questions total
- Return ONLY valid JSON, no markdown, no code blocks`;

    try {
      // Step 1: Invoke edge function with audio
      const { data, error } = await supabase.functions.invoke('interview-prep', {
        body: {
          prompt: combinedPrompt,
          temperature: 0.7,
          maxTokens: 1024,
          audioData: base64Audio,
          mimeType,
        },
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Failed to process audio');

      // Step 2: Parse combined response
      const result = InterviewPrepService.parseAIResponse<{
        transcript: string;
        score: number;
        feedback: string;
        nextQuestion: string | null;
      }>(data.data);

      // Step 3: Add user answer message (with transcript as content)
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        type: 'answer',
        content: result.transcript,
        timestamp: Date.now(),
      };

      // Step 4: Add feedback message
      const feedbackMessage: ChatMessage = {
        id: `feedback_${Date.now()}`,
        type: 'feedback',
        content: result.feedback,
        timestamp: Date.now(),
        score: result.score,
      };

      // Step 5: Build updated session
      const updatedChat = [...chat, userMessage, feedbackMessage];

      if (result.nextQuestion) {
        updatedChat.push({
          id: `question_${Date.now()}`,
          type: 'question',
          content: result.nextQuestion,
          timestamp: Date.now(),
        });
      }

      const updatedSession = {
        ...session,
        chat: updatedChat,
        completed: !result.nextQuestion,
        currentPhase: result.nextQuestion ? 'questioning' : 'completed',
      } as InterviewSession;

      setSession(updatedSession);
      InterviewPrepService.saveSession(updatedSession);

    } catch (error: any) {
      console.error('Error processing audio:', error);

      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'feedback',
        content: 'Sorry, I encountered an error processing your audio. Please try again or type your answer.',
        timestamp: Date.now(),
      };

      setSession(prev => prev ? { ...prev, chat: [...(prev.chat || []), errorMessage] } : prev);
    } finally {
      setIsWaitingForResponse(false);
    }
  };

  const togglePlayback = async () => {
    if (isPlaying) {
      SpeechUtils.stopSpeaking();
      setIsPlaying(false);
    } else {
      await playLatestQuestion();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const sendMessage = async () => {
    if (!session || !userInput.trim() || isWaitingForResponse) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'answer',
      content: userInput.trim(),
      timestamp: Date.now(),
    };

    const updatedSession = {
      ...session,
      chat: [...(session.chat || []), userMessage],
    };

    setSession(updatedSession);
    setUserInput('');
    setIsWaitingForResponse(true);

    try {
      const response = await InterviewPrepService.processChatResponse(updatedSession, userMessage.content);

      // Add AI Coach feedback with score
      const feedbackMessage: ChatMessage = {
        id: `feedback_${Date.now()}`,
        type: 'feedback',
        content: response.coachFeedback.feedback,
        timestamp: Date.now(),
        score: response.coachFeedback.score,
      };

      updatedSession.chat.push(feedbackMessage);

      // Add next question if available
      if (response.nextQuestion) {
        const questionMessage: ChatMessage = {
          id: `question_${Date.now()}`,
          type: 'question',
          content: response.nextQuestion,
          timestamp: Date.now(),
        };
        updatedSession.chat.push(questionMessage);
      } else {
        // Interview completed
        updatedSession.completed = true;
        updatedSession.currentPhase = 'completed';
      }

      setSession(updatedSession);
      InterviewPrepService.saveSession(updatedSession);

    } catch (error: any) {
      console.error('Error processing response:', error);

      // Add error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'feedback',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };

      const errorSession = {
        ...updatedSession,
        chat: [...updatedSession.chat, errorMessage],
      };

      setSession(errorSession);
    } finally {
      setIsWaitingForResponse(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Session not found</p>
          <Link href="/tools/interview" className="text-blue-600 hover:underline">
            Return to interview history
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/tools/interview"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Interview Practice</h1>
                <p className="text-sm text-gray-600">
                  {session.jobTitle || 'Practice Session'} • {session.completed ? 'Completed' : 'In Progress'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAutoMode(!autoMode)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors ${
                  autoMode ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {autoMode ? 'Auto Mode' : 'Manual Mode'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface - Takes remaining space */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 pb-48">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
          {/* Chat Messages - Scrollable area */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {(session.chat || []).map((message) => (
              <div key={message.id} className={`flex items-start gap-4 ${message.type === 'answer' ? 'justify-end' : ''}`}>
                {message.type !== 'answer' && (
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot size={20} className="text-blue-600" />
                  </div>
                )}
                <div className={`flex-1 max-w-[70%] ${message.type === 'answer' ? 'text-right' : ''}`}>
                  <div className={`flex items-center gap-2 mb-2 ${message.type === 'answer' ? 'justify-end' : ''}`}>
                    <span className="text-sm font-medium text-gray-900">
                      {message.type === 'question' ? 'Interviewer' : message.type === 'answer' ? 'You' : 'AI Coach'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className={`p-4 rounded-lg ${
                    message.type === 'question'
                      ? 'bg-blue-50 border border-blue-200'
                      : message.type === 'answer'
                        ? 'bg-green-50 border border-green-200 ml-auto'
                        : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    {message.type === 'feedback' && message.score !== undefined && (
                      <div className="mb-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`text-3xl font-bold ${
                            message.score >= 80 ? 'text-green-600' :
                            message.score >= 60 ? 'text-blue-600' :
                            message.score >= 40 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {message.score}%
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-700 mb-1">Answer Score</div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  message.score >= 80 ? 'bg-green-600' :
                                  message.score >= 60 ? 'bg-blue-600' :
                                  message.score >= 40 ? 'bg-yellow-600' :
                                  'bg-red-600'
                                }`}
                                style={{ width: `${message.score}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
                {message.type === 'answer' && (
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-green-600" />
                  </div>
                )}
              </div>
            ))}

            {isWaitingForResponse && (
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area - Fixed at bottom of viewport */}
          {!session.completed && (
            <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white z-20">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Textbox - hidden while recording */}
                {!isRecording && (
                  <div className="py-3">
                    <textarea
                      ref={inputRef}
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your answer here... (Press Enter to send)"
                      className="w-full min-h-[80px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      disabled={isWaitingForResponse}
                    />
                    <div className="mt-1 text-xs text-gray-500 flex items-center justify-between">
                      <span>Press Enter to send • Auto mode: {autoMode ? 'TTS → Record' : 'Manual control'}</span>
                    </div>
                  </div>
                )}

                {/* Recording indicator */}
                {isRecording && (
                  <div className="py-3 flex items-center gap-3">
                    <span className="text-red-600 animate-pulse text-sm font-medium">● Recording... Click Stop when done</span>
                  </div>
                )}

                {/* Buttons - Horizontal line */}
                <div className="pb-4 flex items-center gap-3">
                  <button
                    onClick={togglePlayback}
                    disabled={!(session.chat || []).some(msg => msg.type === 'question')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                      isPlaying
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={isPlaying ? 'Stop playback' : 'Play latest question'}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    <span className="text-sm font-medium">{isPlaying ? 'Stop' : 'Play'}</span>
                  </button>
                  <button
                    onClick={toggleRecording}
                    disabled={isWaitingForResponse || (!isRecording && userInput.trim().length > 0)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                      isRecording
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={isRecording ? 'Stop recording and send' : userInput.trim() ? 'Clear text to use recording' : 'Start voice input'}
                  >
                    {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                    <span className="text-sm font-medium">{isRecording ? 'Stop' : 'Record'}</span>
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={!userInput.trim() || isWaitingForResponse || isRecording}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Send message"
                  >
                    <Send size={20} />
                    <span className="text-sm font-medium">Send</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {session.completed && (
            <div className="border-t border-gray-200 p-6 bg-green-50 flex-shrink-0">
              <div className="text-center">
                <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Interview Complete!</h3>
                <p className="text-gray-600 mb-4">
                  Great job practicing! Review your responses above and consider what you learned.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link
                    href="/tools/interview"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start New Interview
                  </Link>
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Print Summary
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}