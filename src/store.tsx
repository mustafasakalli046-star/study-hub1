import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Course, Note, Homework, Task, CalendarEvent, PDFFile, FileItem, Project, Exam, StudySession, Notification, UserSettings, User } from './types';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from './auth';

interface AppState {
  courses: Course[];
  notes: Note[];
  homeworks: Homework[];
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  pdfs: PDFFile[];
  files: FileItem[];
  projects: Project[];
  exams: Exam[];
  studySessions: StudySession[];
  notifications: Notification[];
  settings: UserSettings;
  currentPage: string;
  selectedCourseId: string | null;
  selectedTopicId: string | null;
  searchOpen: boolean;
  sidebarCollapsed: boolean;
  currentUser: User | null;
  isAuthenticated: boolean;
}

type Action =
  | { type: 'SET_PAGE'; payload: string }
  | { type: 'SET_SELECTED_COURSE'; payload: string | null }
  | { type: 'SET_SELECTED_TOPIC'; payload: string | null }
  | { type: 'TOGGLE_SEARCH' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'ADD_COURSE'; payload: Course }
  | { type: 'UPDATE_COURSE'; payload: Course }
  | { type: 'DELETE_COURSE'; payload: string }
  | { type: 'ADD_TOPIC'; payload: { courseId: string; topic: any } }
  | { type: 'DELETE_TOPIC'; payload: { courseId: string; topicId: string } }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'ADD_HOMEWORK'; payload: Homework }
  | { type: 'UPDATE_HOMEWORK'; payload: Homework }
  | { type: 'DELETE_HOMEWORK'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_EVENT'; payload: CalendarEvent }
  | { type: 'UPDATE_EVENT'; payload: CalendarEvent }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'ADD_PDF'; payload: PDFFile }
  | { type: 'DELETE_PDF'; payload: string }
  | { type: 'ADD_FILE'; payload: FileItem }
  | { type: 'DELETE_FILE'; payload: string }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_EXAM'; payload: Exam }
  | { type: 'DELETE_EXAM'; payload: string }
  | { type: 'ADD_STUDY_SESSION'; payload: StudySession }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

const defaultCourses: Course[] = [
  { id: '1', name: 'Matematik', color: '#3B82F6', icon: '📐', topics: [
    { id: 't1', name: 'Fonksiyonlar', description: 'Fonksiyon tanımı, işlemler, bileşke ve ters fonksiyon', courseId: '1', noteCount: 5, lastUpdated: '2024-01-15' },
    { id: 't2', name: 'Limit ve Süreklilik', description: 'Limit kavramı, sağ-sol limit, süreklilik', courseId: '1', noteCount: 3, lastUpdated: '2024-01-12' },
    { id: 't3', name: 'Türev', description: 'Türev kuralları, uygulama', courseId: '1', noteCount: 4, lastUpdated: '2024-01-10' },
    { id: 't4', name: 'İntegral', description: 'Belirli ve belirsiz integral', courseId: '1', noteCount: 2, lastUpdated: '2024-01-08' },
    { id: 't5', name: 'Geometri', description: 'Üçgenler, daireler, analitik geometri', courseId: '1', noteCount: 6, lastUpdated: '2024-01-14' },
  ]},
  { id: '2', name: 'Fizik', color: '#EF4444', icon: '⚡', topics: [
    { id: 't6', name: 'Mekanik', description: 'Newton yasaları, enerji, momentum', courseId: '2', noteCount: 4, lastUpdated: '2024-01-13' },
    { id: 't7', name: 'Elektrik', description: 'Elektrik alan, potansiyel, akım', courseId: '2', noteCount: 3, lastUpdated: '2024-01-11' },
    { id: 't8', name: 'Optik', description: 'Işık, mercekler, aynalar', courseId: '2', noteCount: 2, lastUpdated: '2024-01-09' },
  ]},
  { id: '3', name: 'Kimya', color: '#10B981', icon: '🧪', topics: [
    { id: 't9', name: 'Atom Yapısı', description: 'Atom modelleri, elektron dizilimi', courseId: '3', noteCount: 3, lastUpdated: '2024-01-14' },
    { id: 't10', name: 'Periyodik Tablo', description: 'Element özellikleri, periyotlar', courseId: '3', noteCount: 2, lastUpdated: '2024-01-12' },
  ]},
  { id: '4', name: 'Biyoloji', color: '#8B5CF6', icon: '🧬', topics: [
    { id: 't11', name: 'Hücre', description: 'Hücre yapısı, organeller', courseId: '4', noteCount: 4, lastUpdated: '2024-01-15' },
    { id: 't12', name: 'Genetik', description: 'DNA, kalıtım, mutasyon', courseId: '4', noteCount: 3, lastUpdated: '2024-01-13' },
  ]},
  { id: '5', name: 'Türkçe', color: '#F59E0B', icon: '📝', topics: [
    { id: 't13', name: 'Dil Bilgisi', description: 'Cümle yapısı, fiil çekimleri', courseId: '5', noteCount: 5, lastUpdated: '2024-01-14' },
    { id: 't14', name: 'Edebiyat', description: 'Edebi dönemler, yazarlar, eserler', courseId: '5', noteCount: 4, lastUpdated: '2024-01-11' },
  ]},
  { id: '6', name: 'Tarih', color: '#EC4899', icon: '📜', topics: [
    { id: 't15', name: 'Osmanlı İmparatorluğu', description: 'Kuruluş, yükselme, gerileme', courseId: '6', noteCount: 6, lastUpdated: '2024-01-15' },
    { id: 't16', name: 'Kurtuluş Savaşı', description: 'Cepheler, anlaşmalar, Cumhuriyet', courseId: '6', noteCount: 4, lastUpdated: '2024-01-13' },
  ]},
  { id: '7', name: 'İngilizce', color: '#06B6D4', icon: '🌍', topics: [
    { id: 't17', name: 'Grammar', description: 'Tenses, modals, conditionals', courseId: '7', noteCount: 5, lastUpdated: '2024-01-14' },
    { id: 't18', name: 'Vocabulary', description: 'Kelime listeleri, eş anlamlılar', courseId: '7', noteCount: 3, lastUpdated: '2024-01-12' },
  ]},
];

