import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Users } from 'lucide-react';
import facultyIcon from '../../assets/faculty-icon.svg';
import { api } from '../../lib/api';
import { useToast } from '../../lib/ToastContext';
import { useNavigate } from 'react-router-dom';

const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
      <div 
        className="bg-brand-green h-full transition-all duration-1000 ease-out rounded-full"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const ProgressDashboard = () => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cycleInfo, setCycleInfo] = useState(null);
  const { showToast } = useToast();

  const navigate = useNavigate();

  useEffect(() => {
    const loadProgress = async () => {
      setLoading(true);
      try {
        // Find active cycle
        const cycles = await api.evaluationCycles.listAll();
        const active = cycles.find(c => c.is_active) || cycles[0];
        if (!active) {
          setProgressData([]);
          setCycleInfo(null);
          return;
        }

        setCycleInfo({ cycle_id: active.cycle_id, year: active.year });
        const progress = await api.evaluationCycles.getProgress(active.cycle_id);

        // Map to table rows
        const rows = (progress.members || []).map((m, idx) => ({
          id: m.user_id,
          name: m.full_name,
          title: '',
          completed: m.evaluations_completed_count,
          total: 3, // target is 3 completed evaluations for summary generation
          nominations_submitted: m.nominations_submitted,
          nominations_complete: m.nominations_complete,
          missing_nominations: m.missing_nominations,
          approved_nominations: m.approved_nominations || [],
        }));

        setProgressData(rows);
      } catch (err) {
        showToast({ type: 'error', title: 'Load failed', message: err.message || 'Unable to load progress', actionText: 'Dismiss' });
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [showToast]);

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-12 bg-brand-bg min-h-screen">
      <header className="mb-8 lg:mb-12">
        <h1 className="text-4xl lg:text-6xl font-normal text-brand-green mb-2 font-heading">Evaluation Progress</h1>
        <p className="text-brand-grey text-base lg:text-lg">Monitor the real-time status of faculty peer evaluations.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-brand-green" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-black">1</p>
            <p className="text-xs font-semibold text-brand-grey uppercase tracking-wider">Fully Completed</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-black">2</p>
            <p className="text-xs font-semibold text-brand-grey uppercase tracking-wider">In Progress</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
            <Users className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-black">4</p>
            <p className="text-xs font-semibold text-brand-grey uppercase tracking-wider">Total Faculty</p>
          </div>
        </div>
      </div>

      {/* Progress Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-8 py-5 text-sm font-semibold text-brand-black">Faculty Member</th>
              <th className="px-8 py-5 text-sm font-semibold text-brand-black">Evaluators</th>
              <th className="px-8 py-5 text-sm font-semibold text-brand-black">Completion Status</th>
              <th className="px-8 py-5 text-sm font-semibold text-brand-black text-right">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {progressData.map((faculty) => {
              const percentage = (faculty.completed / faculty.total) * 100;
              return (
                <tr key={faculty.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                         <img src={facultyIcon} alt={faculty.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-brand-black truncate text-sm lg:text-base">{faculty.name}</p>
                        <p className="text-xs text-brand-grey font-medium truncate">{faculty.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 align-top">
                    <div className="flex flex-col gap-2">
                      {faculty.approved_nominations.length === 0 && (
                        <div className="text-xs text-brand-grey">No approved evaluators</div>
                      )}
                      {faculty.approved_nominations.map((ev) => (
                        <div key={ev.nomination_id} className="flex items-center gap-3">
                          <span className={`text-sm ${ev.evaluation_completed ? 'text-brand-green font-semibold' : 'text-brand-black'}`}>
                            {ev.evaluator_name}
                          </span>
                          {ev.evaluation_completed ? (
                            <span className="text-xs text-brand-green">(Done)</span>
                          ) : (
                            <span className="text-xs text-brand-grey">(Pending)</span>
                          )}
                        </div>
                      ))}
                      <div className="mt-2 text-xs text-brand-grey">
                        Nominations: {faculty.nominations_submitted}/5 {faculty.nominations_complete ? '' : `• ${faculty.missing_nominations} missing`}
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs font-bold text-brand-grey uppercase tracking-wider">
                        <span>{faculty.completed} of {faculty.total} Evaluations</span>
                        <span className={percentage === 100 ? 'text-brand-green' : 'text-brand-black'}>
                          {Math.round(percentage)}%
                        </span>
                      </div>
                      <ProgressBar progress={percentage} />
                    </div>
                  </td>

                  <td className="px-8 py-6 text-right align-top">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-md text-sm font-semibold"
                        onClick={async () => {
                          try {
                            await api.evaluationCycles.remindEvaluators(cycleInfo.cycle_id, faculty.id);
                            showToast({ type: 'success', title: 'Reminders sent', message: 'Reminder emails were sent to pending evaluators.' });
                            // reload progress
                            const progress = await api.evaluationCycles.getProgress(cycleInfo.cycle_id);
                            const rows = (progress.members || []).map((m) => ({
                              id: m.user_id,
                              name: m.full_name,
                              title: '',
                              completed: m.evaluations_completed_count,
                              total: 3,
                              nominations_submitted: m.nominations_submitted,
                              nominations_complete: m.nominations_complete,
                              missing_nominations: m.missing_nominations,
                              approved_nominations: m.approved_nominations || [],
                            }));
                            setProgressData(rows);
                          } catch (err) {
                            showToast({ type: 'error', title: 'Failed', message: err.message || 'Could not send reminders' });
                          }
                        }}
                      >
                        Send Reminder
                      </button>

                      <button
                        className="px-3 py-1 bg-gray-50 text-brand-black rounded-md text-sm font-semibold"
                        onClick={() => navigate(`/admin/nominations?evaluateeId=${faculty.id}&cycleId=${cycleInfo.cycle_id}`)}
                      >
                        View Nominations
                      </button>
                    </div>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        percentage === 100 
                          ? 'bg-green-50 text-brand-green' 
                          : percentage > 0 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'bg-gray-50 text-brand-grey'
                      }`}>
                        {percentage === 100 ? 'Completed' : percentage > 0 ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgressDashboard;
