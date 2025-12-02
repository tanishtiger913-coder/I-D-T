import { User, UserRole, PreferenceOption, Group, SectionUpload, ChatMessage } from '../types';

const STORAGE_KEYS = {
  USERS: 'edugroup_users',
  GROUPS: 'edugroup_groups',
  OPTIONS: 'edugroup_options',
  UPLOADS: 'edugroup_uploads',
  CHATS: 'edugroup_chats',
  CURRENT_USER: 'edugroup_current_user',
};

// Initial Options
const INITIAL_OPTIONS: PreferenceOption[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: `Research Topic ${i + 1}`,
  description: `Focus area covering specific aspects of topic ${i + 1}.`,
}));

class MockDB {
  private users: User[] = [];
  private groups: Group[] = [];
  private options: PreferenceOption[] = [];
  private uploads: SectionUpload[] = [];
  private chats: ChatMessage[] = [];

  constructor() {
    this.load();
  }

  private load() {
    this.users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    this.groups = JSON.parse(localStorage.getItem(STORAGE_KEYS.GROUPS) || '[]');
    this.options = JSON.parse(localStorage.getItem(STORAGE_KEYS.OPTIONS) || JSON.stringify(INITIAL_OPTIONS));
    this.uploads = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPLOADS) || '[]');
    this.chats = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS) || '[]');
  }

  private save() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(this.groups));
    localStorage.setItem(STORAGE_KEYS.OPTIONS, JSON.stringify(this.options));
    localStorage.setItem(STORAGE_KEYS.UPLOADS, JSON.stringify(this.uploads));
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(this.chats));
  }

  // --- Auth ---
  register(name: string, email: string, password: string, role: UserRole): User {
    if (this.users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }
    // Validation changed from "admin" to "seacet"
    if (role === UserRole.ADMIN && !email.toLowerCase().includes('seacet')) {
      throw new Error('Admin email must contain "seacet"');
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password, // In real app, hash this
      role,
      preferencesLocked: false,
    };
    this.users.push(newUser);
    this.save();
    return newUser;
  }

  login(email: string, password: string): User {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid credentials');
    return user;
  }

  // --- Options ---
  getOptions(): PreferenceOption[] {
    return this.options;
  }

  updateOption(id: number, title: string, description: string) {
    const idx = this.options.findIndex(o => o.id === id);
    if (idx !== -1) {
      this.options[idx] = { id, title, description };
      this.save();
    }
  }

  // New helper for availability
  getOptionStats(optionId: number): { available: boolean, batch: number, remaining: number } {
    for (let batch = 1; batch <= 4; batch++) {
        const group = this.groups.find(g => g.batchNumber === batch && g.optionId === optionId);
        if (!group) {
            // Group doesn't exist, so it's empty (6 slots)
            return { available: true, batch, remaining: 6 };
        }
        if (group.memberIds.length < 6) {
            return { available: true, batch, remaining: 6 - group.memberIds.length };
        }
    }
    // All batches full
    return { available: false, batch: 4, remaining: 0 };
  }

  // --- Group Logic ---
  getGroupForStudent(studentId: string): Group | undefined {
    return this.groups.find(g => g.memberIds.includes(studentId));
  }

  getAllGroups(): Group[] {
    return this.groups;
  }

  getStudent(studentId: string): User | undefined {
    return this.users.find(u => u.id === studentId);
  }

  getAllStudents(): User[] {
    return this.users.filter(u => u.role === UserRole.STUDENT);
  }

  joinGroup(studentId: string, optionId: number): Group {
    const user = this.users.find(u => u.id === studentId);
    if (!user) throw new Error('User not found');
    if (user.preferencesLocked) throw new Error('You have already joined a group.');

    // Find available batch
    let targetGroup: Group | undefined;

    for (let batch = 1; batch <= 4; batch++) {
      // Find existing group for this batch & option
      let group = this.groups.find(g => g.batchNumber === batch && g.optionId === optionId);

      if (!group) {
        // Create new group if it doesn't exist for this batch
        group = {
          id: Math.random().toString(36).substr(2, 9),
          batchNumber: batch,
          optionId,
          name: `Group ${optionId}-B${batch}`,
          memberIds: [],
          isLocked: false,
        };
        this.groups.push(group);
      }

      if (group.memberIds.length < 6) {
        targetGroup = group;
        break; 
      }
    }

    if (!targetGroup) {
      throw new Error('All batches for this option are full (Max 48 groups reached).');
    }

    // Add student
    targetGroup.memberIds.push(studentId);
    if (targetGroup.memberIds.length >= 6) {
      targetGroup.isLocked = true;
    }
    
    // Update user lock status
    user.preferencesLocked = true;
    
    this.save();
    return targetGroup;
  }

  updateGroupName(groupId: string, newName: string) {
    const group = this.groups.find(g => g.id === groupId);
    if (!group) throw new Error('Group not found');
    if (group.isLocked) throw new Error('Cannot rename a locked group (6 members reached).');
    
    group.name = newName;
    this.save();
  }

  // --- Uploads ---
  uploadFile(studentId: string, sectionId: number, fileName: string) {
    // Check if entry exists (e.g. from a remark)
    const existingIndex = this.uploads.findIndex(u => u.studentId === studentId && u.sectionId === sectionId);
    
    if (existingIndex !== -1) {
        // Update existing entry (preserves remark)
        this.uploads[existingIndex].fileName = fileName;
        this.uploads[existingIndex].fileUrl = '#'; // Mock URL
        this.uploads[existingIndex].uploadedAt = new Date().toISOString();
    } else {
        // Create new entry
        this.uploads.push({
            studentId,
            sectionId,
            fileName,
            fileUrl: '#', // Simulating URL
            uploadedAt: new Date().toISOString(),
        });
    }
    this.save();
  }

  deleteUpload(studentId: string, sectionId: number) {
    // Force reload just in case
    this.load();
    const index = this.uploads.findIndex(u => u.studentId === studentId && u.sectionId === sectionId);
    
    if (index !== -1) {
        const upload = this.uploads[index];
        // If there is a remark, we perform a "Soft Delete" (keep remark, clear file)
        if (upload.remark && upload.remark.trim().length > 0) {
            upload.fileName = '';
            upload.fileUrl = '';
            upload.uploadedAt = ''; 
        } else {
            // Hard Delete (remove entire entry)
            this.uploads.splice(index, 1);
        }
        this.save();
    }
  }

  addRemark(studentId: string, sectionId: number, remark: string) {
    const upload = this.uploads.find(u => u.studentId === studentId && u.sectionId === sectionId);
    if (upload) {
      upload.remark = remark;
      this.save();
    } else {
        // Create an empty entry if comment added before upload
        this.uploads.push({
            studentId,
            sectionId,
            fileName: '',
            fileUrl: '',
            uploadedAt: '',
            remark
        });
        this.save();
    }
  }

  getUploadsForStudent(studentId: string): SectionUpload[] {
    return this.uploads.filter(u => u.studentId === studentId);
  }

  getAllUploads(): SectionUpload[] {
    return this.uploads;
  }

  // --- Chat ---
  sendMessage(groupId: string, userId: string, userName: string, message: string) {
    this.chats.push({
      id: Math.random().toString(36).substr(2, 9),
      groupId,
      userId,
      userName,
      message,
      timestamp: Date.now(),
    });
    this.save();
  }

  getGroupChat(groupId: string): ChatMessage[] {
    return this.chats.filter(c => c.groupId === groupId).sort((a, b) => a.timestamp - b.timestamp);
  }
}

export const mockDb = new MockDB();