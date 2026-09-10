import { useEffect, useState, useRef } from 'react';
import { AppProvider, useApp, uuidv4 } from './store';
import { Home, BookOpen, ClipboardList, FileText, CheckSquare, Calendar, FolderOpen, HardDrive, Settings, Search, Bell, ChevronDown, Plus, Menu, X, Sun, Moon, LogOut, ChevronRight, Star, Clock, File, Image, Presentation, FileSpreadsheet, MessageCircle, Send, Sparkles, Users, GraduationCap, Eye, EyeOff, Zap, Brain, Target, BookMarked, Lightbulb } from 'lucide-react';
import { registerUser, loginUser, logoutUser, setCurrentUser, getCurrentUser, updateUserProfile, getChatMessages, addChatMessage, ALL_CLASS_CODES, getChatGroups, getUsers, hashPassword } from './auth';
import { summarizeNote, formatSummaryDisplay, quickSummary, generateStudyQuestions, generateFlashcards } from './ai';
import { Grade, Section, ClassCode, User } from './types';

function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

function AppRouter() {
  const { state } = useApp();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      // User already logged in
    }
    setAuthChecked(true);
  }, []);

  if (!authChecked) {
    return <div className="h-screen bg-gray-900 flex items-center justify-center"><div className="animate-pulse text-blue-400">Yükleniyor...</div></div>;
  }

  if (!state.isAuthenticated) {
    return <AuthPage />;
  }

  return <MainLayout />;
}