const defaultNotes: Note[] = [
  { id: 'n1', title: 'Fonksiyon Tanımı', content: 'f: A → B şeklinde tanımlanan bağıntıya fonksiyon denir. Her x∈A için tek bir y∈B vardır.', courseId: '1', topicId: 't1', type: 'text', description: 'Temel fonksiyon tanımı', tags: ['temel', 'tanım'], color: '#3B82F6', isFavorite: true, isArchived: false, createdAt: '2024-01-10', updatedAt: '2024-01-15', linkedNoteIds: [], fileIds: [] },
  { id: 'n2', title: 'Limit Kuralları', content: 'lim(x→a) [f(x) ± g(x)] = lim f(x) ± lim g(x)\nlim(x→a) [f(x) · g(x)] = lim f(x) · lim g(x)', courseId: '1', topicId: 't2', type: 'formula', description: 'Limit hesaplama kuralları', tags: ['limit', 'kurallar'], color: '#3B82F6', isFavorite: false, isArchived: false, createdAt: '2024-01-08', updatedAt: '2024-01-12', linkedNoteIds: [], fileIds: [] },
  { id: 'n3', title: "Newton'un 2. Yasası", content: 'F = m · a\nKuvvet = Kütle × İvme\nBirim: Newton (N) = kg·m/s²', courseId: '2', topicId: 't6', type: 'formula', description: 'Newton ikinci yasa formülü', tags: ['kuvvet', 'newton'], color: '#EF4444', isFavorite: true, isArchived: false, createdAt: '2024-01-09', updatedAt: '2024-01-13', linkedNoteIds: [], fileIds: [] },
  { id: 'n4', title: 'Hücre Organelleri', content: 'Mitokondri: Enerji üretimi\nRibozom: Protein sentezi\nLizozom: Sindirim\nGolgi: Paketleme ve salgılama', courseId: '4', topicId: 't11', type: 'text', description: 'Hücre organelleri ve görevleri', tags: ['hücre', 'organeller'], color: '#8B5CF6', isFavorite: false, isArchived: false, createdAt: '2024-01-11', updatedAt: '2024-01-15', linkedNoteIds: [], fileIds: [] },
];

