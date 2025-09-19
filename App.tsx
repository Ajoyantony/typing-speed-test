import { useState, useEffect, useRef } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";

const SAMPLE_TEXT = "Kerala's most audacious make-a-thon! This 18-hour overnight event challenges TinkerHub Campus Chapter students to create brilliantly impractical tech solutions. Participants can build anything using software, hardware, or both - as long as it's purposefully useless! It's a playground for unbridled creativity, skill development, and the chance to win exciting prizes, including a 6-month scholarship.";

type TestState = 'welcome' | 'active' | 'paused' | 'finished';

export default function App() {
  const [testState, setTestState] = useState<TestState>('welcome');
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Timer effect
  useEffect(() => {
    if (testState === 'active' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTestState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [testState, timeLeft]);

  // Calculate stats
  useEffect(() => {
    if (userInput.length > 0 && startTime) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
      const wordsTyped = userInput.trim().split(' ').length;
      const currentWpm = Math.round(wordsTyped / timeElapsed) || 0;
      setWpm(currentWpm);

      let correct = 0;
      for (let i = 0; i < userInput.length; i++) {
        if (userInput[i] === SAMPLE_TEXT[i]) {
          correct++;
        }
      }
      setCorrectChars(correct);
      setTotalChars(userInput.length);
      
      const currentAccuracy = userInput.length > 0 ? Math.round((correct / userInput.length) * 100) : 100;
      setAccuracy(currentAccuracy);
    }
  }, [userInput, startTime]);

  const startTest = () => {
    setTestState('active');
    setStartTime(Date.now());
    setUserInput('');
    setTimeLeft(60);
    setWpm(0);
    setAccuracy(100);
    setCorrectChars(0);
    setTotalChars(0);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const stopTest = () => {
    setTestState('paused');
  };

  const resumeTest = () => {
    setTestState('active');
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const resetTest = () => {
    setTestState('welcome');
    setUserInput('');
    setTimeLeft(60);
    setWpm(0);
    setAccuracy(100);
    setCorrectChars(0);
    setTotalChars(0);
    setStartTime(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (testState !== 'active') return;
    
    const value = e.target.value;
    if (value.length <= SAMPLE_TEXT.length) {
      setUserInput(value);
    }
  };

  const renderHighlightedText = () => {
    return SAMPLE_TEXT.split('').map((char, index) => {
      let className = 'text-gray-400/70';
      
      if (index < userInput.length) {
        className = userInput[index] === char 
          ? 'text-green-400 bg-green-400/20 rounded-sm' 
          : 'text-red-400 bg-red-400/20 rounded-sm';
      } else if (index === userInput.length) {
        className = 'text-white bg-blue-500/60 rounded-sm animate-pulse shadow-sm';
      }
      
      return (
        <span key={index} className={`${className} px-0.5 py-0.5 transition-all duration-150`}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* iPhone-style background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
      
      <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">⚡</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">TypeSpeed</h2>
              <p className="text-xs text-gray-400">Pro Typing Test</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-5rem)] relative z-10">
        <Authenticated>
          <div className="w-full max-w-5xl mx-auto">
            {/* Welcome Screen */}
            {testState === 'welcome' && (
              <div className="text-center animate-fade-in">
                <div className="bg-white/8 backdrop-blur-2xl rounded-[2.5rem] p-12 border border-white/20 shadow-2xl shadow-black/20 max-w-2xl mx-auto">
                  <div className="mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/25">
                      <span className="text-white text-4xl">⚡</span>
                    </div>
                    <h1 className="text-6xl font-bold text-white mb-4 tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      TypeSpeed
                    </h1>
                    <p className="text-lg text-gray-300/90 leading-relaxed max-w-lg mx-auto">
                      Experience the ultimate typing test with real-time feedback, beautiful animations, and iPhone-inspired design.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <span className="text-green-400 text-sm">📊</span>
                      </div>
                      <p className="text-xs text-gray-400">Real-time WPM</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <span className="text-blue-400 text-sm">🎯</span>
                      </div>
                      <p className="text-xs text-gray-400">Live Accuracy</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <span className="text-purple-400 text-sm">⏱️</span>
                      </div>
                      <p className="text-xs text-gray-400">60s Timer</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={startTest}
                    className="group relative px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-blue-500/25 active:scale-95"
                  >
                    <span className="relative z-10 flex items-center space-x-2">
                      <span>Start Typing Test</span>
                      <span className="text-lg">→</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                  </button>
                </div>
              </div>
            )}

            {/* Test Screen */}
            {(testState === 'active' || testState === 'paused' || testState === 'finished') && (
              <div className="animate-fade-in space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/20 text-center shadow-lg">
                    <div className="text-4xl font-bold text-white mb-2 font-mono">{timeLeft}s</div>
                    <div className="text-gray-400 text-sm font-medium">Time Left</div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2 mt-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(timeLeft / 60) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/20 text-center shadow-lg">
                    <div className="text-4xl font-bold text-blue-400 mb-2 font-mono">{wpm}</div>
                    <div className="text-gray-400 text-sm font-medium">Words/Min</div>
                    <div className="text-xs text-blue-300 mt-2">
                      {wpm > 40 ? '🚀 Fast!' : wpm > 25 ? '👍 Good' : '📈 Keep going!'}
                    </div>
                  </div>
                  <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/20 text-center shadow-lg">
                    <div className="text-4xl font-bold text-green-400 mb-2 font-mono">{accuracy}%</div>
                    <div className="text-gray-400 text-sm font-medium">Accuracy</div>
                    <div className="text-xs text-green-300 mt-2">
                      {accuracy > 95 ? '🎯 Perfect!' : accuracy > 85 ? '✨ Great' : '💪 Focus!'}
                    </div>
                  </div>
                </div>

                {/* Text Display */}
                <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-lg">
                  <div className="font-mono text-lg leading-relaxed text-left max-h-48 overflow-y-auto custom-scrollbar">
                    {renderHighlightedText()}
                  </div>
                </div>

                {/* Input Area */}
                <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-lg">
                  <textarea
                    ref={textareaRef}
                    value={userInput}
                    onChange={handleInputChange}
                    disabled={testState !== 'active'}
                    placeholder={testState === 'active' ? "Start typing the text above..." : "Test paused"}
                    className="w-full h-32 bg-transparent border-none text-white placeholder-gray-500 font-mono text-lg resize-none focus:outline-none"
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex gap-4 justify-center">
                  {testState === 'active' && (
                    <button
                      onClick={stopTest}
                      className="px-8 py-3 bg-red-500/20 border border-red-500/30 text-red-300 font-semibold rounded-2xl hover:bg-red-500/30 transition-all duration-300 backdrop-blur-sm"
                    >
                      ⏸️ Pause
                    </button>
                  )}
                  
                  {testState === 'paused' && (
                    <button
                      onClick={resumeTest}
                      className="px-8 py-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 font-semibold rounded-2xl hover:bg-yellow-500/30 transition-all duration-300 backdrop-blur-sm"
                    >
                      ▶️ Resume
                    </button>
                  )}
                  
                  {(testState === 'paused' || testState === 'finished') && (
                    <button
                      onClick={resetTest}
                      className="px-8 py-3 bg-gray-500/20 border border-gray-500/30 text-gray-300 font-semibold rounded-2xl hover:bg-gray-500/30 transition-all duration-300 backdrop-blur-sm"
                    >
                      🔄 Reset
                    </button>
                  )}

                  {testState === 'finished' && (
                    <button
                      onClick={startTest}
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      🚀 Try Again
                    </button>
                  )}
                </div>

                {/* Results */}
                {testState === 'finished' && (
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-lg text-center">
                    <h3 className="text-3xl font-bold text-white mb-6">🎉 Test Complete!</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-2xl p-4">
                        <div className="text-2xl font-bold text-blue-400 mb-1">{wpm} WPM</div>
                        <div className="text-gray-400 text-sm">Final Speed</div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4">
                        <div className="text-2xl font-bold text-green-400 mb-1">{accuracy}%</div>
                        <div className="text-gray-400 text-sm">Accuracy</div>
                      </div>
                    </div>
                    <div className="mt-6 text-gray-300">
                      {wpm > 60 ? "🏆 Excellent typing speed!" : 
                       wpm > 40 ? "🌟 Great job!" : 
                       wpm > 25 ? "👍 Good work!" : "📈 Keep practicing!"}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Authenticated>

        <Unauthenticated>
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/8 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/20 shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white text-2xl">⚡</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
                  TypeSpeed
                </h1>
                <p className="text-gray-300">Sign in to start testing your typing speed</p>
              </div>
              <SignInForm />
            </div>
          </div>
        </Unauthenticated>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-xl border-t border-white/10 py-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <p className="text-gray-400">
            Built with ❤️ using React & Convex | Test your typing skills and improve your speed
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm">
            <span className="text-gray-500">©</span>
            <span className="text-white font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Ajoy Antony
            </span>
            <span className="text-gray-500">• Creator & Developer</span>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
