import React, { useEffect, useState } from 'react';
import { mockDb } from '../../services/mockDb';
import { PreferenceOption } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, ArrowRight, Users, Lock, Info } from 'lucide-react';

export const PreferenceSelection: React.FC = () => {
  const [options, setOptions] = useState<PreferenceOption[]>([]);
  const { user, refreshUser } = useAuth();
  const [error, setError] = useState('');
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<Record<number, { available: boolean; batch: number; remaining: number }>>({});

  useEffect(() => {
    setOptions(mockDb.getOptions());
    
    // Check if user state is out of sync with DB
    if (user) {
      const dbUser = mockDb.getStudent(user.id);
      if (dbUser && dbUser.preferencesLocked && !user.preferencesLocked) {
        // Auto-fix state mismatch
        refreshUser(dbUser);
      }
    }

    // Load availability stats
    const stats: any = {};
    mockDb.getOptions().forEach(opt => {
        stats[opt.id] = mockDb.getOptionStats(opt.id);
    });
    setAvailability(stats);

  }, [user, refreshUser]);

  const handleConfirmJoin = () => {
    if (!selectedOptionId || !user) return;
    
    setLoading(true);
    setError('');

    try {
        // Use a small timeout to allow UI to show loading state
        setTimeout(() => {
            try {
                mockDb.joinGroup(user.id, selectedOptionId);
                // Refresh local user state to reflect locked preferences
                refreshUser({ ...user, preferencesLocked: true });
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
                // If error is "already joined", force refresh
                if (err.message.includes('already joined')) {
                    const dbUser = mockDb.getStudent(user.id);
                    if (dbUser) refreshUser(dbUser);
                }
            }
        }, 500);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getOptionStat = (id: number) => availability[id] || { available: true, batch: 1, remaining: 6 };

  return (
    <div className="max-w-6xl mx-auto py-8 pb-32">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Choose Your Research Path</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select a topic below to join a collaborative group. 
          <br/><span className="text-sm font-medium text-primary bg-primary/5 px-2 py-1 rounded-md mt-2 inline-block">
            Note: Once you join a group, you cannot change it.
          </span>
        </p>
        {error && (
            <div className="mt-6 inline-flex items-center bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-100 shadow-sm max-w-lg">
                <Info className="h-5 w-5 mr-2 flex-shrink-0" />
                {error}
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {options.map((option) => {
          const stats = getOptionStat(option.id);
          const isSelected = selectedOptionId === option.id;
          const isFull = !stats.available;

          return (
            <div 
              key={option.id} 
              className={`
                relative bg-white border rounded-2xl p-6 shadow-sm transition-all duration-300 overflow-hidden
                ${isFull ? 'opacity-60 cursor-not-allowed border-gray-200 bg-gray-50' : 'cursor-pointer hover:shadow-lg hover:-translate-y-1'}
                ${isSelected ? 'ring-2 ring-primary border-primary shadow-primary/20 bg-primary/5' : 'border-gray-200'}
              `}
              onClick={() => !isFull && setSelectedOptionId(option.id)}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-200">
                    <div className="bg-primary text-white rounded-full p-1 shadow-sm">
                        <CheckCircle className="h-5 w-5" />
                    </div>
                </div>
              )}
              
              <div className="mb-4">
                   <div className="flex justify-between items-start mb-3">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-indigo-50 text-primary'}`}>
                            Topic {option.id}
                        </span>
                        {isFull && (
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-600 flex items-center">
                                <Lock className="h-3 w-3 mr-1" /> Full
                            </span>
                        )}
                   </div>
                  <h3 className={`text-xl font-bold mb-2 transition-colors ${isSelected ? 'text-primary' : 'text-gray-900'}`}>{option.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{option.description}</p>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <div className="flex items-center text-xs text-gray-500 font-medium">
                     <Users className="h-4 w-4 mr-1.5 text-gray-400" />
                     {isFull ? (
                         <span>All batches full</span>
                     ) : (
                         <span>Batch {stats.batch}: {stats.remaining} slots left</span>
                     )}
                  </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Bar for Action */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-transform duration-300 z-50 ${selectedOptionId ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-gray-600 text-sm hidden sm:block">
                You have selected <span className="font-bold text-gray-900">Topic {selectedOptionId}</span>.
            </div>
            <div className="flex w-full sm:w-auto gap-3">
                <button 
                    onClick={() => setSelectedOptionId(null)}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleConfirmJoin}
                    disabled={loading}
                    className="flex-1 sm:flex-none px-8 py-3 rounded-lg bg-primary text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center min-w-[160px]"
                >
                    {loading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            Confirm & Join <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};