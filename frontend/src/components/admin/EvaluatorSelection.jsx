import React, { useCallback, useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import facultyIcon from '../../assets/faculty-icon.svg';
import { api } from '../../lib/api';
import { useToast } from '../../lib/ToastContext';
import { Button } from '../ui/button';

const EvaluatorSelection = () => {
  const [groups, setGroups] = useState([]);
  const [selectedByEvaluatee, setSelectedByEvaluatee] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const loadNominations = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api.nominations.getPendingApproval();
      const nextGroups = Array.isArray(data) ? data : [];
      setGroups(nextGroups);
      setSelectedByEvaluatee((prev) => {
        const next = {};
        nextGroups.forEach((group) => {
          next[group.evaluatee_id] = prev[group.evaluatee_id] || [];
        });
        return next;
      });
    } catch (err) {
      const message = err.message || 'Unable to load nominations.';
      setError(message);
      showToast({ type: 'error', title: 'Load failed', message, actionText: 'Dismiss' });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadNominations();
  }, [loadNominations]);

  const toggleSelection = (evaluateeId, nominationId) => {
    setSelectedByEvaluatee((prev) => {
      const currentSelections = prev[evaluateeId] || [];
      const isSelected = currentSelections.includes(nominationId);

      if (isSelected) {
        return {
          ...prev,
          [evaluateeId]: currentSelections.filter((id) => id !== nominationId),
        };
      }

      if (currentSelections.length >= 3) {
        return prev;
      }

      return {
        ...prev,
        [evaluateeId]: [...currentSelections, nominationId],
      };
    });
  };

  const getSelectedCount = (evaluateeId) => (selectedByEvaluatee[evaluateeId] || []).length;
  const isAllValid = groups.length > 0 && groups.every((group) => getSelectedCount(group.evaluatee_id) === 3);

  const getRelationshipLabel = (nomination) => {
    if (nomination?.relationship?.relationship_name) {
      return nomination.relationship.relationship_name;
    }

    const otherText = nomination?.relationship_other_text?.trim();
    if (otherText) {
      return `Others: ${otherText}`;
    }

    return 'Relationship not provided';
  };

  const handleConfirm = async () => {
    if (!isAllValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const decisions = groups.flatMap((group) => {
        const selectedIds = new Set(selectedByEvaluatee[group.evaluatee_id] || []);
        return (group.nominations || []).map((nomination) => ({
          nomination_id: nomination.nomination_id,
          status: selectedIds.has(nomination.nomination_id) ? 'APPROVED' : 'REJECTED',
        }));
      });

      const result = await api.nominations.review(decisions);
      const sent = result?.evaluation_emails_sent ?? 0;
      const failed = result?.evaluation_emails_failed ?? 0;

      showToast({
        type: failed > 0 ? 'warning' : 'success',
        title: failed > 0 ? 'Emails partially sent' : 'Emails sent',
        message: `Sent ${sent} evaluation email(s).${failed > 0 ? ` ${failed} failed.` : ''}`,
        actionText: 'Dismiss',
      });

      await loadNominations();
    } catch (err) {
      const message = err.message || 'Unable to confirm selections.';
      showToast({ type: 'error', title: 'Confirm failed', message, actionText: 'Dismiss' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-12 bg-brand-bg min-h-screen">
      <header className="mb-8 lg:mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-6xl font-normal text-brand-green mb-2 font-heading">Faculty Nominations</h1>
          <p className="text-brand-grey text-base lg:text-lg">Select 3 evaluators for each faculty member, then confirm to send emails.</p>
        </div>
      </header>
      <div className="space-y-6">
        {isLoading && (
          <div className="text-sm text-brand-grey">Loading nominations...</div>
        )}

        {!isLoading && error && (
          <div className="text-sm text-red-600">{error}</div>
        )}

        {!isLoading && !error && groups.length === 0 && (
          <div className="text-sm text-brand-grey">No nominations submitted yet.</div>
        )}

        {groups.map((group) => (
          <div key={group.evaluatee_id} className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="flex items-center gap-4 min-w-[250px]">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50 flex-shrink-0">
                  <img src={facultyIcon} alt={group.evaluatee_name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-black text-lg">{group.evaluatee_name}</h3>
                  <p className="text-sm text-brand-grey font-medium">{group.evaluatee_email}</p>
                </div>
              </div>

              <div className="flex-1">
                <p className="text-xs font-bold text-brand-grey uppercase tracking-wider mb-4">Pick 3 Evaluators:</p>
                <div className="flex flex-wrap gap-3">
                  {(group.nominations || []).map((nomination) => (
                    <button
                      key={nomination.nomination_id}
                      type="button"
                      onClick={() => toggleSelection(group.evaluatee_id, nomination.nomination_id)}
                      disabled={isSubmitting}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                        (selectedByEvaluatee[group.evaluatee_id] || []).includes(nomination.nomination_id)
                          ? 'bg-brand-green border-brand-green text-white shadow-md'
                          : 'bg-white border-gray-300 text-brand-grey hover:border-gray-400'
                      }`}
                    >
                      {(selectedByEvaluatee[group.evaluatee_id] || []).includes(nomination.nomination_id) && <Check className="w-3.5 h-3.5 mt-0.5" />}
                      <span className="flex flex-col items-start leading-tight">
                        <span>{nomination.evaluator?.full_name || 'Faculty'}</span>
                        <span className="text-[11px] opacity-80">{getRelationshipLabel(nomination)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-start lg:items-end gap-1 text-sm font-semibold">
                <span className={getSelectedCount(group.evaluatee_id) === 3 ? 'text-brand-green' : 'text-brand-maroon'}>
                  {getSelectedCount(group.evaluatee_id)}/3 Selected
                </span>
                <span className="text-xs text-brand-grey">Send email to them</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-end">
        <Button
          disabled={!isAllValid || isSubmitting}
          onClick={handleConfirm}
          className={`w-full lg:w-auto px-12 py-3 h-auto rounded-[16px] text-lg font-medium transition-all shadow-[0_8px_20px_-4px_rgba(123,17,19,0.3)] ${
            isAllValid && !isSubmitting ? 'bg-brand-maroon text-white hover:opacity-90' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Sending Emails...' : 'Confirm Selection'}
        </Button>
      </div>
    </div>
  );
};

export default EvaluatorSelection;
