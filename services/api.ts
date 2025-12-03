import { mockDb } from './mockDb';
import { User, UserRole, PreferenceOption, Group, SectionUpload, ChatMessage } from '../types';

const SESSION_KEY = 'edugroup_session_user';

export const api = {
  // --- Auth ---
  async getCurrentUser(): Promise<User | null> {
    const json = localStorage.getItem(SESSION_KEY);
    return json ? JSON.parse(json) : null;
  },

  async register(name: string, email: string, password: string, role: UserRole): Promise<void> {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 500));
    const user = mockDb.register(name, email, password, role);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },

  async login(email: string, password: string): Promise<User> {
    await new Promise(r => setTimeout(r, 500));
    const user = mockDb.login(email, password);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(SESSION_KEY);
  },

  // --- Options ---
  async getOptions(): Promise<PreferenceOption[]> {
     await new Promise(r => setTimeout(r, 200));
     return mockDb.getOptions();
  },

  async updateOption(id: number, title: string, description: string) {
    mockDb.updateOption(id, title, description);
  },

  async getOptionStats(optionId: number) {
    return mockDb.getOptionStats(optionId);
  },

  // --- Group Logic ---
  async getGroupForStudent(studentId: string) {
    return mockDb.getGroupForStudent(studentId);
  },

  async getAllGroups() {
    return mockDb.getAllGroups();
  },

  async getStudent(studentId: string) {
    return mockDb.getStudent(studentId);
  },

  async joinGroup(studentId: string, optionId: number) {
    await new Promise(r => setTimeout(r, 500));
    const group = mockDb.joinGroup(studentId, optionId);
    
    // Update session user to reflect lock if it's the current user
    const currentUser = await this.getCurrentUser();
    if (currentUser && currentUser.id === studentId) {
        currentUser.preferencesLocked = true;
        localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    }
  },

  async updateGroupName(groupId: string, name: string) {
    mockDb.updateGroupName(groupId, name);
  },

  // --- Uploads ---
  async getUploadsForStudent(studentId: string) {
    return mockDb.getUploadsForStudent(studentId);
  },

  async getAllUploads() {
    return mockDb.getAllUploads();
  },

  async uploadFile(studentId: string, sectionId: number, fileName: string) {
     await new Promise(r => setTimeout(r, 500));
     mockDb.uploadFile(studentId, sectionId, fileName);
  },

  async deleteUpload(studentId: string, sectionId: number) {
    mockDb.deleteUpload(studentId, sectionId);
  },

  async addRemark(studentId: string, sectionId: number, remark: string) {
    mockDb.addRemark(studentId, sectionId, remark);
  },

  // --- Chat ---
  async sendMessage(groupId: string, userId: string, userName: string, message: string) {
    mockDb.sendMessage(groupId, userId, userName, message);
  },

  async getGroupChat(groupId: string) {
    return mockDb.getGroupChat(groupId);
  }
};