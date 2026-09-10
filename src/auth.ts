import { User, ClassCode, Grade, Section } from './types';

// SHA-256 hash function using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// All valid class codes
export const ALL_CLASS_CODES: ClassCode[] = [];
const grades: Grade[] = ['9', '10', '11', '12'];
const sections: Section[] = ['A', 'B', 'C', 'D', 'E'];
grades.forEach(g => sections.forEach(s => ALL_CLASS_CODES.push(`${g}${s}` as ClassCode)));

// Get users from localStorage
export function getUsers(): User[] {
  const data = localStorage.getItem('studyhub_users');
  return data ? JSON.parse(data) : [];
}

// Save users to localStorage
export function saveUsers(users: User[]): void {
  localStorage.setItem('studyhub_users', JSON.stringify(users));
}

// Register new user
export async function registerUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  grade: Grade,
  section: Section
): Promise<{ success: boolean; message: string; user?: User }> {
  const users = getUsers();
  
  // Check if email already exists
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: 'Bu e-posta adresi zaten kayıtlı.' };
  }

  const passwordHash = await hashPassword(password);
  const classCode = `${grade}${section}` as ClassCode;
  const avatarColors = ['#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#F97316'];
  
  const newUser: User = {
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
    firstName,
    lastName,
    email,
    passwordHash,
    grade,
    section,
    classCode,
    avatar: avatarColors[Math.floor(Math.random() * avatarColors.length)],
    createdAt: new Date().toISOString(),
    bio: '',
  };

  users.push(newUser);
  saveUsers(users);

  // Add system message to class chat
  addSystemMessage(classCode, `${firstName} ${lastName} sınıfa katıldı!`);

  return { success: true, message: 'Kayıt başarılı!', user: newUser };
}

// Login user
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; message: string; user?: User }> {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return { success: false, message: 'E-posta bulunamadı.' };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { success: false, message: 'Şifre hatalı.' };
  }

  return { success: true, message: 'Giriş başarılı!', user };
}

// Get current logged in user
export function getCurrentUser(): User | null {
  const data = localStorage.getItem('studyhub_current_user');
  return data ? JSON.parse(data) : null;
}

// Set current user
export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem('studyhub_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('studyhub_current_user');
  }
}

// Logout
export function logoutUser(): void {
  localStorage.removeItem('studyhub_current_user');
}

// Update user profile
export function updateUserProfile(userId: string, updates: Partial<User>): User | null {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;
  
  users[idx] = { ...users[idx], ...updates };
  saveUsers(users);
  return users[idx];
}

// Get users in same class
export function getClassmates(classCode: ClassCode): User[] {
  return getUsers().filter(u => u.classCode === classCode);
}

// Chat messages
export function getChatMessages(classCode: ClassCode): any[] {
  const data = localStorage.getItem(`studyhub_chat_${classCode}`);
  return data ? JSON.parse(data) : [];
}

export function saveChatMessages(classCode: ClassCode, messages: any[]): void {
  localStorage.setItem(`studyhub_chat_${classCode}`, JSON.stringify(messages));
}

export function addChatMessage(classCode: ClassCode, userId: string, userName: string, userAvatar: string, content: string): void {
  const messages = getChatMessages(classCode);
  messages.push({
    id: Math.random().toString(36).substr(2, 9),
    classCode,
    userId,
    userName,
    userAvatar,
    content,
    createdAt: new Date().toISOString(),
    type: 'text',
  });
  saveChatMessages(classCode, messages);
}

export function addSystemMessage(classCode: ClassCode, content: string): void {
  const messages = getChatMessages(classCode);
  messages.push({
    id: Math.random().toString(36).substr(2, 9),
    classCode,
    userId: 'system',
    userName: 'Sistem',
    userAvatar: '#6B7280',
    content,
    createdAt: new Date().toISOString(),
    type: 'system',
  });
  saveChatMessages(classCode, messages);
}

// Get all chat groups with member counts
export function getChatGroups(): { classCode: ClassCode; name: string; memberCount: number }[] {
  const users = getUsers();
  return ALL_CLASS_CODES.map(code => {
    const members = users.filter(u => u.classCode === code);
    return {
      classCode: code,
      name: `${code} Sınıf Sohbet`,
      memberCount: members.length,
    };
  });
}
