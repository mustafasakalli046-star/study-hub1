import { useEffect, useState } from 'react';
import { AppProvider, useApp, uuidv4 } from './store';
import { Home, BookOpen, ClipboardList, FileText, CheckSquare, Calendar, FolderOpen, HardDrive, Settings, Search, Bell, ChevronDown, Plus, Menu, X, Sun, Moon, User, LogOut, ChevronRight, Star, Archive, Clock, AlertTriangle, File, Image, Presentation, FileSpreadsheet } from 'lucide-react';

function AppContent() {
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

  const getCourseById = (id: string) => state.courses.find(c => c.id === id);
  const getTopicById = (courseId: string, topicId: string) => {
    const course = getCourseById(courseId);
    return course?.topics.find(t => t.id === topicId);
  };

  const navItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: Home },
    { id: 'notes', label: 'Notlar', icon: BookOpen },
    { id: 'homework', label: 'Ödevler', icon: ClipboardList },
    { id: 'pdfs', label: "PDF'ler", icon: FileText },
    { id: 'tasks', label: 'Görevler', icon: CheckSquare },
    { id: 'calendar', label: 'Takvim', icon: Calendar },
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

  const renderPage = () => {
    switch (state.currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'notes': return <NotesPage />;
      case 'homework': return <HomeworkPage />;
      case 'pdfs': return <PDFsPage />;
      case 'tasks': return <TasksPage />;
      case 'calendar': return <CalendarPage />;
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
        {/* Logo */}
        <div className="p-4 border-b border-gray-700 flex items-center gap-3">
          {!state.sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
              <span className="font-bold text-lg">StudyHub</span>
            </div>
          )}
          <button onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })} className="ml-auto p-1 hover:bg-gray-700 rounded">
            <Menu size={18} />
          </button>
        </div>

        {/* Navigation */}
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
            </button>
          ))}

          {/* Courses Section */}
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

        {/* Storage */}
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
          {/* Search */}
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

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { theme: state.settings.theme === 'dark' ? 'light' : 'dark' } })}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {state.settings.theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-blue-300" />}
            </button>

            {/* Notifications */}
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

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold">
                  {state.settings.username[0]}
                </div>
                <span className="text-sm hidden md:block">{state.settings.username}</span>
                <ChevronDown size={14} />
              </button>
              {showProfile && (
                <div className="absolute right-0 top-12 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-700">
                    <div className="text-sm font-medium">{state.settings.username}</div>
                    <div className="text-xs text-gray-500">öğrenci@studyhub.com</div>
                  </div>
                  <button onClick={() => { dispatch({ type: 'SET_PAGE', payload: 'settings' }); setShowProfile(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-700/50">
                    <Settings size={14} /> Ayarlar
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-700/50 text-red-400">
                    <LogOut size={14} /> Çıkış
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>

      {/* Search Modal */}
      {state.searchOpen && <SearchModal />}

      {/* Add Course Modal */}
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
                <button
                  key={c}
                  onClick={() => setNewCourseColor(c)}
                  className={`w-7 h-7 rounded-full border-2 ${newCourseColor === c ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
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

// Search Modal Component
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
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Notlar, ödevler, görevler, dosyalar ara..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
            autoFocus
          />
          <button onClick={() => dispatch({ type: 'TOGGLE_SEARCH' })} className="text-gray-500 hover:text-white">
            <X size={16} />
          </button>
        </div>
        {results && (
          <div className="max-h-96 overflow-y-auto p-2">
            {results.courses.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-gray-500 px-3 py-1 font-semibold">Dersler</div>
                {results.courses.map(c => (
                  <button key={c.id} onClick={() => { dispatch({ type: 'SET_SELECTED_COURSE', payload: c.id }); dispatch({ type: 'SET_PAGE', payload: 'course-detail' }); dispatch({ type: 'TOGGLE_SEARCH' }); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700/50 rounded-lg text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </button>
                ))}
              </div>
            )}
            {results.notes.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-gray-500 px-3 py-1 font-semibold">Notlar</div>
                {results.notes.map(n => (
                  <button key={n.id} onClick={() => { dispatch({ type: 'SET_PAGE', payload: 'notes' }); dispatch({ type: 'TOGGLE_SEARCH' }); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700/50 rounded-lg text-sm">
                    <BookOpen size={14} className="text-blue-400" />
                    {n.title}
                  </button>
                ))}
              </div>
            )}
            {results.homeworks.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-gray-500 px-3 py-1 font-semibold">Ödevler</div>
                {results.homeworks.map(h => (
                  <button key={h.id} onClick={() => { dispatch({ type: 'SET_PAGE', payload: 'homework' }); dispatch({ type: 'TOGGLE_SEARCH' }); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700/50 rounded-lg text-sm">
                    <ClipboardList size={14} className="text-yellow-400" />
                    {h.title}
                  </button>
                ))}
              </div>
            )}
            {results.tasks.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-gray-500 px-3 py-1 font-semibold">Görevler</div>
                {results.tasks.map(t => (
                  <button key={t.id} onClick={() => { dispatch({ type: 'SET_PAGE', payload: 'tasks' }); dispatch({ type: 'TOGGLE_SEARCH' }); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700/50 rounded-lg text-sm">
                    <CheckSquare size={14} className="text-green-400" />
                    {t.title}
                  </button>
                ))}
              </div>
            )}
            {results.pdfs.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-gray-500 px-3 py-1 font-semibold">PDF'ler</div>
                {results.pdfs.map(p => (
                  <button key={p.id} onClick={() => { dispatch({ type: 'SET_PAGE', payload: 'pdfs' }); dispatch({ type: 'TOGGLE_SEARCH' }); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700/50 rounded-lg text-sm">
                    <FileText size={14} className="text-red-400" />
                    {p.name}
                  </button>
                ))}
              </div>
            )}
            {results.files.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-gray-500 px-3 py-1 font-semibold">Dosyalar</div>
                {results.files.map(f => (
                  <button key={f.id} onClick={() => { dispatch({ type: 'SET_PAGE', payload: 'files' }); dispatch({ type: 'TOGGLE_SEARCH' }); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700/50 rounded-lg text-sm">
                    <HardDrive size={14} className="text-purple-400" />
                    {f.name}
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

// Dashboard Component
function Dashboard() {
  const { state, dispatch } = useApp();
  const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const todayTasks = state.tasks.filter(t => t.date === '2024-01-16' && t.status === 'pending');
  const upcomingHomework = state.homeworks.filter(h => h.status === 'pending').slice(0, 4);
  const recentFiles = state.files.slice(0, 4);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText size={16} className="text-red-400" />;
      case 'docx': return <File size={16} className="text-blue-400" />;
      case 'image': return <Image size={16} className="text-green-400" />;
      case 'presentation': return <Presentation size={16} className="text-orange-400" />;
      default: return <File size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Merhaba, {state.settings.username} 👋</h1>
          <p className="text-gray-400 text-sm mt-1">{today}</p>
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <BookOpen size={20} className="text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{state.notes.length}</div>
              <div className="text-xs text-gray-500">Toplam Not</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <ClipboardList size={20} className="text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{state.homeworks.filter(h => h.status === 'pending').length}</div>
              <div className="text-xs text-gray-500">Bekleyen Ödev</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{state.pdfs.length}</div>
              <div className="text-xs text-gray-500">Toplam PDF</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckSquare size={20} className="text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{state.tasks.filter(t => t.status === 'completed').length}</div>
              <div className="text-xs text-gray-500">Tamamlanan Görev</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
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
                <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/30 group">
                  <button
                    onClick={() => dispatch({ type: 'UPDATE_TASK', payload: { ...task, status: 'completed', completedAt: new Date().toISOString() } })}
                    className="w-5 h-5 border-2 border-gray-600 rounded flex-shrink-0 hover:border-green-400 transition-colors"
                  />
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: course?.color || '#6B7280' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{task.title}</div>
                    <div className="text-xs text-gray-500">{task.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Homework */}
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

        {/* Recent Files */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Son Eklenen Dosyalar</h3>
            <button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'files' })} className="text-xs text-blue-400 hover:text-blue-300">Tümü</button>
          </div>
          <div className="p-3 space-y-2">
            {recentFiles.map(file => (
              <div key={file.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/30">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{file.name}</div>
                  <div className="text-xs text-gray-500">{file.size} • {file.uploadedAt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Derslerim</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {state.courses.map(course => (
            <button
              key={course.id}
              onClick={() => { dispatch({ type: 'SET_SELECTED_COURSE', payload: course.id }); dispatch({ type: 'SET_PAGE', payload: 'course-detail' }); }}
              className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors text-center group"
            >
              <div className="text-2xl mb-2">{course.icon}</div>
              <div className="text-xs font-medium truncate">{course.name}</div>
              <div className="text-xs text-gray-500 mt-1">{course.topics.length} konu</div>
            </button>
          ))}
        </div>
      </div>

      {/* Motivation */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-300">💪 "Başarı, her gün tekrarlanan küçük çabaların toplamıdır."</p>
      </div>
    </div>
  );
}

// Notes Page
function NotesPage() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('all');
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', courseId: '1', topicId: 't1', type: 'text' as const, description: '', tags: '' });

  const filteredNotes = filter === 'all' ? state.notes : state.notes.filter(n => n.courseId === filter);

  const addNote = () => {
    if (!newNote.title.trim()) return;
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

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs ${filter === 'all' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>Tüm Dersler</button>
        {state.courses.map(c => (
          <button key={c.id} onClick={() => setFilter(c.id)} className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 ${filter === c.id ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
            {c.name}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map(note => {
          const course = state.courses.find(c => c.id === note.courseId);
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

      {/* Add Note Modal */}
      {showAddNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddNote(false)}>
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg border border-gray-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Yeni Not</h3>
            <input value={newNote.title} onChange={e => setNewNote({ ...newNote, title: e.target.value })} placeholder="Başlık" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm mb-3 focus:outline-none focus:border-blue-500" autoFocus />
            <textarea value={newNote.content} onChange={e => setNewNote({ ...newNote, content: e.target.value })} placeholder="İçerik" rows={4} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm mb-3 focus:outline-none focus:border-blue-500 resize-none" />
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

// Homework Page
function HomeworkPage() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newHw, setNewHw] = useState({ title: '', description: '', courseId: '1', topicId: 't1', dueDate: '', dueTime: '23:59', priority: 'medium' as const });

  const filtered = filter === 'all' ? state.homeworks : filter === 'pending' ? state.homeworks.filter(h => h.status === 'pending') : state.homeworks.filter(h => h.courseId === filter);

  const addHomework = () => {
    if (!newHw.title.trim()) return;
    dispatch({
      type: 'ADD_HOMEWORK',
      payload: { ...newHw, id: uuidv4(), status: 'pending', completedAt: null, fileIds: [], notes: '', createdAt: new Date().toISOString().split('T')[0] },
    });
    setShowAdd(false);
    setNewHw({ title: '', description: '', courseId: '1', topicId: 't1', dueDate: '', dueTime: '23:59', priority: 'medium' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Ödevler</h1>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-sm transition-colors">
          <Plus size={14} /> Yeni Ödev
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs ${filter === 'all' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400'}`}>Tümü</button>
        <button onClick={() => setFilter('pending')} className={`px-3 py-1.5 rounded-lg text-xs ${filter === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400'}`}>Bekleyen</button>
        {state.courses.map(c => (
          <button key={c.id} onClick={() => setFilter(c.id)} className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 ${filter === c.id ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400'}`}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
            {c.name}
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
              <button
                onClick={() => dispatch({ type: 'UPDATE_HOMEWORK', payload: { ...hw, status: hw.status === 'completed' ? 'pending' : 'completed', completedAt: hw.status === 'completed' ? null : new Date().toISOString() } })}
                className={`w-5 h-5 border-2 rounded flex-shrink-0 ${hw.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-600 hover:border-green-400'}`}
              />
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
              <button onClick={() => dispatch({ type: 'DELETE_HOMEWORK', payload: hw.id })} className="p-1 hover:bg-gray-700 rounded">
                <X size={14} className="text-gray-600 hover:text-red-400" />
              </button>
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
                <option value="high">Yüksek Öncelik</option>
                <option value="medium">Orta Öncelik</option>
                <option value="low">Düşük Öncelik</option>
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

// Tasks Page
function TasksPage() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', courseId: '1', topicId: 't1', date: '', time: '09:00', priority: 'medium' as const, isRecurring: false });

  const filtered = filter === 'all' ? state.tasks : filter === 'pending' ? state.tasks.filter(t => t.status === 'pending') : filter === 'completed' ? state.tasks.filter(t => t.status === 'completed') : state.tasks.filter(t => t.courseId === filter);

  const addTask = () => {
    if (!newTask.title.trim()) return;
    dispatch({
      type: 'ADD_TASK',
      payload: { ...newTask, id: uuidv4(), status: 'pending', completedAt: null, createdAt: new Date().toISOString().split('T')[0] },
    });
    setShowAdd(false);
    setNewTask({ title: '', description: '', courseId: '1', topicId: 't1', date: '', time: '09:00', priority: 'medium', isRecurring: false });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Görevler</h1>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg text-sm transition-colors">
          <Plus size={14} /> Yeni Görev
        </button>
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
            <div key={task.id} className="bg-gray-800 rounded-xl border border-gray-700 p-3 flex items-center gap-3 hover:border-gray-600 transition-colors">
              <button
                onClick={() => dispatch({ type: 'UPDATE_TASK', payload: { ...task, status: task.status === 'completed' ? 'pending' : 'completed', completedAt: task.status === 'completed' ? null : new Date().toISOString() } })}
                className={`w-5 h-5 border-2 rounded flex-shrink-0 ${task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-600 hover:border-green-400'}`}
              />
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: course?.color || '#6B7280' }} />
              <div className="flex-1 min-w-0">
                <div className={`text-sm ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>{task.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock size={10} className="text-gray-600" />
                  <span className="text-xs text-gray-500">{task.date} {task.time}</span>
                  {task.isRecurring && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded">Tekrarlayan</span>}
                </div>
              </div>
              <div className={`text-[10px] px-1.5 py-0.5 rounded ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' : task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
              </div>
              <button onClick={() => dispatch({ type: 'DELETE_TASK', payload: task.id })} className="p-1 hover:bg-gray-700 rounded">
                <X size={14} className="text-gray-600 hover:text-red-400" />
              </button>
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
                <option value="high">Yüksek</option>
                <option value="medium">Orta</option>
                <option value="low">Düşük</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="date" value={newTask.date} onChange={e => setNewTask({ ...newTask, date: e.target.value })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none" />
              <input type="time" value={newTask.time} onChange={e => setNewTask({ ...newTask, time: e.target.value })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none" />
            </div>
            <label className="flex items-center gap-2 mb-4">
              <input type="checkbox" checked={newTask.isRecurring} onChange={e => setNewTask({ ...newTask, isRecurring: e.target.checked })} className="rounded" />
              <span className="text-sm text-gray-400">Tekrarlayan görev</span>
            </label>
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

// Calendar Page
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
    dispatch({
      type: 'ADD_EVENT',
      payload: { ...newEvent, id: uuidv4(), date: selectedDate, color: categoryColors[newEvent.category] || '#3B82F6' },
    });
    setShowAdd(false);
    setNewEvent({ title: '', startTime: '09:00', endTime: '10:00', category: 'study', courseId: '1', description: '' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Takvim</h1>
          <p className="text-sm text-gray-400">{selectedDayName}, {selectedDate}</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none" />
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm">
            <Plus size={14} /> Etkinlik
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-700/50">
          {hours.map(hour => {
            const hourEvents = dayEvents.filter(e => {
              const startH = parseInt(e.startTime.split(':')[0]);
              return startH === hour;
            });
            return (
              <div key={hour} className="flex min-h-[60px]">
                <div className="w-16 flex-shrink-0 p-2 text-xs text-gray-500 border-r border-gray-700/50">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1 p-1 flex flex-col gap-1">
                  {hourEvents.map(event => (
                    <div
                      key={event.id}
                      className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 group cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: event.color + '20', borderLeft: `3px solid ${event.color}` }}
                    >
                      <span className="font-medium text-xs">{event.startTime}-{event.endTime}</span>
                      <span className="text-sm">{event.title}</span>
                      <span className="text-[10px] text-gray-400 ml-auto">{categoryLabels[event.category]}</span>
                      <button onClick={() => dispatch({ type: 'DELETE_EVENT', payload: event.id })} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 mt-4 flex-wrap">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: categoryColors[key] }} />
            <span className="text-xs text-gray-400">{label}</span>
          </div>
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

// PDFs Page
function PDFsPage() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? state.pdfs : state.pdfs.filter(p => p.courseId === filter);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">PDF'ler</h1>
        <button className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30">
          <Plus size={14} /> PDF Yükle
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs ${filter === 'all' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'}`}>Tümü</button>
        {state.courses.map(c => (
          <button key={c.id} onClick={() => setFilter(c.id)} className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 ${filter === c.id ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'}`}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(pdf => {
          const course = state.courses.find(c => c.id === pdf.courseId);
          return (
            <div key={pdf.id} className="bg-gray-800 rounded-xl border border-gray-700 p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-red-400" />
                  <div>
                    <div className="text-sm font-medium truncate max-w-[180px]">{pdf.name}</div>
                    <div className="text-xs text-gray-500">{pdf.size}</div>
                  </div>
                </div>
                <button onClick={() => dispatch({ type: 'UPDATE_NOTE', payload: { ...pdf, isFavorite: !pdf.isFavorite } as any })}>
                  <Star size={14} className={pdf.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-2">{pdf.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: course?.color || '#6B7280' }} />
                  <span className="text-xs text-gray-500">{course?.name}</span>
                </div>
                <div className="flex gap-1">
                  {pdf.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">{tag}</span>
                  ))}
                </div>
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

// Files Page
function FilesPage() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? state.files : state.files.filter(f => f.type === filter);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText size={20} className="text-red-400" />;
      case 'docx': return <File size={20} className="text-blue-400" />;
      case 'image': return <Image size={20} className="text-green-400" />;
      case 'presentation': return <Presentation size={20} className="text-orange-400" />;
      case 'txt': return <FileSpreadsheet size={20} className="text-gray-400" />;
      default: return <File size={20} className="text-gray-400" />;
    }
  };

  const typeLabels: Record<string, string> = { pdf: 'PDF', docx: 'Word', image: 'Görsel', presentation: 'Sunum', txt: 'Metin', other: 'Diğer' };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Dosyalar</h1>
        <button className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30">
          <Plus size={14} /> Dosya Yükle
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs ${filter === 'all' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-400'}`}>Tümü</button>
        {Object.entries(typeLabels).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} className={`px-3 py-1.5 rounded-lg text-xs ${filter === key ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-400'}`}>{label}</button>
        ))}
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left text-xs text-gray-500 font-medium p-3">Dosya</th>
              <th className="text-left text-xs text-gray-500 font-medium p-3">Tür</th>
              <th className="text-left text-xs text-gray-500 font-medium p-3">Boyut</th>
              <th className="text-left text-xs text-gray-500 font-medium p-3">Ders</th>
              <th className="text-left text-xs text-gray-500 font-medium p-3">Tarih</th>
              <th className="text-right text-xs text-gray-500 font-medium p-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(file => {
              const course = state.courses.find(c => c.id === file.courseId);
              return (
                <tr key={file.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.type)}
                      <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                    </div>
                  </td>
                  <td className="p-3"><span className="text-xs px-2 py-0.5 bg-gray-700 rounded text-gray-400">{typeLabels[file.type]}</span></td>
                  <td className="p-3 text-xs text-gray-400">{file.size}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: course?.color || '#6B7280' }} />
                      <span className="text-xs text-gray-400">{course?.name || '-'}</span>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-gray-500">{file.uploadedAt}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => dispatch({ type: 'DELETE_FILE', payload: file.id })} className="text-xs text-gray-600 hover:text-red-400">Sil</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Projects Page
function ProjectsPage() {
  const { state, dispatch } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', startDate: '', endDate: '', courseId: '1', topicId: 't1' });

  const addProject = () => {
    if (!newProject.name.trim()) return;
    dispatch({
      type: 'ADD_PROJECT',
      payload: { ...newProject, id: uuidv4(), status: 'active', progress: 0, taskIds: [], fileIds: [], noteIds: [], createdAt: new Date().toISOString().split('T')[0] },
    });
    setShowAdd(false);
    setNewProject({ name: '', description: '', startDate: '', endDate: '', courseId: '1', topicId: 't1' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Projeler</h1>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm">
          <Plus size={14} /> Yeni Proje
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.projects.map(project => {
          const course = state.courses.find(c => c.id === project.courseId);
          return (
            <div key={project.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{project.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{project.description}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded ${project.status === 'active' ? 'bg-green-500/20 text-green-400' : project.status === 'completed' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {project.status === 'active' ? 'Aktif' : project.status === 'completed' ? 'Tamamlandı' : 'Duraklatıldı'}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: course?.color || '#6B7280' }} />
                <span className="text-xs text-gray-500">{course?.name}</span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>İlerleme</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${project.progress}%`, backgroundColor: course?.color || '#3B82F6' }} />
                </div>
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

// Course Detail Page
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
    dispatch({
      type: 'ADD_TOPIC',
      payload: { courseId: course.id, topic: { id: uuidv4(), name: newTopicName, description: newTopicDesc, courseId: course.id, noteCount: 0, lastUpdated: new Date().toISOString().split('T')[0] } },
    });
    setShowAddTopic(false);
    setNewTopicName('');
    setNewTopicDesc('');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Course Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: course.color + '20' }}>
          {course.icon}
        </div>
        <div>
          <h1 className="text-xl font-bold">{course.name}</h1>
          <p className="text-sm text-gray-400">{course.topics.length} konu • {courseNotes.length} not • {courseHomeworks.length} ödev</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'notes' })} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs">Notlar</button>
          <button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'homework' })} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs">Ödevler</button>
          <button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'pdfs' })} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs">PDF'ler</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center">
          <div className="text-lg font-bold" style={{ color: course.color }}>{course.topics.length}</div>
          <div className="text-xs text-gray-500">Konu</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center">
          <div className="text-lg font-bold" style={{ color: course.color }}>{courseNotes.length}</div>
          <div className="text-xs text-gray-500">Not</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center">
          <div className="text-lg font-bold" style={{ color: course.color }}>{courseHomeworks.filter(h => h.status === 'pending').length}</div>
          <div className="text-xs text-gray-500">Bekleyen Ödev</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center">
          <div className="text-lg font-bold" style={{ color: course.color }}>{coursePDFs.length}</div>
          <div className="text-xs text-gray-500">PDF</div>
        </div>
      </div>

      {/* Topics */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Konular</h2>
        <button onClick={() => setShowAddTopic(true)} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg">
          <Plus size={12} /> Konu Ekle
        </button>
      </div>

      <div className="space-y-2">
        {course.topics.map(topic => {
          const topicNotes = courseNotes.filter(n => n.topicId === topic.id);
          return (
            <div key={topic.id} className="bg-gray-800 rounded-xl border border-gray-700 p-4 hover:border-gray-600 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: course.color }} />
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{topic.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{topic.description}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{topicNotes.length} not</span>
                  <span>{topic.lastUpdated}</span>
                  <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400" />
                </div>
                <button onClick={() => dispatch({ type: 'DELETE_TOPIC', payload: { courseId: course.id, topicId: topic.id } })} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded">
                  <X size={12} className="text-gray-600 hover:text-red-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Tasks */}
      {courseTasks.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold mb-3">Görevler</h2>
          <div className="space-y-2">
            {courseTasks.map(task => (
              <div key={task.id} className="bg-gray-800 rounded-lg border border-gray-700 p-3 flex items-center gap-3">
                <button
                  onClick={() => dispatch({ type: 'UPDATE_TASK', payload: { ...task, status: task.status === 'completed' ? 'pending' : 'completed', completedAt: task.status === 'completed' ? null : new Date().toISOString() } })}
                  className={`w-4 h-4 border-2 rounded flex-shrink-0 ${task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}
                />
                <span className={`text-sm ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>{task.title}</span>
                <span className="text-xs text-gray-600 ml-auto">{task.date} {task.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
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

// Settings Page
function SettingsPage() {
  const { state, dispatch } = useApp();
  const [username, setUsername] = useState(state.settings.username);

  const saveSettings = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { username } });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Ayarlar</h1>

      {/* Profile */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-4">
        <h2 className="font-semibold mb-4">Profil</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold">
            {username[0]}
          </div>
          <div>
            <input value={username} onChange={e => setUsername(e.target.value)} className="bg-transparent border-b border-gray-600 text-lg font-medium focus:outline-none focus:border-blue-500 pb-1" />
            <p className="text-xs text-gray-500 mt-1">öğrenci@studyhub.com</p>
          </div>
        </div>
        <button onClick={saveSettings} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm">Kaydet</button>
      </div>

      {/* Theme */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-4">
        <h2 className="font-semibold mb-4">Tema</h2>
        <div className="flex gap-3">
          <button
            onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { theme: 'dark' } })}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${state.settings.theme === 'dark' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700'}`}
          >
            <Moon size={16} /> Koyu Tema
          </button>
          <button
            onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { theme: 'light' } })}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${state.settings.theme === 'light' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700'}`}
          >
            <Sun size={16} /> Açık Tema
          </button>
        </div>
      </div>

      {/* Storage */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-4">
        <h2 className="font-semibold mb-4">Depolama</h2>
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Kullanılan</span>
            <span>{state.settings.storageUsed} GB / {state.settings.storageTotal} GB</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${(state.settings.storageUsed / state.settings.storageTotal) * 100}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-gray-700/50 rounded-lg p-2">
            <div className="text-sm font-bold">{state.notes.length}</div>
            <div className="text-xs text-gray-500">Not</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-2">
            <div className="text-sm font-bold">{state.pdfs.length}</div>
            <div className="text-xs text-gray-500">PDF</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-2">
            <div className="text-sm font-bold">{state.files.length}</div>
            <div className="text-xs text-gray-500">Dosya</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-4">
        <h2 className="font-semibold mb-4">Bildirimler</h2>
        <label className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Bildirimleri etkinleştir</span>
          <button
            onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { notifications: !state.settings.notifications } })}
            className={`w-10 h-5 rounded-full transition-colors ${state.settings.notifications ? 'bg-blue-500' : 'bg-gray-600'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${state.settings.notifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </label>
      </div>

      {/* Data Management */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h2 className="font-semibold mb-4">Veri Yönetimi</h2>
        <div className="flex gap-3 flex-wrap">
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">Verileri Dışa Aktar</button>
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">Verileri İçe Aktar</button>
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">Yedek Oluştur</button>
          <button
            onClick={() => { localStorage.removeItem('studyhub_state'); window.location.reload(); }}
            className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm"
          >
            Verileri Sıfırla
          </button>
        </div>
      </div>
    </div>
  );
}

// Main App
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