// ==================== AUTH PAGE ====================
function AuthPage() {
  const { dispatch } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regGrade, setRegGrade] = useState<Grade>('9');
  const [regSection, setRegSection] = useState<Section>('A');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await loginUser(loginEmail, loginPassword);
    setLoading(false);
    
    if (result.success && result.user) {
      setCurrentUser(result.user);
      dispatch({ type: 'SET_USER', payload: result.user });
      setSuccess('Giriş başarılı!');
    } else {
      setError(result.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (regPassword !== regConfirmPassword) {
      setError('Şifreler eşleşmiyor.');
      setLoading(false);
      return;
    }
    if (regPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      setLoading(false);
      return;
    }

    const result = await registerUser(regFirstName, regLastName, regEmail, regPassword, regGrade, regSection);
    setLoading(false);

    if (result.success && result.user) {
      setCurrentUser(result.user);
      dispatch({ type: 'SET_USER', payload: result.user });
      setSuccess('Kayıt başarılı!');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">StudyHub</h1>
          <p className="text-gray-400 mt-1">Kişisel Çalışma Platformu</p>
        </div>

        {/* Card */}
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700 p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex mb-6 bg-gray-700/50 rounded-lg p-1">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Kayıt Ol
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">{success}</div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">E-posta</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Şifre</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-lg text-sm font-medium text-white transition-colors"
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">İsim</label>
                  <input
                    value={regFirstName}
                    onChange={e => setRegFirstName(e.target.value)}
                    placeholder="Adınız"
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Soyisim</label>
                  <input
                    value={regLastName}
                    onChange={e => setRegLastName(e.target.value)}
                    placeholder="Soyadınız"
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">E-posta</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Sınıf</label>
                  <select
                    value={regGrade}
                    onChange={e => setRegGrade(e.target.value as Grade)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="9">9. Sınıf</option>
                    <option value="10">10. Sınıf</option>
                    <option value="11">11. Sınıf</option>
                    <option value="12">12. Sınıf</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Şube</label>
                  <select
                    value={regSection}
                    onChange={e => setRegSection(e.target.value as Section)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="A">A Şubesi</option>
                    <option value="B">B Şubesi</option>
                    <option value="C">C Şubesi</option>
                    <option value="D">D Şubesi</option>
                    <option value="E">E Şubesi</option>
                  </select>
                </div>
              </div>
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-300">📍 Sınıfınız: <strong>{regGrade}{regSection}</strong> — Bu sınıfa ait sohbet grubuna otomatik katılacaksınız.</p>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Şifre</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="En az 6 karakter"
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Şifre Tekrar</label>
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={e => setRegConfirmPassword(e.target.value)}
                  placeholder="Şifrenizi tekrar girin"
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-lg text-sm font-medium text-white transition-colors"
              >
                {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">Şifreler SHA-256 ile hashlenerek güvenli şekilde saklanır.</p>
      </div>
    </div>
  );
}

// ==================== MAIN LAYOUT ====================
function MainLayout() {
  const { state, dispatch } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseColor, setNewCourseColor] = useState('#3B82F6');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_SEARCH' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  const navItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: Home },
    { id: 'notes', label: 'Notlar', icon: BookOpen },
    { id: 'homework', label: 'Ödevler', icon: ClipboardList },
    { id: 'pdfs', label: "PDF'ler", icon: FileText },
    { id: 'tasks', label: 'Görevler', icon: CheckSquare },
    { id: 'calendar', label: 'Takvim', icon: Calendar },
    { id: 'chat', label: 'Sohbet', icon: MessageCircle },
    { id: 'projects', label: 'Projeler', icon: FolderOpen },
    { id: 'files', label: 'Dosyalar', icon: HardDrive },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];

  const unreadCount = state.notifications.filter(n => !n.isRead).length;

  const addCourse = () => {
    if (!newCourseName.trim()) return;
    const icons = ['📚', '📖', '🎓', '✏️', '🔬', '🎨', '🎵', '💻'];
    dispatch({
      type: 'ADD_COURSE',
      payload: {
        id: uuidv4(),
        name: newCourseName,
        color: newCourseColor,
        icon: icons[Math.floor(Math.random() * icons.length)],
        topics: [],
      },
    });
    setNewCourseName('');
    setShowAddCourse(false);
  };

  const handleLogout = () => {
    logoutUser();
    dispatch({ type: 'SET_USER', payload: null });
  };

  const renderPage = () => {
    switch (state.currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'notes': return <NotesPage />;
      case 'homework': return <HomeworkPage />;
      case 'pdfs': return <PDFsPage />;
      case 'tasks': return <TasksPage />;
      case 'calendar': return <CalendarPage />;
      case 'chat': return <ChatPage />;
      case 'projects': return <ProjectsPage />;
      case 'files': return <FilesPage />;
      case 'settings': return <SettingsPage />;
      case 'course-detail': return <CourseDetail />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${state.sidebarCollapsed ? 'w-16' : 'w-64'} bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 flex-shrink-0`}>
        <div className="p-4 border-b border-gray-700 flex items-center gap-3">
          {!state.sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <GraduationCap size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg">StudyHub</span>
            </div>
          )}
          <button onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })} className="ml-auto p-1 hover:bg-gray-700 rounded">
            <Menu size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => dispatch({ type: 'SET_PAGE', payload: item.id })}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                state.currentPage === item.id ? 'bg-blue-500/20 text-blue-400 border-r-2 border-blue-400' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
              }`}
            >
              <item.icon size={18} />
              {!state.sidebarCollapsed && <span>{item.label}</span>}
              {item.id === 'chat' && !state.sidebarCollapsed && (
                <span className="ml-auto text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">{state.currentUser?.classCode}</span>
              )}
            </button>
          ))}

          {!state.sidebarCollapsed && (
            <div className="mt-4 px-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dersler</span>
                <button onClick={() => setShowAddCourse(true)} className="text-gray-500 hover:text-blue-400">
                  <Plus size={14} />
                </button>
              </div>
              {state.courses.map(course => (
                <button
                  key={course.id}
                  onClick={() => {
                    dispatch({ type: 'SET_SELECTED_COURSE', payload: course.id });
                    dispatch({ type: 'SET_PAGE', payload: 'course-detail' });
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: course.color }} />
                  <span className="text-gray-300 truncate flex-1 text-left">{course.name}</span>
                  <span className="text-xs text-gray-600">{course.topics.length}</span>
                  <ChevronRight size={12} className="text-gray-600 opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          )}
        </nav>

        {!state.sidebarCollapsed && (
          <div className="p-4 border-t border-gray-700">
            <div className="text-xs text-gray-500 mb-1">Depolama</div>
            <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(state.settings.storageUsed / state.settings.storageTotal) * 100}%` }} />
            </div>
            <div className="text-xs text-gray-500">{state.settings.storageUsed} GB / {state.settings.storageTotal} GB</div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-4 flex-shrink-0">
          <div className="flex-1 max-w-xl">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_SEARCH' })}
              className="w-full flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-gray-400 hover:border-gray-500 transition-colors"
            >
              <Search size={14} />
              <span>Ara...</span>
              <span className="ml-auto text-xs bg-gray-600 px-1.5 py-0.5 rounded">Ctrl+K</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { theme: state.settings.theme === 'dark' ? 'light' : 'dark' } })}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {state.settings.theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-blue-300" />}
            </button>

            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">{unreadCount}</span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                    <span className="font-semibold text-sm">Bildirimler</span>
                    <span className="text-xs text-gray-500">{unreadCount} yeni</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {state.notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id })}
                        className={`p-3 border-b border-gray-700/50 cursor-pointer hover:bg-gray-700/30 ${!n.isRead ? 'bg-blue-500/5' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? 'bg-blue-400' : 'bg-gray-600'}`} />
                          <div>
                            <div className="text-sm font-medium">{n.title}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{n.message}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: state.currentUser?.avatar || '#3B82F6' }}>
                  {state.currentUser?.firstName?.[0]}{state.currentUser?.lastName?.[0]}
                </div>
                <span className="text-sm hidden md:block">{state.currentUser?.firstName}</span>
                <ChevronDown size={14} />
              </button>
              {showProfile && (
                <div className="absolute right-0 top-12 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-700">
                    <div className="text-sm font-medium">{state.currentUser?.firstName} {state.currentUser?.lastName}</div>
                    <div className="text-xs text-gray-500">{state.currentUser?.email}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">{state.currentUser?.classCode} Sınıfı</span>
                    </div>
                  </div>
                  <button onClick={() => { dispatch({ type: 'SET_PAGE', payload: 'settings' }); setShowProfile(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-700/50">
                    <Settings size={14} /> Ayarlar
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-700/50 text-red-400">
                    <LogOut size={14} /> Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>

      {state.searchOpen && <SearchModal />}

      {showAddCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddCourse(false)}>
          <div className="bg-gray-800 rounded-xl p-6 w-96 border border-gray-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Yeni Ders Ekle</h3>
            <input
              value={newCourseName}
              onChange={e => setNewCourseName(e.target.value)}
              placeholder="Ders adı"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm mb-3 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <div className="flex gap-2 mb-4">
              {['#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#F97316'].map(c => (
                <button key={c} onClick={() => setNewCourseColor(c)} className={`w-7 h-7 rounded-full border-2 ${newCourseColor === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAddCourse(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">İptal</button>
              <button onClick={addCourse} className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 rounded-lg">Ekle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== SEARCH MODAL ====================
function SearchModal() {
  const { state, dispatch } = useApp();
  const [query, setQuery] = useState('');

  const results = query.length > 0 ? {
    notes: state.notes.filter(n => n.title.toLowerCase().includes(query.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase())),
    homeworks: state.homeworks.filter(h => h.title.toLowerCase().includes(query.toLowerCase())),
    tasks: state.tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase())),
    courses: state.courses.filter(c => c.name.toLowerCase().includes(query.toLowerCase())),
    pdfs: state.pdfs.filter(p => p.name.toLowerCase().includes(query.toLowerCase())),
    files: state.files.filter(f => f.name.toLowerCase().includes(query.toLowerCase())),
  } : null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center pt-24 z-50" onClick={() => dispatch({ type: 'TOGGLE_SEARCH' })}>
      <div className="bg-gray-800 rounded-xl w-full max-w-2xl border border-gray-700 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
          <Search size={18} className="text-gray-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Notlar, ödevler, görevler, dosyalar ara..." className="flex-1 bg-transparent text-sm focus:outline-none" autoFocus />
          <button onClick={() => dispatch({ type: 'TOGGLE_SEARCH' })} className="text-gray-500 hover:text-white"><X size={16} /></button>
        </div>
        {results && (
          <div className="max-h-96 overflow-y-auto p-2">
            {results.courses.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-gray-500 px-3 py-1 font-semibold">Dersler</div>
                {results.courses.map(c => (
                  <button key={c.id} onClick={() => { dispatch({ type: 'SET_SELECTED_COURSE', payload: c.id }); dispatch({ type: 'SET_PAGE', payload: 'course-detail' }); dispatch({ type: 'TOGGLE_SEARCH' }); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700/50 rounded-lg text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />{c.name}
                  </button>
                ))}
              </div>
            )}
            {results.notes.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-gray-500 px-3 py-1 font-semibold">Notlar</div>
                {results.notes.slice(0, 5).map(n => (
                  <button key={n.id} onClick={() => { dispatch({ type: 'SET_PAGE', payload: 'notes' }); dispatch({ type: 'TOGGLE_SEARCH' }); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700/50 rounded-lg text-sm">
                    <BookOpen size={14} className="text-blue-400" />{n.title}
                  </button>
                ))}
              </div>
            )}
            {results.homeworks.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-gray-500 px-3 py-1 font-semibold">Ödevler</div>
                {results.homeworks.slice(0, 5).map(h => (
                  <button key={h.id} onClick={() => { dispatch({ type: 'SET_PAGE', payload: 'homework' }); dispatch({ type: 'TOGGLE_SEARCH' }); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700/50 rounded-lg text-sm">
                    <ClipboardList size={14} className="text-yellow-400" />{h.title}
                  </button>
                ))}
              </div>
            )}
            {Object.values(results).every(r => r.length === 0) && (
              <div className="text-center text-gray-500 py-8 text-sm">Sonuç bulunamadı</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== DASHBOARD ====================
function Dashboard() {
  const { state, dispatch } = useApp();
  const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const todayTasks = state.tasks.filter(t => t.date === '2024-01-16' && t.status === 'pending');
  const upcomingHomework = state.homeworks.filter(h => h.status === 'pending').slice(0, 4);
  const recentFiles = state.files.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Merhaba, {state.currentUser?.firstName} 👋</h1>
          <p className="text-gray-400 text-sm mt-1">{today}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">{state.currentUser?.classCode} Sınıfı</span>
            <span className="text-xs text-gray-500">{state.currentUser?.firstName} {state.currentUser?.lastName}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'notes' })} className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors">
            <Plus size={14} /> Yeni Not
          </button>
          <button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'homework' })} className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30 transition-colors">
            <Plus size={14} /> Yeni Ödev
          </button>
          <button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'tasks' })} className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors">
            <Plus size={14} /> Yeni Görev
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center"><BookOpen size={20} className="text-blue-400" /></div>
            <div><div className="text-2xl font-bold">{state.notes.length}</div><div className="text-xs text-gray-500">Toplam Not</div></div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center"><ClipboardList size={20} className="text-yellow-400" /></div>
            <div><div className="text-2xl font-bold">{state.homeworks.filter(h => h.status === 'pending').length}</div><div className="text-xs text-gray-500">Bekleyen Ödev</div></div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center"><FileText size={20} className="text-red-400" /></div>
            <div><div className="text-2xl font-bold">{state.pdfs.length}</div><div className="text-xs text-gray-500">Toplam PDF</div></div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center"><CheckSquare size={20} className="text-green-400" /></div>
            <div><div className="text-2xl font-bold">{state.tasks.filter(t => t.status === 'completed').length}</div><div className="text-xs text-gray-500">Tamamlanan</div></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Bugünkü Görevler</h3>
            <button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'tasks' })} className="text-xs text-blue-400 hover:text-blue-300">Tümü</button>
          </div>
          <div className="p-3 space-y-2">
            {todayTasks.length === 0 ? (
              <div className="text-center text-gray-500 py-4 text-sm">Bugün görev yok 🎉</div>
            ) : todayTasks.map(task => {
              const course = state.courses.find(c => c.id === task.courseId);
              return (
                <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/30">
                  <button onClick={() => dispatch({ type: 'UPDATE_TASK', payload: { ...task, status: 'completed', completedAt: new Date().toISOString() } })} className="w-5 h-5 border-2 border-gray-600 rounded flex-shrink-0 hover:border-green-400" />
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: course?.color || '#6B7280' }} />
                  <div className="flex-1 min-w-0"><div className="text-sm truncate">{task.title}</div><div className="text-xs text-gray-500">{task.time}</div></div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Yaklaşan Ödevler</h3>
            <button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'homework' })} className="text-xs text-blue-400 hover:text-blue-300">Tümü</button>
          </div>
          <div className="p-3 space-y-2">
            {upcomingHomework.map(hw => {
              const course = state.courses.find(c => c.id === hw.courseId);
              const daysLeft = Math.ceil((new Date(hw.dueDate).getTime() - new Date('2024-01-16').getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={hw.id} className="p-2 rounded-lg hover:bg-gray-700/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: course?.color || '#6B7280' }} />
                    <span className="text-sm font-medium truncate flex-1">{hw.title}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${daysLeft <= 1 ? 'bg-red-500/20 text-red-400' : daysLeft <= 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                      {daysLeft <= 0 ? 'Bugün' : `${daysLeft} gün`}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 ml-4">{course?.name} • {hw.dueDate}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Son Eklenen Dosyalar</h3>
            <button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'files' })} className="text-xs text-blue-400 hover:text-blue-300">Tümü</button>
          </div>
          <div className="p-3 space-y-2">
            {recentFiles.map(file => (
              <div key={file.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/30">
                <FileText size={16} className="text-red-400" />
                <div className="flex-1 min-w-0"><div className="text-sm truncate">{file.name}</div><div className="text-xs text-gray-500">{file.size} • {file.uploadedAt}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Quick Summary */}
      {state.notes.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-purple-400" />
            <h3 className="font-semibold text-sm text-purple-300">AI Hızlı Özet</h3>
          </div>
          <p className="text-xs text-gray-400 mb-2">Son notunuzdan: <strong>{state.notes[state.notes.length - 1]?.title}</strong></p>
          <p className="text-sm text-gray-300">{quickSummary(state.notes[state.notes.length - 1]?.content || '')}</p>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-sm mb-3">Derslerim</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {state.courses.map(course => (
            <button key={course.id} onClick={() => { dispatch({ type: 'SET_SELECTED_COURSE', payload: course.id }); dispatch({ type: 'SET_PAGE', payload: 'course-detail' }); }} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors text-center">
              <div className="text-2xl mb-2">{course.icon}</div>
              <div className="text-xs font-medium truncate">{course.name}</div>
              <div className="text-xs text-gray-500 mt-1">{course.topics.length} konu</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-300">💪 "Başarı, her gün tekrarlanan küçük çabaların toplamıdır."</p>
      </div>
    </div>
  );
}

// ==================== NOTES PAGE WITH AI ====================
function NotesPage() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('all');
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAISummary, setShowAISummary] = useState<string | null>(null);
  const [showAIQuestions, setShowAIQuestions] = useState<string | null>(null);
  const [showFlashcards, setShowFlashcards] = useState<string | null>(null);
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', courseId: '1', topicId: 't1', type: 'text' as const, description: '', tags: '' });

  const filteredNotes = filter === 'all' ? state.notes : state.notes.filter(n => n.courseId === filter);

  const addNote = () => {
    if (!newNote.title.trim()) return;
    const summary = summarizeNote(newNote.content, newNote.title);
    dispatch({
      type: 'ADD_NOTE',
      payload: {
        id: uuidv4(),
        title: newNote.title,
        content: newNote.content,
        courseId: newNote.courseId,
        topicId: newNote.topicId,
        type: newNote.type,
        description: newNote.description,
        tags: newNote.tags.split(',').map(t => t.trim()).filter(Boolean),
        color: state.courses.find(c => c.id === newNote.courseId)?.color || '#3B82F6',
        isFavorite: false,
        isArchived: false,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        linkedNoteIds: [],
        fileIds: [],
        aiSummary: summary.summary,
      },
    });
    setShowAddNote(false);
    setNewNote({ title: '', content: '', courseId: '1', topicId: 't1', type: 'text', description: '', tags: '' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Notlarım</h1>
        <button onClick={() => setShowAddNote(true)} className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm transition-colors">
          <Plus size={14} /> Yeni Not
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs ${filter === 'all' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>Tüm Dersler</button>
        {state.courses.map(c => (
          <button key={c.id} onClick={() => setFilter(c.id)} className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 ${filter === c.id ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />{c.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map(note => {
          const course = state.courses.find(c => c.id === note.courseId);
          const summary = note.aiSummary || summarizeNote(note.content, note.title);
          return (
            <div key={note.id} className="bg-gray-800 rounded-xl border border-gray-700 p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: course?.color || '#6B7280' }} />
                  <span className="text-xs text-gray-500">{course?.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => dispatch({ type: 'UPDATE_NOTE', payload: { ...note, isFavorite: !note.isFavorite } })}>
                    <Star size={14} className={note.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                  </button>
                  <button onClick={() => dispatch({ type: 'DELETE_NOTE', payload: note.id })}>
                    <X size={14} className="text-gray-600 hover:text-red-400" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-sm mb-1">{note.title}</h3>
              <p className="text-xs text-gray-400 line-clamp-3 mb-3">{note.content}</p>
              
              {/* AI Summary Button */}
              <div className="flex gap-1 mb-3">
                <button
                  onClick={() => setShowAISummary(showAISummary === note.id ? null : note.id)}
                  className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-[10px] hover:bg-purple-500/30"
                >
                  <Sparkles size={10} /> AI Özet
                </button>
                <button
                  onClick={() => setShowAIQuestions(showAIQuestions === note.id ? null : note.id)}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-[10px] hover:bg-blue-500/30"
                >
                  <Brain size={10} /> Sorular
                </button>
                <button
                  onClick={() => { setShowFlashcards(note.id); setFlashcardIdx(0); setFlashcardFlipped(false); }}
                  className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-[10px] hover:bg-green-500/30"
                >
                  <BookMarked size={10} /> Kartlar
                </button>
              </div>

              {/* AI Summary Display */}
              {showAISummary === note.id && (
                <div className="mb-3 p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center gap-1 mb-2">
                    <Sparkles size={12} className="text-purple-400" />
                    <span className="text-[10px] font-semibold text-purple-400">AI ÖZETİ</span>
                  </div>
                  <p className="text-xs text-gray-300 mb-2">{typeof summary === 'string' ? summary : summary.summary}</p>
                  {typeof summary !== 'string' && summary.importantTerms.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {summary.importantTerms.slice(0, 4).map(term => (
                        <span key={term} className="text-[9px] px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded">{term}</span>
                      ))}
                    </div>
                  )}
                  {typeof summary !== 'string' && (
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500">
                      <span>⏱️ {summary.estimatedReadTime} dk</span>
                      <span>📊 {summary.difficulty}</span>
                    </div>
                  )}
                </div>
              )}

              {/* AI Questions Display */}
              {showAIQuestions === note.id && (
                <div className="mb-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-1 mb-2">
                    <Brain size={12} className="text-blue-400" />
                    <span className="text-[10px] font-semibold text-blue-400">ÇALIŞMA SORULARI</span>
                  </div>
                  {generateStudyQuestions(note.content, note.title).map((q, i) => (
                    <div key={i} className="flex items-start gap-2 mb-1.5">
                      <span className="text-[10px] text-blue-400 font-bold">{i + 1}.</span>
                      <span className="text-xs text-gray-300">{q}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Flashcards Display */}
              {showFlashcards === note.id && (() => {
                const cards = generateFlashcards(note.content);
                if (cards.length === 0) return <div className="mb-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg text-xs text-gray-500">Flashcard oluşturulamadı.</div>;
                return (
                  <div className="mb-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-1 mb-2">
                      <BookMarked size={12} className="text-green-400" />
                      <span className="text-[10px] font-semibold text-green-400">ÇALIŞMA KARTLARI ({flashcardIdx + 1}/{cards.length})</span>
                    </div>
                    <div
                      onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                      className="p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors min-h-[60px] flex items-center justify-center text-center"
                    >
                      {!flashcardFlipped ? (
                        <span className="text-sm font-medium text-green-300">{cards[flashcardIdx]?.front}</span>
                      ) : (
                        <span className="text-xs text-gray-300">{cards[flashcardIdx]?.back}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <button onClick={() => { setFlashcardIdx(Math.max(0, flashcardIdx - 1)); setFlashcardFlipped(false); }} className="text-xs text-gray-500 hover:text-white" disabled={flashcardIdx === 0}>← Önceki</button>
                      <span className="text-[10px] text-gray-500">{flashcardFlipped ? 'Cevap' : 'Soru'} • Tıkla çevir</span>
                      <button onClick={() => { setFlashcardIdx(Math.min(cards.length - 1, flashcardIdx + 1)); setFlashcardFlipped(false); }} className="text-xs text-gray-500 hover:text-white" disabled={flashcardIdx === cards.length - 1}>Sonraki →</button>
                    </div>
                    <button onClick={() => setShowFlashcards(null)} className="w-full mt-2 text-[10px] text-gray-600 hover:text-gray-400">Kapat</button>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {note.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">{tag}</span>
                  ))}
                </div>
                <span className="text-[10px] text-gray-600">{note.updatedAt}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showAddNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddNote(false)}>
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg border border-gray-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Yeni Not</h3>
            <input value={newNote.title} onChange={e => setNewNote({ ...newNote, title: e.target.value })} placeholder="Başlık" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm mb-3 focus:outline-none focus:border-blue-500" autoFocus />
            <textarea value={newNote.content} onChange={e => setNewNote({ ...newNote, content: e.target.value })} placeholder="İçerik (AI otomatik özet oluşturacak)" rows={6} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm mb-3 focus:outline-none focus:border-blue-500 resize-none" />
            <div className="flex items-center gap-2 mb-3 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <Sparkles size={14} className="text-purple-400" />
              <span className="text-xs text-purple-300">AI otomatik olarak özet, önemli kavramlar ve çalışma soruları oluşturacak</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <select value={newNote.courseId} onChange={e => setNewNote({ ...newNote, courseId: e.target.value })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none">
                {state.courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={newNote.type} onChange={e => setNewNote({ ...newNote, type: e.target.value as any })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none">
                <option value="text">Metin</option>
                <option value="formula">Formül</option>
                <option value="code">Kod</option>
                <option value="link">Bağlantı</option>
              </select>
            </div>
            <input value={newNote.tags} onChange={e => setNewNote({ ...newNote, tags: e.target.value })} placeholder="Etiketler (virgülle ayırın)" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm mb-4 focus:outline-none focus:border-blue-500" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAddNote(false)} className="px-4 py-2 text-sm text-gray-400">İptal</button>
              <button onClick={addNote} className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 rounded-lg">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== CHAT PAGE ====================
function ChatPage() {
  const { state } = useApp();
  const [selectedChat, setSelectedChat] = useState<ClassCode | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = state.currentUser;

  useEffect(() => {
    if (user && !selectedChat) {
      setSelectedChat(user.classCode);
    }
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      setMessages(getChatMessages(selectedChat));
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !user || !selectedChat) return;
    addChatMessage(selectedChat, user.id, `${user.firstName} ${user.lastName}`, user.avatar, message);
    setMessages(getChatMessages(selectedChat));
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const chatGroups = getChatGroups();
  const activeGroups = chatGroups.filter(g => g.memberCount > 0);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex gap-4" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Chat List */}
      <div className="w-72 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <MessageCircle size={16} className="text-green-400" />
            Sınıf Sohbetleri
          </h2>
          <p className="text-xs text-gray-500 mt-1">Sınıfın: <strong className="text-green-400">{user?.classCode}</strong></p>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {/* My Class - Highlighted */}
          {user && (
            <button
              onClick={() => setSelectedChat(user.classCode)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${selectedChat === user.classCode ? 'bg-green-500/20 border border-green-500/30' : 'hover:bg-gray-700/50'}`}
            >
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <Users size={18} className="text-green-400" />
              </div>
              <div className="text-left flex-1">
                <div className="text-sm font-medium">{user.classCode} Sınıfı</div>
                <div className="text-[10px] text-green-400">Senin sınıfın</div>
              </div>
              <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                {getUsers().filter(u => u.classCode === user.classCode).length} üye
              </span>
            </button>
          )}

          {/* Other Active Groups */}
          <div className="text-xs text-gray-500 px-2 py-1 font-semibold">Diğer Sınıflar</div>
          {activeGroups.filter(g => g.classCode !== user?.classCode).map(group => (
            <button
              key={group.classCode}
              onClick={() => setSelectedChat(group.classCode)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors ${selectedChat === group.classCode ? 'bg-gray-700/50' : 'hover:bg-gray-700/30'}`}
            >
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-gray-400">{group.classCode}</span>
              </div>
              <div className="text-left flex-1">
                <div className="text-xs font-medium">{group.classCode} Sınıfı</div>
                <div className="text-[10px] text-gray-500">{group.memberCount} üye</div>
              </div>
            </button>
          ))}

          {activeGroups.filter(g => g.classCode !== user?.classCode).length === 0 && (
            <div className="text-center text-gray-600 text-xs py-4">Henüz diğer sınıflardan üye yok</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedChat === user?.classCode ? 'bg-green-500/20' : 'bg-gray-700'}`}>
                  <Users size={18} className={selectedChat === user?.classCode ? 'text-green-400' : 'text-gray-400'} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{selectedChat} Sınıf Sohbet</h3>
                  <p className="text-xs text-gray-500">{getUsers().filter(u => u.classCode === selectedChat).length} üye</p>
                </div>
              </div>
              {selectedChat === user?.classCode && (
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">Senin Sınıfın</span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-600 py-12">
                  <MessageCircle size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Henüz mesaj yok</p>
                  <p className="text-xs mt-1">İlk mesajı sen yaz!</p>
                </div>
              ) : messages.map(msg => {
                const isMe = msg.userId === user?.id;
                const isSystem = msg.type === 'system';
                
                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center">
                      <span className="text-[10px] px-3 py-1 bg-gray-700/50 rounded-full text-gray-500">{msg.content}</span>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ backgroundColor: msg.userAvatar }}>
                        {msg.userName.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                    )}
                    <div className={`max-w-[70%] ${isMe ? 'order-1' : ''}`}>
                      {!isMe && <div className="text-[10px] text-gray-500 mb-0.5 ml-1">{msg.userName}</div>}
                      <div className={`px-3 py-2 rounded-xl text-sm ${isMe ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-gray-700 text-gray-200 rounded-bl-sm'}`}>
                        {msg.content}
                      </div>
                      <div className={`text-[10px] text-gray-600 mt-0.5 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                    {isMe && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ backgroundColor: user?.avatar }}>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Mesaj yaz..."
                  className="flex-1 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="p-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-lg transition-colors"
                >
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Bir sohbet seçin
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== HOMEWORK PAGE ====================
function HomeworkPage() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newHw, setNewHw] = useState({ title: '', description: '', courseId: '1', topicId: 't1', dueDate: '', dueTime: '23:59', priority: 'medium' as const });

  const filtered = filter === 'all' ? state.homeworks : filter === 'pending' ? state.homeworks.filter(h => h.status === 'pending') : state.homeworks.filter(h => h.courseId === filter);

  const addHomework = () => {
    if (!newHw.title.trim()) return;
    dispatch({ type: 'ADD_HOMEWORK', payload: { ...newHw, id: uuidv4(), status: 'pending', completedAt: null, fileIds: [], notes: '', createdAt: new Date().toISOString().split('T')[0] } });
    setShowAdd(false);
    setNewHw({ title: '', description: '', courseId: '1', topicId: 't1', dueDate: '', dueTime: '23:59', priority: 'medium' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Ödevler</h1>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-sm"><Plus size={14} /> Yeni Ödev</button>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs ${filter === 'all' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400'}`}>Tümü</button>
        <button onClick={() => setFilter('pending')} className={`px-3 py-1.5 rounded-lg text-xs ${filter === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400'}`}>Bekleyen</button>
        {state.courses.map(c => (
          <button key={c.id} onClick={() => setFilter(c.id)} className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 ${filter === c.id ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400'}`}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />{c.name}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map(hw => {
          const course = state.courses.find(c => c.id === hw.courseId);
          const priorityColors = { high: 'text-red-400 bg-red-500/10', medium: 'text-yellow-400 bg-yellow-500/10', low: 'text-green-400 bg-green-500/10' };
          const priorityLabels = { high: 'Yüksek', medium: 'Orta', low: 'Düşük' };
          return (
            <div key={hw.id} className="bg-gray-800 rounded-xl border border-gray-700 p-4 flex items-center gap-4">
              <button onClick={() => dispatch({ type: 'UPDATE_HOMEWORK', payload: { ...hw, status: hw.status === 'completed' ? 'pending' : 'completed', completedAt: hw.status === 'completed' ? null : new Date().toISOString() } })} className={`w-5 h-5 border-2 rounded flex-shrink-0 ${hw.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-600 hover:border-green-400'}`} />
              <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: course?.color || '#6B7280' }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`font-medium text-sm ${hw.status === 'completed' ? 'line-through text-gray-500' : ''}`}>{hw.title}</h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${priorityColors[hw.priority]}`}>{priorityLabels[hw.priority]}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{hw.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-600">{course?.name}</span>
                  <span className="text-xs text-gray-600">📅 {hw.dueDate} {hw.dueTime}</span>
                </div>
              </div>
              <button onClick={() => dispatch({ type: 'DELETE_HOMEWORK', payload: hw.id })} className="p-1 hover:bg-gray-700 rounded"><X size={14} className="text-gray-600 hover:text-red-400" /></button>
            </div>
          );
        })}
      </div>
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg border border-gray-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Yeni Ödev</h3>
            <input value={newHw.title} onChange={e => setNewHw({ ...newHw, title: e.target.value })} placeholder="Ödev başlığı" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm mb-3 focus:outline-none focus:border-yellow-500" autoFocus />
            <textarea value={newHw.description} onChange={e => setNewHw({ ...newHw, description: e.target.value })} placeholder="Açıklama" rows={3} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm mb-3 focus:outline-none focus:border-yellow-500 resize-none" />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <select value={newHw.courseId} onChange={e => setNewHw({ ...newHw, courseId: e.target.value })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none">
                {state.courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={newHw.priority} onChange={e => setNewHw({ ...newHw, priority: e.target.value as any })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none">
                <option value="high">Yüksek</option><option value="medium">Orta</option><option value="low">Düşük</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <input type="date" value={newHw.dueDate} onChange={e => setNewHw({ ...newHw, dueDate: e.target.value })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none" />
              <input type="time" value={newHw.dueTime} onChange={e => setNewHw({ ...newHw, dueTime: e.target.value })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-400">İptal</button>
              <button onClick={addHomework} className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== TASKS PAGE ====================
function TasksPage() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', courseId: '1', topicId: 't1', date: '', time: '09:00', priority: 'medium' as const, isRecurring: false });

  const filtered = filter === 'all' ? state.tasks : filter === 'pending' ? state.tasks.filter(t => t.status === 'pending') : filter === 'completed' ? state.tasks.filter(t => t.status === 'completed') : state.tasks.filter(t => t.courseId === filter);

  const addTask = () => {
    if (!newTask.title.trim()) return;
    dispatch({ type: 'ADD_TASK', payload: { ...newTask, id: uuidv4(), status: 'pending', completedAt: null, createdAt: new Date().toISOString().split('T')[0] } });
    setShowAdd(false);
    setNewTask({ title: '', description: '', courseId: '1', topicId: 't1', date: '', time: '09:00', priority: 'medium', isRecurring: false });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Görevler</h1>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg text-sm"><Plus size={14} /> Yeni Görev</button>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs ${filter === 'all' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>Tümü</button>
        <button onClick={() => setFilter('pending')} className={`px-3 py-1.5 rounded-lg text-xs ${filter === 'pending' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>Bekleyen</button>
        <button onClick={() => setFilter('completed')} className={`px-3 py-1.5 rounded-lg text-xs ${filter === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>Tamamlanan</button>
      </div>
      <div className="space-y-2">
        {filtered.map(task => {
          const course = state.courses.find(c => c.id === task.courseId);
          return (
            <div key={task.id} className="bg-gray-800 rounded-xl border border-gray-700 p-3 flex items-center gap-3 hover:border-gray-600">
              <button onClick={() => dispatch({ type: 'UPDATE_TASK', payload: { ...task, status: task.status === 'completed' ? 'pending' : 'completed', completedAt: task.status === 'completed' ? null : new Date().toISOString() } })} className={`w-5 h-5 border-2 rounded flex-shrink-0 ${task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-600 hover:border-green-400'}`} />
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: course?.color || '#6B7280' }} />
              <div className="flex-1 min-w-0">
                <div className={`text-sm ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>{task.title}</div>
                <div className="flex items-center gap-2 mt-0.5"><Clock size={10} className="text-gray-600" /><span className="text-xs text-gray-500">{task.date} {task.time}</span>{task.isRecurring && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded">Tekrarlayan</span>}</div>
              </div>
              <div className={`text-[10px] px-1.5 py-0.5 rounded ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' : task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
              </div>
              <button onClick={() => dispatch({ type: 'DELETE_TASK', payload: task.id })} className="p-1 hover:bg-gray-700 rounded"><X size={14} className="text-gray-600 hover:text-red-400" /></button>
            </div>
          );
        })}
      </div>
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg border border-gray-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Yeni Görev</h3>
            <input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="Görev başlığı" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm mb-3 focus:outline-none focus:border-green-500" autoFocus />
            <textarea value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} placeholder="Açıklama" rows={2} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm mb-3 focus:outline-none focus:border-green-500 resize-none" />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <select value={newTask.courseId} onChange={e => setNewTask({ ...newTask, courseId: e.target.value })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none">
                {state.courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none">
                <option value="high">Yüksek</option><option value="medium">Orta</option><option value="low">Düşük</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="date" value={newTask.date} onChange={e => setNewTask({ ...newTask, date: e.target.value })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none" />
              <input type="time" value={newTask.time} onChange={e => setNewTask({ ...newTask, time: e.target.value })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none" />
            </div>
            <label className="flex items-center gap-2 mb-4"><input type="checkbox" checked={newTask.isRecurring} onChange={e => setNewTask({ ...newTask, isRecurring: e.target.checked })} className="rounded" /><span className="text-sm text-gray-400">Tekrarlayan görev</span></label>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-400">İptal</button>
              <button onClick={addTask} className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-black rounded-lg">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== CALENDAR PAGE ====================
function CalendarPage() {
  const { state, dispatch } = useApp();
  const [selectedDate, setSelectedDate] = useState('2024-01-16');
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', startTime: '09:00', endTime: '10:00', category: 'study' as const, courseId: '1', description: '' });

  const dayEvents = state.calendarEvents.filter(e => e.date === selectedDate);
  const hours = Array.from({ length: 14 }, (_, i) => i + 7);
  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const selectedDayName = dayNames[new Date(selectedDate).getDay()];
  const categoryColors: Record<string, string> = { study: '#3B82F6', project: '#10B981', research: '#8B5CF6', sport: '#F59E0B', break: '#6B7280', notes: '#EC4899', exam: '#EF4444' };
  const categoryLabels: Record<string, string> = { study: 'Ders Çalışma', project: 'Proje', research: 'Araştırma', sport: 'Spor', break: 'Mola', notes: 'Not Düzenleme', exam: 'Sınav' };

  const addEvent = () => {
    if (!newEvent.title.trim()) return;
    dispatch({ type: 'ADD_EVENT', payload: { ...newEvent, id: uuidv4(), date: selectedDate, color: categoryColors[newEvent.category] || '#3B82F6' } });
    setShowAdd(false);
    setNewEvent({ title: '', startTime: '09:00', endTime: '10:00', category: 'study', courseId: '1', description: '' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold">Takvim</h1><p className="text-sm text-gray-400">{selectedDayName}, {selectedDate}</p></div>
        <div className="flex items-center gap-3">
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none" />
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm"><Plus size={14} /> Etkinlik</button>
        </div>
      </div>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-700/50">
          {hours.map(hour => {
            const hourEvents = dayEvents.filter(e => parseInt(e.startTime.split(':')[0]) === hour);
            return (
              <div key={hour} className="flex min-h-[60px]">
                <div className="w-16 flex-shrink-0 p-2 text-xs text-gray-500 border-r border-gray-700/50">{hour.toString().padStart(2, '0')}:00</div>
                <div className="flex-1 p-1 flex flex-col gap-1">
                  {hourEvents.map(event => (
                    <div key={event.id} className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 group cursor-pointer hover:opacity-80" style={{ backgroundColor: event.color + '20', borderLeft: `3px solid ${event.color}` }}>
                      <span className="font-medium text-xs">{event.startTime}-{event.endTime}</span>
                      <span className="text-sm">{event.title}</span>
                      <span className="text-[10px] text-gray-400 ml-auto">{categoryLabels[event.category]}</span>
                      <button onClick={() => dispatch({ type: 'DELETE_EVENT', payload: event.id })} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-3 mt-4 flex-wrap">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: categoryColors[key] }} /><span className="text-xs text-gray-400">{label}</span></div>
        ))}
      </div>
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg border border-gray-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Yeni Etkinlik</h3>
            <input value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Etkinlik adı" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm mb-3 focus:outline-none focus:border-blue-500" autoFocus />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="time" value={newEvent.startTime} onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none" />
              <input type="time" value={newEvent.endTime} onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none" />
            </div>
            <select value={newEvent.category} onChange={e => setNewEvent({ ...newEvent, category: e.target.value as any })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm mb-3 focus:outline-none">
              {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={newEvent.courseId} onChange={e => setNewEvent({ ...newEvent, courseId: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm mb-4 focus:outline-none">
              <option value="">Ders seçin (opsiyonel)</option>
              {state.courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-400">İptal</button>
              <button onClick={addEvent} className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 rounded-lg">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== PDFs PAGE ====================
function PDFsPage() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? state.pdfs : state.pdfs.filter(p => p.courseId === filter);
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">PDF'ler</h1>
        <button className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30"><Plus size={14} /> PDF Yükle</button>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs ${filter === 'all' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'}`}>Tümü</button>
        {state.courses.map(c => (
          <button key={c.id} onClick={() => setFilter(c.id)} className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 ${filter === c.id ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'}`}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />{c.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(pdf => {
          const course = state.courses.find(c => c.id === pdf.courseId);
          return (
            <div key={pdf.id} className="bg-gray-800 rounded-xl border border-gray-700 p-4 hover:border-gray-600">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2"><FileText size={20} className="text-red-400" /><div><div className="text-sm font-medium truncate max-w-[180px]">{pdf.name}</div><div className="text-xs text-gray-500">{pdf.size}</div></div></div>
                <Star size={14} className={pdf.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
              </div>
              <p className="text-xs text-gray-400 mb-2">{pdf.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: course?.color || '#6B7280' }} /><span className="text-xs text-gray-500">{course?.name}</span></div>
                <div className="flex gap-1">{pdf.tags.slice(0, 2).map(tag => <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">{tag}</span>)}</div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700/50">
                <span className="text-[10px] text-gray-600">Yüklendi: {pdf.uploadedAt}</span>
                <button onClick={() => dispatch({ type: 'DELETE_PDF', payload: pdf.id })} className="text-[10px] text-gray-600 hover:text-red-400">Sil</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== FILES PAGE ====================
function FilesPage() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? state.files : state.files.filter(f => f.type === filter);
  const getFileIcon = (type: string) => {
    switch (type) { case 'pdf': return <FileText size={20} className="text-red-400" />; case 'docx': return <File size={20} className="text-blue-400" />; case 'image': return <Image size={20} className="text-green-400" />; case 'presentation': return <Presentation size={20} className="text-orange-400" />; default: return <File size={20} className="text-gray-400" />; }
  };
  const typeLabels: Record<string, string> = { pdf: 'PDF', docx: 'Word', image: 'Görsel', presentation: 'Sunum', txt: 'Metin', other: 'Diğer' };
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Dosyalar</h1>
        <button className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30"><Plus size={14} /> Dosya Yükle</button>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs ${filter === 'all' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-400'}`}>Tümü</button>
        {Object.entries(typeLabels).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} className={`px-3 py-1.5 rounded-lg text-xs ${filter === key ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-400'}`}>{label}</button>
        ))}
      </div>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-gray-700">
            <th className="text-left text-xs text-gray-500 font-medium p-3">Dosya</th><th className="text-left text-xs text-gray-500 font-medium p-3">Tür</th><th className="text-left text-xs text-gray-500 font-medium p-3">Boyut</th><th className="text-left text-xs text-gray-500 font-medium p-3">Ders</th><th className="text-left text-xs text-gray-500 font-medium p-3">Tarih</th><th className="text-right text-xs text-gray-500 font-medium p-3">İşlem</th>
          </tr></thead>
          <tbody>
            {filtered.map(file => {
              const course = state.courses.find(c => c.id === file.courseId);
              return (
                <tr key={file.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                  <td className="p-3"><div className="flex items-center gap-2">{getFileIcon(file.type)}<span className="text-sm truncate max-w-[200px]">{file.name}</span></div></td>
                  <td className="p-3"><span className="text-xs px-2 py-0.5 bg-gray-700 rounded text-gray-400">{typeLabels[file.type]}</span></td>
                  <td className="p-3 text-xs text-gray-400">{file.size}</td>
                  <td className="p-3"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: course?.color || '#6B7280' }} /><span className="text-xs text-gray-400">{course?.name || '-'}</span></div></td>
                  <td className="p-3 text-xs text-gray-500">{file.uploadedAt}</td>
                  <td className="p-3 text-right"><button onClick={() => dispatch({ type: 'DELETE_FILE', payload: file.id })} className="text-xs text-gray-600 hover:text-red-400">Sil</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== PROJECTS PAGE ====================
function ProjectsPage() {
  const { state, dispatch } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', startDate: '', endDate: '', courseId: '1', topicId: 't1' });
  const addProject = () => {
    if (!newProject.name.trim()) return;
    dispatch({ type: 'ADD_PROJECT', payload: { ...newProject, id: uuidv4(), status: 'active', progress: 0, taskIds: [], fileIds: [], noteIds: [], createdAt: new Date().toISOString().split('T')[0] } });
    setShowAdd(false);
    setNewProject({ name: '', description: '', startDate: '', endDate: '', courseId: '1', topicId: 't1' });
  };
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Projeler</h1>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm"><Plus size={14} /> Yeni Proje</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.projects.map(project => {
          const course = state.courses.find(c => c.id === project.courseId);
          return (
            <div key={project.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-gray-600">
              <div className="flex items-start justify-between mb-3">
                <div><h3 className="font-semibold">{project.name}</h3><p className="text-xs text-gray-400 mt-1">{project.description}</p></div>
                <span className={`text-[10px] px-2 py-0.5 rounded ${project.status === 'active' ? 'bg-green-500/20 text-green-400' : project.status === 'completed' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {project.status === 'active' ? 'Aktif' : project.status === 'completed' ? 'Tamamlandı' : 'Duraklatıldı'}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: course?.color || '#6B7280' }} /><span className="text-xs text-gray-500">{course?.name}</span></div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1"><span>İlerleme</span><span>{project.progress}%</span></div>
                <div className="w-full bg-gray-700 rounded-full h-2"><div className="h-2 rounded-full" style={{ width: `${project.progress}%`, backgroundColor: course?.color || '#3B82F6' }} /></div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mt-3">
                <span>{project.startDate} → {project.endDate}</span>
                <button onClick={() => dispatch({ type: 'DELETE_PROJECT', payload: project.id })} className="text-gray-600 hover:text-red-400">Sil</button>
              </div>
            </div>
          );
        })}
      </div>
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg border border-gray-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Yeni Proje</h3>
            <input value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} placeholder="Proje adı" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm mb-3 focus:outline-none focus:border-indigo-500" autoFocus />
            <textarea value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} placeholder="Açıklama" rows={3} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm mb-3 focus:outline-none focus:border-indigo-500 resize-none" />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="date" value={newProject.startDate} onChange={e => setNewProject({ ...newProject, startDate: e.target.value })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none" />
              <input type="date" value={newProject.endDate} onChange={e => setNewProject({ ...newProject, endDate: e.target.value })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none" />
            </div>
            <select value={newProject.courseId} onChange={e => setNewProject({ ...newProject, courseId: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm mb-4 focus:outline-none">
              {state.courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-400">İptal</button>
              <button onClick={addProject} className="px-4 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 rounded-lg">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== COURSE DETAIL ====================
function CourseDetail() {
  const { state, dispatch } = useApp();
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const course = state.courses.find(c => c.id === state.selectedCourseId);
  if (!course) return <div className="text-center text-gray-500 py-20">Ders bulunamadı</div>;
  const courseNotes = state.notes.filter(n => n.courseId === course.id);
  const courseHomeworks = state.homeworks.filter(h => h.courseId === course.id);
  const courseTasks = state.tasks.filter(t => t.courseId === course.id);
  const coursePDFs = state.pdfs.filter(p => p.courseId === course.id);
  const addTopic = () => {
    if (!newTopicName.trim()) return;
    dispatch({ type: 'ADD_TOPIC', payload: { courseId: course.id, topic: { id: uuidv4(), name: newTopicName, description: newTopicDesc, courseId: course.id, noteCount: 0, lastUpdated: new Date().toISOString().split('T')[0] } } });
    setShowAddTopic(false); setNewTopicName(''); setNewTopicDesc('');
  };
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: course.color + '20' }}>{course.icon}</div>
        <div><h1 className="text-xl font-bold">{course.name}</h1><p className="text-sm text-gray-400">{course.topics.length} konu • {courseNotes.length} not • {courseHomeworks.length} ödev</p></div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'notes' })} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs">Notlar</button>
          <button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'homework' })} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs">Ödevler</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center"><div className="text-lg font-bold" style={{ color: course.color }}>{course.topics.length}</div><div className="text-xs text-gray-500">Konu</div></div>
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center"><div className="text-lg font-bold" style={{ color: course.color }}>{courseNotes.length}</div><div className="text-xs text-gray-500">Not</div></div>
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center"><div className="text-lg font-bold" style={{ color: course.color }}>{courseHomeworks.filter(h => h.status === 'pending').length}</div><div className="text-xs text-gray-500">Bekleyen Ödev</div></div>
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center"><div className="text-lg font-bold" style={{ color: course.color }}>{coursePDFs.length}</div><div className="text-xs text-gray-500">PDF</div></div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Konular</h2>
        <button onClick={() => setShowAddTopic(true)} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg"><Plus size={12} /> Konu Ekle</button>
      </div>
      <div className="space-y-2">
        {course.topics.map(topic => {
          const topicNotes = courseNotes.filter(n => n.topicId === topic.id);
          return (
            <div key={topic.id} className="bg-gray-800 rounded-xl border border-gray-700 p-4 hover:border-gray-600 group">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: course.color }} />
                <div className="flex-1"><h3 className="font-medium text-sm">{topic.name}</h3><p className="text-xs text-gray-500 mt-0.5">{topic.description}</p></div>
                <div className="flex items-center gap-3 text-xs text-gray-500"><span>{topicNotes.length} not</span><span>{topic.lastUpdated}</span><ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400" /></div>
                <button onClick={() => dispatch({ type: 'DELETE_TOPIC', payload: { courseId: course.id, topicId: topic.id } })} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded"><X size={12} className="text-gray-600 hover:text-red-400" /></button>
              </div>
            </div>
          );
        })}
      </div>
      {courseTasks.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold mb-3">Görevler</h2>
          <div className="space-y-2">
            {courseTasks.map(task => (
              <div key={task.id} className="bg-gray-800 rounded-lg border border-gray-700 p-3 flex items-center gap-3">
                <button onClick={() => dispatch({ type: 'UPDATE_TASK', payload: { ...task, status: task.status === 'completed' ? 'pending' : 'completed', completedAt: task.status === 'completed' ? null : new Date().toISOString() } })} className={`w-4 h-4 border-2 rounded flex-shrink-0 ${task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-600'}`} />
                <span className={`text-sm ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>{task.title}</span>
                <span className="text-xs text-gray-600 ml-auto">{task.date} {task.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {showAddTopic && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddTopic(false)}>
          <div className="bg-gray-800 rounded-xl p-6 w-96 border border-gray-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Yeni Konu</h3>
            <input value={newTopicName} onChange={e => setNewTopicName(e.target.value)} placeholder="Konu adı" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm mb-3 focus:outline-none focus:border-blue-500" autoFocus />
            <textarea value={newTopicDesc} onChange={e => setNewTopicDesc(e.target.value)} placeholder="Açıklama" rows={2} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm mb-4 focus:outline-none focus:border-blue-500 resize-none" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAddTopic(false)} className="px-4 py-2 text-sm text-gray-400">İptal</button>
              <button onClick={addTopic} className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 rounded-lg">Ekle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== SETTINGS PAGE ====================
function SettingsPage() {
  const { state, dispatch } = useApp();
  const user = state.currentUser;
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saved, setSaved] = useState(false);

  const saveProfile = () => {
    if (!user) return;
    const updated = updateUserProfile(user.id, { firstName, lastName, bio });
    if (updated) {
      dispatch({ type: 'SET_USER', payload: updated });
      setCurrentUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleLogout = () => {
    logoutUser();
    dispatch({ type: 'SET_USER', payload: null });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Ayarlar</h1>

      {/* Profile */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-4">
        <h2 className="font-semibold mb-4">Profil Bilgileri</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: user?.avatar || '#3B82F6' }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <div className="text-lg font-bold">{user?.firstName} {user?.lastName}</div>
            <div className="text-sm text-gray-400">{user?.email}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">{user?.classCode} Sınıfı</span>
              <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">{user?.grade}. Sınıf</span>
              <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">{user?.section} Şubesi</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">İsim</label>
            <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Soyisim</label>
            <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>
        <div className="mb-3">
          <label className="text-xs text-gray-400 mb-1 block">Sınıf / Şube</label>
          <div className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-gray-400">
            {user?.grade}. Sınıf {user?.section} Şubesi <span className="text-xs text-gray-600">(Değiştirilemez)</span>
          </div>
        </div>
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block">Hakkımda</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Kendini tanıt..." rows={2} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none" />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={saveProfile} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm">Kaydet</button>
          {saved && <span className="text-xs text-green-400">✓ Kaydedildi!</span>}
        </div>
      </div>

      {/* Theme */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-4">
        <h2 className="font-semibold mb-4">Tema</h2>
        <div className="flex gap-3">
          <button onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { theme: 'dark' } })} className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${state.settings.theme === 'dark' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700'}`}>
            <Moon size={16} /> Koyu Tema
          </button>
          <button onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { theme: 'light' } })} className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${state.settings.theme === 'light' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700'}`}>
            <Sun size={16} /> Açık Tema
          </button>
        </div>
      </div>

      {/* Storage */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-4">
        <h2 className="font-semibold mb-4">Depolama</h2>
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1"><span className="text-gray-400">Kullanılan</span><span>{state.settings.storageUsed} GB / {state.settings.storageTotal} GB</span></div>
          <div className="w-full bg-gray-700 rounded-full h-3"><div className="bg-blue-500 h-3 rounded-full" style={{ width: `${(state.settings.storageUsed / state.settings.storageTotal) * 100}%` }} /></div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-4">
        <h2 className="font-semibold mb-4">Bildirimler</h2>
        <label className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Bildirimleri etkinleştir</span>
          <button onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { notifications: !state.settings.notifications } })} className={`w-10 h-5 rounded-full transition-colors ${state.settings.notifications ? 'bg-blue-500' : 'bg-gray-600'}`}>
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${state.settings.notifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </label>
      </div>

      {/* Data */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-4">
        <h2 className="font-semibold mb-4">Veri Yönetimi</h2>
        <div className="flex gap-3 flex-wrap">
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">Verileri Dışa Aktar</button>
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">Yedek Oluştur</button>
          <button onClick={() => { localStorage.removeItem('studyhub_state'); window.location.reload(); }} className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm">Verileri Sıfırla</button>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-gray-800 rounded-xl border border-red-500/20 p-6">
        <h2 className="font-semibold mb-2 text-red-400">Hesap</h2>
        <p className="text-xs text-gray-500 mb-4">Çıkış yaptığınızda tekrar giriş yapmanız gerekecektir.</p>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm flex items-center gap-2">
          <LogOut size={14} /> Çıkış Yap
        </button>
      </div>
    </div>
  );
}

export default App;