const defaultHomeworks: Homework[] = [
  { id: 'h1', title: 'Fonksiyon Problemleri', description: 'Sayfa 45-48 arası alıştırmalar', courseId: '1', topicId: 't1', dueDate: '2024-01-20', dueTime: '23:59', priority: 'high', status: 'pending', completedAt: null, fileIds: [], notes: '', createdAt: '2024-01-15' },
  { id: 'h2', title: 'Kuvvet ve Hareket Deney Raporu', description: 'Laboratuvar raporu yazımı', courseId: '2', topicId: 't6', dueDate: '2024-01-18', dueTime: '17:00', priority: 'medium', status: 'pending', completedAt: null, fileIds: [], notes: '', createdAt: '2024-01-12' },
  { id: 'h3', title: 'Periyodik Tablo Çalışması', description: 'Element kartları hazırlama', courseId: '3', topicId: 't10', dueDate: '2024-01-22', dueTime: '23:59', priority: 'low', status: 'pending', completedAt: null, fileIds: [], notes: '', createdAt: '2024-01-14' },
  { id: 'h4', title: 'Türev Alıştırmaları', description: 'Zincir kuralı uygulamaları', courseId: '1', topicId: 't3', dueDate: '2024-01-16', dueTime: '23:59', priority: 'high', status: 'pending', completedAt: null, fileIds: [], notes: '', createdAt: '2024-01-10' },
];

const defaultTasks: Task[] = [
  { id: 'tk1', title: 'Matematik çalışma - Fonksiyonlar', description: 'Konu tekrarı ve soru çözümü', courseId: '1', topicId: 't1', date: '2024-01-16', time: '14:00', isRecurring: false, priority: 'high', status: 'pending', completedAt: null, createdAt: '2024-01-15' },
  { id: 'tk2', title: 'Fizik deney raporu tamamla', description: 'Laboratuvar sonuçlarını yaz', courseId: '2', topicId: 't6', date: '2024-01-16', time: '16:00', isRecurring: false, priority: 'medium', status: 'pending', completedAt: null, createdAt: '2024-01-14' },
  { id: 'tk3', title: 'İngilizce kelime tekrarı', description: '50 yeni kelime çalış', courseId: '7', topicId: 't18', date: '2024-01-16', time: '10:00', isRecurring: true, priority: 'low', status: 'completed', completedAt: '2024-01-16', createdAt: '2024-01-15' },
  { id: 'tk4', title: 'Tarih özet çıkar', description: 'Osmanlı kuruluş dönemi özeti', courseId: '6', topicId: 't15', date: '2024-01-17', time: '11:00', isRecurring: false, priority: 'medium', status: 'pending', completedAt: null, createdAt: '2024-01-15' },
  { id: 'tk5', title: 'Biyoloji sunum hazırla', description: 'Hücre bölünmesi sunumu', courseId: '4', topicId: 't11', date: '2024-01-18', time: '09:00', isRecurring: false, priority: 'high', status: 'pending', completedAt: null, createdAt: '2024-01-14' },
];

const defaultEvents: CalendarEvent[] = [
  { id: 'e1', title: 'Matematik Çalışma', date: '2024-01-16', startTime: '09:00', endTime: '11:00', category: 'study', courseId: '1', color: '#3B82F6', description: 'Fonksiyonlar konu tekrarı' },
  { id: 'e2', title: 'Fizik Laboratuvar', date: '2024-01-16', startTime: '13:00', endTime: '15:00', category: 'study', courseId: '2', color: '#EF4444', description: 'Kuvvet deneyi' },
  { id: 'e3', title: 'Proje Geliştirme', date: '2024-01-16', startTime: '16:00', endTime: '18:00', category: 'project', courseId: '1', color: '#10B981', description: 'Web projesi' },
  { id: 'e4', title: 'Spor', date: '2024-01-16', startTime: '18:30', endTime: '19:30', category: 'sport', courseId: '', color: '#F59E0B', description: 'Koşu' },
  { id: 'e5', title: 'Yemek/Mola', date: '2024-01-16', startTime: '12:00', endTime: '13:00', category: 'break', courseId: '', color: '#6B7280', description: 'Öğle arası' },
];

const defaultFiles: FileItem[] = [
  { id: 'f1', name: 'Fonksiyonlar_Ozet.pdf', type: 'pdf', size: '2.4 MB', courseId: '1', topicId: 't1', uploadedAt: '2024-01-14', updatedAt: '2024-01-14', noteId: null, homeworkId: null },
  { id: 'f2', name: 'Newton_Yasalari.docx', type: 'docx', size: '1.1 MB', courseId: '2', topicId: 't6', uploadedAt: '2024-01-13', updatedAt: '2024-01-13', noteId: 'n3', homeworkId: null },
  { id: 'f3', name: 'Hücre_Diyagramı.png', type: 'image', size: '856 KB', courseId: '4', topicId: 't11', uploadedAt: '2024-01-12', updatedAt: '2024-01-12', noteId: 'n4', homeworkId: null },
  { id: 'f4', name: 'Tarih_Notlari.txt', type: 'txt', size: '45 KB', courseId: '6', topicId: 't15', uploadedAt: '2024-01-11', updatedAt: '2024-01-15', noteId: null, homeworkId: null },
  { id: 'f5', name: 'Sunum_Genetik.pptx', type: 'presentation', size: '5.2 MB', courseId: '4', topicId: 't12', uploadedAt: '2024-01-10', updatedAt: '2024-01-10', noteId: null, homeworkId: null },
];

