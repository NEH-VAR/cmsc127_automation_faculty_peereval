import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, Users, X } from 'lucide-react';
import facultyIcon from '../../assets/faculty-icon.svg';
import { api } from '../../lib/api';
import { useToast } from '../../lib/ToastContext';

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
  const [sendingReminderId, setSendingReminderId] = useState(null);
  const [selectedNominations, setSelectedNominations] = useState(null);
  const [rowErrors, setRowErrors] = useState({});
  const { showToast } = useToast();

  const summary = useMemo(() => {
    const totalFaculty = progressData.length;
    const fullyCompleted = progressData.filter((faculty) => faculty.nominations_complete && faculty.completed >= faculty.total).length;
    const inProgress = progressData.filter((faculty) => !faculty.nominations_complete || faculty.completed < faculty.total).length;

    return { totalFaculty, fullyCompleted, inProgress };
  }, [progressData]);

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
          nominations: m.nominations || [],
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
            <p className="text-2xl font-bold text-brand-black">{summary.fullyCompleted}</p>
            <p className="text-xs font-semibold text-brand-grey uppercase tracking-wider">Fully Completed</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-black">{summary.inProgress}</p>
            <p className="text-xs font-semibold text-brand-grey uppercase tracking-wider">In Progress</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
            <Users className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-black">{summary.totalFaculty}</p>
            <p className="text-xs font-semibold text-brand-grey uppercase tracking-wider">Total Faculty</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-700">
          Loading progress dashboard...
        </div>
      )}

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
                      {!faculty.nominations_complete && (
                        <div className="mt-2 text-xs text-brand-grey">
                          Nominations: {faculty.nominations_submitted}/5 {faculty.missing_nominations > 0 ? `• ${faculty.missing_nominations} missing` : ''}
                        </div>
                      )}
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
                        className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-md text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={sendingReminderId === faculty.id}
                        onClick={async () => {
                          setRowErrors((prev) => ({ ...prev, [faculty.id]: null }));
                          setSendingReminderId(faculty.id);
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
                              nominations: m.nominations || [],
                              approved_nominations: m.approved_nominations || [],
                            }));
                            setProgressData(rows);
                          } catch (err) {
                            setRowErrors((prev) => ({ ...prev, [faculty.id]: err.message || 'Could not send reminders' }));
                            showToast({ type: 'error', title: 'Failed', message: err.message || 'Could not send reminders' });
                          } finally {
                            setSendingReminderId((current) => (current === faculty.id ? null : current));
                          }
                        }}
                      >
                        {sendingReminderId === faculty.id ? 'Sending...' : 'Send Reminder'}
                      </button>

                      <button
                        className="px-3 py-1 bg-gray-50 text-brand-black rounded-md text-sm font-semibold"
                        onClick={() => setSelectedNominations(faculty)}
                      >
                        View Nominations
                      </button>
                    </div>
                    {rowErrors[faculty.id] && (
                      <p className="mt-2 text-xs font-medium text-red-600 text-right max-w-[18rem] ml-auto">
                        {rowErrors[faculty.id]}
                      </p>
                    )}
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

      {selectedNominations && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedNominations(null)}
        >
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-brand-black">Nominations for {selectedNominations.name}</h2>
                <p className="text-sm text-brand-grey">{selectedNominations.nominations_submitted}/5 selected nominators</p>
              </div>
              <button
                className="rounded-full p-2 text-brand-grey hover:bg-gray-100 hover:text-brand-black"
                onClick={() => setSelectedNominations(null)}
                aria-label="Close nominations modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
              <div className="mb-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-brand-grey">
                Showing the five people this faculty selected to evaluate them.
              </div>

              {selectedNominations.nominations.length === 0 ? (
                <p className="text-sm text-brand-grey">No nominations found for this faculty member.</p>
              ) : (
                <div className="space-y-3">
                  {selectedNominations.nominations.map((nomination) => {
                    const isApproved = nomination.status === 'APPROVED';
                    const isRejected = nomination.status === 'REJECTED';
                    const isPending = nomination.status === 'PENDING';

                    return (
                      <div key={nomination.nomination_id} className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3">
                        <div>
                          <p className="font-semibold text-brand-black">{nomination.evaluator_name}</p>
                          <p className="text-xs text-brand-grey">{nomination.evaluator_email}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                          isApproved
                            ? 'bg-green-50 text-brand-green'
                            : isRejected
                              ? 'bg-red-50 text-red-600'
                              : 'bg-gray-50 text-brand-grey'
                        }`}>
                          {isApproved ? 'Approved' : isRejected ? 'Rejected' : isPending ? 'Pending' : nomination.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;
