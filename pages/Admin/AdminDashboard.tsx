import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Group, PreferenceOption, PROJECT_SECTIONS, SectionUpload, User, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ChatBox } from '../../components/ChatBox';
import { Users, MessageSquare, FileText, Settings, Search, Edit, ChevronRight, BarChart3, Clock, AlertCircle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'groups' | 'options'>('groups');
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [studentsInGroup, setStudentsInGroup] = useState<User[]>([]);
  const [groupUploads, setGroupUploads] = useState<SectionUpload[]>([]);
  const { user } = useAuth();

  // For Options Editing
  const [options, setOptions] = useState<PreferenceOption[]>([]);
  const [editOptionId, setEditOptionId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Remark State
  const [remarkText, setRemarkText] = useState<{ [key: string]: string }>({});

  const refreshData = async () => {
    try {
        const g = await api.getAllGroups();
        setGroups(g);
        const o = await api.getOptions();
        setOptions(o);
        if (selectedGroup) {
            loadGroupDetails(selectedGroup);
        }
    } catch (err) {
        console.error("Failed to load admin data", err);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000); 
    return () => clearInterval(interval);
  }, []); 

  const loadGroupDetails = async (group: Group) => {
    setSelectedGroup(group);
    
    // Get members
    const memsPromises = group.memberIds.map(id => api.getStudent(id));
    const memsResults = await Promise.all(memsPromises);
    const members = memsResults.filter((u): u is User => !!u);
    setStudentsInGroup(members);
    
    // Get Uploads
    const allUploads = await api.getAllUploads();
    const relevantUploads = allUploads.filter(u => group.memberIds.includes(u.studentId));
    setGroupUploads(relevantUploads);
  };

  const handleSaveRemark = async (studentId: string, sectionId: number) => {
    const key = `${studentId}-${sectionId}`;
    if (remarkText[key]) {
      await api.addRemark(studentId, sectionId, remarkText[key]);
      refreshData();
      alert('Remark saved');
    }
  };

  const handleUpdateOption = async (id: number) => {
    await api.updateOption(id, editTitle, editDesc);
    setEditOptionId(null);
    refreshData();
  };

  const startEditOption = (opt: PreferenceOption) => {
    setEditOptionId(opt.id);
    setEditTitle(opt.title);
    setEditDesc(opt.description);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'groups' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
            Group Monitor
            </button>
            <button
            onClick={() => setActiveTab('options')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'options' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
            Manage Topics
            </button>
        </div>
      </div>

      {activeTab === 'groups' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          {/* Groups Sidebar */}
          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl flex flex-col shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">All Groups</h3>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{groups.length}</span>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-2">
              {groups.map(g => (
                <button 
                  key={g.id}
                  onClick={() => loadGroupDetails(g)}
                  className={`w-full text-left p-3 rounded-lg transition-all border ${
                      selectedGroup?.id === g.id 
                      ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/30' 
                      : 'bg-white border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-bold truncate ${selectedGroup?.id === g.id ? 'text-primary' : 'text-gray-800'}`}>
                        {g.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-2">
                         <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 rounded">B{g.batchNumber}</span>
                         <span className="text-[10px] text-gray-500">Opt {g.optionId}</span>
                     </div>
                     <span className={`text-[10px] font-medium ${g.isLocked ? 'text-red-500' : 'text-green-600'}`}>
                        {g.memberIds.length}/6
                     </span>
                  </div>
                </button>
              ))}
              {groups.length === 0 && (
                <div className="text-center py-8 px-4 text-gray-400">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No groups formed yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 flex flex-col gap-6 overflow-y-auto pr-2">
            {selectedGroup ? (
              <>
                {/* Header Stats */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{selectedGroup.name}</h2>
                            <p className="text-sm text-gray-500 mt-1">Batch {selectedGroup.batchNumber} • Topic {selectedGroup.optionId}</p>
                        </div>
                        <div className="flex gap-3">
                             <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg flex flex-col items-center">
                                 <span className="text-xs font-semibold uppercase">Files</span>
                                 <span className="text-xl font-bold">{groupUploads.filter(u => u.fileName).length}</span>
                             </div>
                             <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg flex flex-col items-center">
                                 <span className="text-xs font-semibold uppercase">Students</span>
                                 <span className="text-xl font-bold">{studentsInGroup.length}</span>
                             </div>
                        </div>
                    </div>

                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2" /> Performance Tracker
                    </h3>
                    
                    <div className="overflow-x-auto border rounded-lg border-gray-200">
                        <table className="min-w-full text-sm text-left divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-700 w-48 sticky left-0 bg-gray-50 border-r border-gray-200">Student</th>
                                    {PROJECT_SECTIONS.map(s => <th key={s.id} className="px-4 py-3 font-semibold text-gray-700 min-w-[180px]">{s.label}</th>)}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {studentsInGroup.map(student => (
                                    <tr key={student.id} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-4 font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-200 group-hover:bg-gray-50">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mr-3">
                                                    {student.name.charAt(0)}
                                                </div>
                                                {student.name}
                                            </div>
                                        </td>
                                        {PROJECT_SECTIONS.map(section => {
                                            const upload = groupUploads.find(u => u.studentId === student.id && u.sectionId === section.id);
                                            const hasFile = upload && upload.fileName;
                                            const key = `${student.id}-${section.id}`;
                                            
                                            return (
                                                <td key={section.id} className="px-4 py-4 align-top">
                                                    <div className="space-y-2">
                                                        {hasFile ? (
                                                            <div className="flex items-center justify-between bg-green-50 px-2 py-1.5 rounded border border-green-100">
                                                                <a href="#" className="text-green-700 hover:underline text-xs font-medium flex items-center truncate max-w-[100px]">
                                                                    <FileText className="h-3 w-3 mr-1 flex-shrink-0" /> {upload.fileName}
                                                                </a>
                                                                <span className="text-[10px] text-green-600">{new Date(upload.uploadedAt).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center h-[32px] border-2 border-dashed border-gray-100 rounded bg-gray-50/50">
                                                                <span className="text-gray-300 text-xs">Pending</span>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Remark Input */}
                                                        <div className="flex flex-col gap-1.5 pt-1">
                                                            <textarea
                                                                className="text-xs border border-gray-300 rounded p-1.5 w-full focus:ring-1 focus:ring-primary focus:border-primary outline-none transition bg-white"
                                                                placeholder={upload?.remark ? "Update remark..." : "Add remark..."}
                                                                rows={upload?.remark ? 2 : 1}
                                                                defaultValue={upload?.remark || ''}
                                                                onChange={(e) => setRemarkText(prev => ({ ...prev, [key]: e.target.value }))}
                                                            />
                                                            <button 
                                                                onClick={() => handleSaveRemark(student.id, section.id)}
                                                                className="text-[10px] bg-gray-800 hover:bg-black text-white py-1 px-2 rounded self-start transition opacity-80 hover:opacity-100"
                                                            >
                                                                Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Group Chat Monitor */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col flex-grow">
                     <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" /> Live Chat Monitor
                    </h3>
                    <ChatBox 
                        groupId={selectedGroup.id}
                        currentUserId={user?.id || 'admin'}
                        currentUserName="Admin"
                        currentUserRole={UserRole.ADMIN}
                        className="h-[400px] border-gray-200"
                    />
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="text-center text-gray-400 p-12">
                      <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 opacity-50 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Select a Group</h3>
                      <p className="max-w-sm mx-auto">Click on a group from the sidebar to view their progress, submissions, and chat activity.</p>
                  </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'options' && (
        <div className="flex-1 overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                {options.map(opt => (
                    <div key={opt.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        {editOptionId === opt.id ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                                    <input 
                                        className="w-full border border-gray-300 p-2 rounded mt-1 focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
                                        value={editTitle} 
                                        onChange={e => setEditTitle(e.target.value)} 
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                    <textarea 
                                        className="w-full border border-gray-300 p-2 rounded mt-1 h-32 focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
                                        value={editDesc} 
                                        onChange={e => setEditDesc(e.target.value)} 
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button onClick={() => setEditOptionId(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                    <button onClick={() => handleUpdateOption(opt.id)} className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-indigo-700">Save Changes</button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">Option {opt.id}</span>
                                    <button onClick={() => startEditOption(opt)} className="text-gray-400 hover:text-primary p-1 rounded hover:bg-indigo-50 transition">
                                        <Edit className="h-4 w-4" />
                                    </button>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{opt.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed flex-grow">{opt.description}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};