const defaultPDFs: PDFFile[] = [
  { id: 'p1', name: 'Matematik_Formül_Kitapçığı.pdf', courseId: '1', topicId: 't1', size: '3.2 MB', uploadedAt: '2024-01-10', updatedAt: '2024-01-14', description: 'Tüm formüller', tags: ['formül', 'özet'], isFavorite: true, isArchived: false, linkedNoteIds: ['n1'] },
  { id: 'p2', name: 'Fizik_Deney_Föyü.pdf', courseId: '2', topicId: 't6', size: '1.8 MB', uploadedAt: '2024-01-12', updatedAt: '2024-01-12', description: 'Deney föyleri', tags: ['deney', 'laboratuvar'], isFavorite: false, isArchived: false, linkedNoteIds: ['n3'] },
  { id: 'p3', name: 'Kimya_Periodik_Tablo.pdf', courseId: '3', topicId: 't10', size: '950 KB', uploadedAt: '2024-01-11', updatedAt: '2024-01-11', description: 'Periyodik tablo referansı', tags: ['periyodik', 'element'], isFavorite: true, isArchived: false, linkedNoteIds: [] },
];

const defaultProjects: Project[] = [
  { id: 'pr1', name: 'Bilim Fuarı Projesi', description: 'Fizik deneyi ve sunum hazırlığı', startDate: '2024-01-01', endDate: '2024-02-15', status: 'active', progress: 45, courseId: '2', topicId: 't6', taskIds: ['tk2'], fileIds: ['f2'], noteIds: ['n3'], createdAt: '2024-01-01' },
  { id: 'pr2', name: 'Matematik Web Sitesi', description: 'Formül ve konu anlatım sitesi', startDate: '2024-01-05', endDate: '2024-01-30', status: 'active', progress: 70, courseId: '1', topicId: 't1', taskIds: [], fileIds: ['f1'], noteIds: ['n1', 'n2'], createdAt: '2024-01-05' },
];

const defaultExams: Exam[] = [
  { id: 'ex1', name: 'Matematik Quiz', courseId: '1', topicId: 't1', date: '2024-01-25', time: '10:00', type: 'quiz', note: 'Fonksiyonlar konusu', result: null, topics: ['t1', 't2'], createdAt: '2024-01-15' },
  { id: 'ex2', name: 'Fizik Vize', courseId: '2', topicId: 't6', date: '2024-02-01', time: '09:00', type: 'midterm', note: 'Mekanik ünitesi', result: null, topics: ['t6', 't7'], createdAt: '2024-01-14' },
];

const defaultNotifications: Notification[] = [
  { id: 'not1', title: 'Ödev Yaklaşıyor', message: 'Türev Alıştırmaları yarın teslim', type: 'homework', isRead: false, createdAt: '2024-01-15', linkTo: 'homework' },
  { id: 'not2', title: 'Sınav Hatırlatması', message: 'Matematik Quiz 9 gün sonra', type: 'exam', isRead: false, createdAt: '2024-01-15', linkTo: 'exams' },
  { id: 'not3', title: 'Görev Hatırlatması', message: 'Fizik deney raporu bugün', type: 'task', isRead: true, createdAt: '2024-01-14', linkTo: 'tasks' },
];

