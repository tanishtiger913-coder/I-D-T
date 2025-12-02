import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockDb } from '../../services/mockDb';
import { Group, PROJECT_SECTIONS, SectionUpload, User, UserRole } from '../../types';
import { ChatBox } from '../../components/ChatBox';
import { Users, Upload, FileText, Lock, Edit2, Check, Trash2, Clock, AlertCircle, Menu, X, MessageSquare } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | undefined>();
  const [members, setMembers] = useState<User[]>([]);
  const [uploads, setUploads] = useState<SectionUpload[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempGroupName, setTempGroupName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch data
  const loadData = () => {
    if (user) {
      const g = mockDb.getGroupForStudent(user.id);
      setGroup(g);
      if (g) {
        setTempGroupName(g.name);
        // Get members
        const mems = g.memberIds.map(id => mockDb.getStudent(id)).filter((u): u is User => !!u);
        setMembers(mems);
        // Get uploads
        setUploads(mockDb.getUploadsForStudent(user.id));
      }
    }
  };

  useEffect(() => {
    loadData();
    // Poll for updates (e.g. if someone else joins or renames)
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const handleFileUpload = (sectionId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user && group) {
      mockDb.uploadFile(user.id, sectionId, file.name);
      loadData();
    }
  };

  const handleRemoveFile = (e: React.MouseEvent, sectionId: number) => {
    e.stopPropagation();
    // Simple confirmation dialog
    if (user && window.confirm("Are you sure you want to delete this file? This cannot be undone.")) {
        mockDb.deleteUpload(user.id, sectionId);
        // Force immediate reload to update UI
        setTimeout(loadData, 50);
    }
  };

  const saveGroupName = () => {
    if (group && tempGroupName.trim()) {
      try {
        mockDb.updateGroupName(group.id, tempGroupName);
        setIsEditingName(false);
        loadData();
      } catch (err) {
        alert("Could not update name");
      }
    }
  };

  if (!group || !user) return (
    <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  const actualUploadCount = uploads.filter(u => u.fileName && u.fileName.length > 0).length;
  const completionPercentage = Math.round((actualUploadCount / PROJECT_SECTIONS.length) * 100);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-5rem)] -mx-4 sm:-mx-6 lg:-mx-8 -my-8 bg-gray-50">
      
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden p-4 bg-white border-b border-gray-200 flex justify-between items-center sticky top-0 z-20">
         <span className="font-semibold text-gray-700">Team Menu</span>
         <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-gray-100 rounded-md">
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
         </button>
      </div>

      {/* Sidebar - Fixed on Desktop, Drawer on Mobile */}
      <aside className={`
          fixed lg:sticky lg:top-[4rem] inset-y-0 left-0 z-30 w-full sm:w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:transform-none lg:h-[calc(100vh-4rem)] overflow-y-auto
          ${isSidebarOpen ? 'translate-x-0 pt-[4rem] lg:pt-0' : '-translate-x-full lg:translate-x-0'}
      `}>
          {/* Close button for mobile inside sidebar */}
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="p-6 space-y-8">
              {/* Group Info Section */}
              <div>
                   <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                            Batch {group.batchNumber}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            Option {group.optionId}
                        </span>
                        {group.isLocked ? (
                            <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                                <Lock className="h-3 w-3 mr-1" /> Full
                            </span>
                        ) : (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                <Clock className="h-3 w-3 mr-1" /> Open
                            </span>
                        )}
                   </div>

                   {isEditingName ? (
                        <div className="flex items-center mt-2">
                            <input 
                                className="w-full border-b-2 border-primary bg-transparent text-lg font-bold text-gray-900 focus:outline-none py-1"
                                value={tempGroupName}
                                onChange={(e) => setTempGroupName(e.target.value)}
                                autoFocus
                            />
                            <button onClick={saveGroupName} className="ml-2 p-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition">
                                <Check className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-start justify-between mt-2 group">
                            <h2 className="text-xl font-bold text-gray-900 leading-snug">{group.name}</h2>
                            {!group.isLocked && (
                                <button 
                                    onClick={() => setIsEditingName(true)} 
                                    className="opacity-0 group-hover:opacity-100 transition p-1 text-gray-400 hover:text-primary"
                                    title="Rename Group"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    )}
              </div>

              {/* Team Members List */}
              <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                      <Users className="h-4 w-4 mr-2" /> Team Members
                  </h3>
                  <div className="space-y-3">
                      {members.map(m => (
                          <div key={m.id} className="flex items-center justify-between group bg-gray-50 p-2 rounded-lg border border-gray-100">
                              <div className="flex items-center">
                                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 border-2 ${m.id === user.id ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white text-gray-500 border-gray-200'}`}>
                                      {m.name.charAt(0)}
                                  </div>
                                  <div className="flex flex-col">
                                      <span className={`text-sm font-medium ${m.id === user.id ? 'text-gray-900' : 'text-gray-600'}`}>
                                          {m.name}
                                      </span>
                                      {m.id === user.id && <span className="text-[10px] text-primary">You</span>}
                                  </div>
                              </div>
                          </div>
                      ))}
                      {Array.from({ length: 6 - members.length }).map((_, i) => (
                          <div key={`empty-${i}`} className="flex items-center text-sm text-gray-400 p-2 italic border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                              <div className="h-8 w-8 rounded-full bg-gray-100 mr-3"></div>
                              Waiting for member...
                          </div>
                      ))}
                  </div>
              </div>

              {/* Chat Section in Sidebar */}
              <div className="flex-1 flex flex-col">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" /> Team Chat
                  </h3>
                  <ChatBox 
                        groupId={group.id} 
                        currentUserId={user.id} 
                        currentUserName={user.name} 
                        currentUserRole={UserRole.STUDENT} 
                        className="flex-grow min-h-[400px] shadow-sm border-gray-200"
                    />
              </div>
          </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 w-full overflow-hidden">
         {/* Header */}
         <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 pb-6">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Project Workspace</h1>
                <p className="text-gray-500 mt-2">Manage your weekly submissions and view feedback.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm w-full sm:w-auto">
                <div className="flex flex-col items-end min-w-[120px]">
                    <span className="text-xs font-medium text-gray-500 uppercase">Total Progress</span>
                    <div className="flex items-baseline gap-1">
                         <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
                         <span className="text-sm text-gray-400">/ 100%</span>
                    </div>
                </div>
                <div className="w-2 bg-gray-100 rounded-full h-10 overflow-hidden">
                    <div 
                        className="w-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                        style={{ height: `${completionPercentage}%`, marginTop: `${100 - completionPercentage}%` }}
                    />
                </div>
            </div>
        </div>

        {/* Project Sections Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {PROJECT_SECTIONS.map((section) => {
                const existingUpload = uploads.find(u => u.sectionId === section.id);
                const hasFile = existingUpload && existingUpload.fileName && existingUpload.fileName.length > 0;
                
                return (
                    <div key={section.id} className={`group relative bg-white rounded-xl border transition-all duration-300 ${hasFile ? 'border-green-200 shadow-sm hover:shadow-md' : 'border-gray-200 hover:border-primary/50 hover:shadow-md'}`}>
                        {/* Card Header */}
                        <div className={`px-5 py-4 border-b flex justify-between items-center ${hasFile ? 'bg-green-50/50 border-green-100' : 'bg-gray-50/50 border-gray-100'}`}>
                            <h3 className={`font-semibold ${hasFile ? 'text-green-800' : 'text-gray-700'}`}>{section.label}</h3>
                            {hasFile ? (
                                <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                    <Check className="h-3 w-3 mr-1" /> Submitted
                                </span>
                            ) : (
                                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                    Pending
                                </span>
                            )}
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex flex-col h-full justify-between min-h-[160px]">
                            <div>
                                {hasFile ? (
                                    <div className="flex items-start p-3 bg-white border border-gray-100 rounded-lg shadow-sm mb-4 group-hover:border-green-200 transition-colors">
                                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg mr-3 shrink-0">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0 overflow-hidden mr-2">
                                            <p className="text-sm font-medium text-gray-900 truncate" title={existingUpload?.fileName}>
                                                {existingUpload?.fileName}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {existingUpload?.uploadedAt ? new Date(existingUpload.uploadedAt).toLocaleDateString() : 'Just now'}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={(e) => handleRemoveFile(e, section.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition shrink-0"
                                            title="Delete Submission"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center mb-4">
                                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 transition-colors group-hover:border-primary/30 bg-gray-50/30 hover:bg-primary/5 cursor-pointer">
                                            <div className="bg-white p-3 rounded-full shadow-sm w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                                                <Upload className="h-6 w-6 text-gray-400 group-hover:text-primary transition" />
                                            </div>
                                            <label className="relative cursor-pointer block inset-0 w-full h-full">
                                                <span className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-primary transition">Click to upload</span>
                                                <span className="block text-xs text-gray-400">PDF or Image (Max 5MB)</span>
                                                <input 
                                                    type="file" 
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                                    accept=".pdf,image/*"
                                                    onChange={(e) => handleFileUpload(section.id, e)}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Admin Remarks Display */}
                            {existingUpload?.remark && existingUpload.remark.trim() !== "" && (
                                <div className="mt-auto relative bg-yellow-50 rounded-lg p-3 pl-4 border-l-4 border-yellow-400 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-center mb-1">
                                        <AlertCircle className="h-3 w-3 text-yellow-600 mr-1.5" />
                                        <span className="text-xs font-bold text-yellow-700 uppercase tracking-wide">Teacher's Remark</span>
                                    </div>
                                    <p className="text-sm text-yellow-900 leading-relaxed italic">"{existingUpload.remark}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
      </main>
    </div>
  );
};