const initialState: AppState = {
  courses: defaultCourses,
  notes: defaultNotes,
  homeworks: defaultHomeworks,
  tasks: defaultTasks,
  calendarEvents: defaultEvents,
  pdfs: defaultPDFs,
  files: defaultFiles,
  projects: defaultProjects,
  exams: defaultExams,
  studySessions: [],
  notifications: defaultNotifications,
  settings: { username: 'Öğrenci', theme: 'dark', notifications: true, storageUsed: 4.2, storageTotal: 10 },
  currentPage: 'dashboard',
  selectedCourseId: null,
  selectedTopicId: null,
  searchOpen: false,
  sidebarCollapsed: false,
  currentUser: null,
  isAuthenticated: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PAGE': return { ...state, currentPage: action.payload };
    case 'SET_SELECTED_COURSE': return { ...state, selectedCourseId: action.payload };
    case 'SET_SELECTED_TOPIC': return { ...state, selectedTopicId: action.payload };
    case 'TOGGLE_SEARCH': return { ...state, searchOpen: !state.searchOpen };
    case 'TOGGLE_SIDEBAR': return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'ADD_COURSE': return { ...state, courses: [...state.courses, action.payload] };
    case 'UPDATE_COURSE': return { ...state, courses: state.courses.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_COURSE': return { ...state, courses: state.courses.filter(c => c.id !== action.payload) };
    case 'ADD_TOPIC': return { ...state, courses: state.courses.map(c => c.id === action.payload.courseId ? { ...c, topics: [...c.topics, action.payload.topic] } : c) };
    case 'DELETE_TOPIC': return { ...state, courses: state.courses.map(c => c.id === action.payload.courseId ? { ...c, topics: c.topics.filter(t => t.id !== action.payload.topicId) } : c) };
    case 'ADD_NOTE': return { ...state, notes: [...state.notes, action.payload] };
    case 'UPDATE_NOTE': return { ...state, notes: state.notes.map(n => n.id === action.payload.id ? action.payload : n) };
    case 'DELETE_NOTE': return { ...state, notes: state.notes.filter(n => n.id !== action.payload) };
    case 'ADD_HOMEWORK': return { ...state, homeworks: [...state.homeworks, action.payload] };
    case 'UPDATE_HOMEWORK': return { ...state, homeworks: state.homeworks.map(h => h.id === action.payload.id ? action.payload : h) };
    case 'DELETE_HOMEWORK': return { ...state, homeworks: state.homeworks.filter(h => h.id !== action.payload) };
    case 'ADD_TASK': return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK': return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TASK': return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'ADD_EVENT': return { ...state, calendarEvents: [...state.calendarEvents, action.payload] };
    case 'UPDATE_EVENT': return { ...state, calendarEvents: state.calendarEvents.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'DELETE_EVENT': return { ...state, calendarEvents: state.calendarEvents.filter(e => e.id !== action.payload) };
    case 'ADD_PDF': return { ...state, pdfs: [...state.pdfs, action.payload] };
    case 'DELETE_PDF': return { ...state, pdfs: state.pdfs.filter(p => p.id !== action.payload) };
    case 'ADD_FILE': return { ...state, files: [...state.files, action.payload] };
    case 'DELETE_FILE': return { ...state, files: state.files.filter(f => f.id !== action.payload) };
    case 'ADD_PROJECT': return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT': return { ...state, projects: state.projects.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PROJECT': return { ...state, projects: state.projects.filter(p => p.id !== action.payload) };
    case 'ADD_EXAM': return { ...state, exams: [...state.exams, action.payload] };
    case 'DELETE_EXAM': return { ...state, exams: state.exams.filter(e => e.id !== action.payload) };
    case 'ADD_STUDY_SESSION': return { ...state, studySessions: [...state.studySessions, action.payload] };
    case 'ADD_NOTIFICATION': return { ...state, notifications: [...state.notifications, action.payload] };
    case 'MARK_NOTIFICATION_READ': return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, isRead: true } : n) };
    case 'UPDATE_SETTINGS': return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'LOAD_STATE': return { ...state, ...action.payload };
    case 'SET_USER': return { ...state, currentUser: action.payload, isAuthenticated: action.payload !== null, settings: action.payload ? { ...state.settings, username: `${action.payload.firstName} ${action.payload.lastName}` } : state.settings };
    case 'UPDATE_USER': return { ...state, currentUser: state.currentUser ? { ...state.currentUser, ...action.payload } : null };
    default: return state;
  }
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem('studyhub_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      } catch (e) { /* ignore */ }
    }
    // Load current user
    const user = getCurrentUser();
    if (user) {
      dispatch({ type: 'SET_USER', payload: user });
    }
  }, []);

  useEffect(() => {
    const saveable = {
      courses: state.courses,
      notes: state.notes,
      homeworks: state.homeworks,
      tasks: state.tasks,
      calendarEvents: state.calendarEvents,
      pdfs: state.pdfs,
      files: state.files,
      projects: state.projects,
      exams: state.exams,
      studySessions: state.studySessions,
      notifications: state.notifications,
      settings: state.settings,
    };
    localStorage.setItem('studyhub_state', JSON.stringify(saveable));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { uuidv4 };
