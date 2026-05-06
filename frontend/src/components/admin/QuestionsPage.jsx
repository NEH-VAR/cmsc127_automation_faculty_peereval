import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { api } from '../../lib/api';
import { useToast } from '../../lib/ToastContext';

const NEW_SECTION_VALUE = '__new_section__';

const sortByOrder = (items) => [...items].sort((a, b) => (a.order_in_section ?? 0) - (b.order_in_section ?? 0));

const rebuildSectionsWithQuestions = (baseSections, questionList) => {
  const sectionRows = baseSections.map((section) => ({
    ...section,
    questions: [],
  }));

  const uncategorized = { id: null, name: 'Uncategorized', order: 9999, questions: [] };

  questionList.forEach((question) => {
    const sectionId = question.section_id ?? null;
    const section = sectionRows.find((row) => row.id === sectionId);
    if (section) {
      section.questions.push(question);
    } else {
      uncategorized.questions.push(question);
    }
  });

  sectionRows.forEach((section) => {
    section.questions = sortByOrder(section.questions);
  });
  uncategorized.questions = sortByOrder(uncategorized.questions);

  return [...sectionRows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), uncategorized];
};

const QuestionEditor = ({
  question,
  sections,
  onChange,
  getNextQuestionOrder,
  isCreatingSection,
  newSectionName,
  newSectionOrder,
  onNewSectionNameChange,
  onNewSectionOrderChange,
  onStartCreateSection,
  onCancelCreateSection,
  onCreateSection,
  isCreateSectionDisabled,
}) => {
  if (!question) return null;
  const selectValue = isCreatingSection ? NEW_SECTION_VALUE : question.section_id ?? '';
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-brand-black">Question</label>
        <input
          value={question.question_text}
          onChange={(e) => onChange({ ...question, question_text: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-4 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-black">Type</label>
        <select
          value={question.type}
          onChange={(e) => onChange({ ...question, type: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-4 py-2"
        >
          <option value="LIKERT">Likert</option>
          <option value="OPEN_ENDED">Open-ended</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!question.is_required}
            onChange={(e) => onChange({ ...question, is_required: e.target.checked })}
          />
          <span className="text-sm">Required</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!question.is_active}
            onChange={(e) => onChange({ ...question, is_active: e.target.checked })}
          />
          <span className="text-sm">Active</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-black">Section</label>
        <select
          value={selectValue}
          onChange={(e) => {
            if (e.target.value === NEW_SECTION_VALUE) {
              onStartCreateSection();
              return;
            }
            onCancelCreateSection();
            const nextSectionId = e.target.value ? Number(e.target.value) : null;
            const shouldRecompute = !question.question_id || (question.section_id ?? null) !== nextSectionId;
            const nextOrder = shouldRecompute
              ? getNextQuestionOrder(nextSectionId)
              : question.order_in_section ?? 0;
            onChange({
              ...question,
              section_id: nextSectionId,
              order_in_section: nextOrder,
            });
          }}
          className="w-full rounded-xl border border-gray-200 px-4 py-2"
        >
          <option value="">(none)</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
          <option value={NEW_SECTION_VALUE}>+ Add new section...</option>
        </select>
        {isCreatingSection && (
          <div className="mt-3 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div>
              <label className="block text-xs font-semibold text-brand-grey">New section name</label>
              <input
                value={newSectionName}
                onChange={(e) => onNewSectionNameChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-grey">Order</label>
              <input
                type="number"
                min="1"
                value={newSectionOrder}
                onChange={(e) => onNewSectionOrderChange(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 bg-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={onCancelCreateSection} className="border">Cancel</Button>
              <Button onClick={onCreateSection} disabled={isCreateSectionDisabled} className="bg-brand-maroon text-white">
                Create Section
              </Button>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-black">Order in section</label>
        <input
          type="number"
          value={question.order_in_section ?? 0}
          onChange={(e) => onChange({ ...question, order_in_section: Number(e.target.value) })}
          className="w-full rounded-xl border border-gray-200 px-4 py-2"
        />
      </div>
    </div>
  );
};

const QuestionsPage = () => {
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [activeCycle, setActiveCycle] = useState(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionOrder, setNewSectionOrder] = useState(1);
  const [isCreatingSectionBusy, setIsCreatingSectionBusy] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [draggedQuestionId, setDraggedQuestionId] = useState(null);
  const [dropTargetSectionId, setDropTargetSectionId] = useState(null);
  const [isReordering, setIsReordering] = useState(false);
  const { showToast } = useToast();

  const isLocked = !!activeCycle?.questions_locked;

  const formatTimestamp = (value, fallback) => {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleString();
  };

  const lockedTimestamp = activeCycle?.questions_locked
    ? formatTimestamp(activeCycle.questions_locked_at, 'Locked')
    : 'Not locked';

  const load = async () => {
    setIsLoading(true);
    try {
      // fetch all sections (including empty ones) and all questions
      const [secsResp, questionsResp, cyclesResp] = await Promise.all([
        api.questionSections.listAll(),
        api.questions.findWithSections(),
        api.evaluationCycles.listAll(),
      ]);

      // normalize section metadata
      const secs = Array.isArray(secsResp)
        ? secsResp.map((s) => ({
          id: s.id,
          name: s.name,
          order: s.order ?? 0,
        }))
        : [];

      // questions list (flat)
      const qs = Array.isArray(questionsResp)
        ? questionsResp.map((q) => ({
          ...q,
          section_id: q.section_id ?? q.section?.id ?? null,
        }))
        : [];

      setSections(rebuildSectionsWithQuestions(secs, qs));
      setQuestions(qs);
      const active = Array.isArray(cyclesResp)
        ? cyclesResp.find((cycle) => cycle.is_active)
        : null;
      setActiveCycle(active || null);
    } catch (err) {
      showToast({ type: 'error', title: 'Unable to load questions', message: err.message || 'Try again' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getNextSectionOrder = () => {
    const orders = sections
      .filter((section) => section?.id !== null)
      .map((section) => section.order ?? 0);
    return orders.length > 0 ? Math.max(...orders) + 1 : 1;
  };

  const getNextQuestionOrder = (sectionId) => {
    const targetId = sectionId ?? null;
    const orders = questions
      .filter((q) => (q.section_id ?? q.section?.id ?? null) === targetId)
      .map((q) => (Number.isFinite(q.order_in_section) ? q.order_in_section : 0));
    return orders.length > 0 ? Math.max(...orders) + 1 : 0;
  };

  const openEditor = (question = null) => {
    if (isLocked) {
      showToast({
        type: 'warning',
        title: 'Questions locked',
        message: 'Questions are finalized for the active cycle.',
        actionText: 'Dismiss',
      });
      return;
    }
    const draft = question
      ? { ...question }
      : { question_text: '', type: 'LIKERT', is_required: true, is_active: true, section_id: null, order_in_section: 0 };
    if (!draft.question_id) {
      draft.order_in_section = getNextQuestionOrder(draft.section_id ?? null);
    }
    setEditing(draft);
    setIsEditingModalOpen(true);
    setIsCreatingSection(false);
    setNewSectionName('');
    setNewSectionOrder(getNextSectionOrder());
  };

  const startCreateSection = () => {
    if (isLocked) {
      showToast({
        type: 'warning',
        title: 'Questions locked',
        message: 'Questions are finalized for the active cycle.',
        actionText: 'Dismiss',
      });
      return;
    }
    setIsCreatingSection(true);
    setNewSectionName('');
    setNewSectionOrder(getNextSectionOrder());
  };

  const cancelCreateSection = () => {
    setIsCreatingSection(false);
    setNewSectionName('');
  };

  const handleCreateSection = async () => {
    if (isLocked) {
      showToast({
        type: 'warning',
        title: 'Questions locked',
        message: 'Questions are finalized for the active cycle.',
        actionText: 'Dismiss',
      });
      return;
    }

    const name = newSectionName.trim();
    if (!name) {
      showToast({ type: 'error', title: 'Missing name', message: 'Enter a section name.' });
      return;
    }

    setIsCreatingSectionBusy(true);
    try {
      const created = await api.questionSections.create({
        name,
        order: Number(newSectionOrder) || 1,
      });

      setSections((prev) => {
        const baseSections = prev
          .filter((section) => section.id !== null && section.id !== created.id)
          .map((section) => ({
            id: section.id,
            name: section.name,
            order: section.order,
          }));
        const next = rebuildSectionsWithQuestions([
          ...baseSections,
          { id: created.id, name: created.name, order: created.order, questions: [] },
        ], questions);
        return next;
      });

      setEditing((prev) => (prev ? { ...prev, section_id: created.id } : prev));
      setIsCreatingSection(false);
      setNewSectionName('');
      showToast({ type: 'success', title: 'Section created', message: 'Section added to the list.' });
    } catch (err) {
      showToast({ type: 'error', title: 'Create failed', message: err.message || 'Try again' });
    } finally {
      setIsCreatingSectionBusy(false);
    }
  };

  const handleSave = async () => {
    if (isLocked) {
      showToast({
        type: 'warning',
        title: 'Questions locked',
        message: 'Questions are finalized for the active cycle.',
        actionText: 'Dismiss',
      });
      return;
    }
    try {
      if (editing.question_id) {
        await api.questions.update(editing.question_id, editing);
        showToast({ type: 'success', title: 'Updated', message: 'Question updated' });
      } else {
        await api.questions.create(editing);
        showToast({ type: 'success', title: 'Created', message: 'Question created' });
      }
      setIsEditingModalOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      showToast({ type: 'error', title: 'Save failed', message: err.message || 'Try again' });
    }
  };

  const handleDelete = async () => {
    if (!editing?.question_id) return;
    if (isLocked) {
      showToast({
        type: 'warning',
        title: 'Questions locked',
        message: 'Questions are finalized for the active cycle.',
        actionText: 'Dismiss',
      });
      return;
    }

    const confirmed = window.confirm('Delete this question? This cannot be undone.');
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await api.questions.delete(editing.question_id);
      showToast({ type: 'success', title: 'Deleted', message: 'Question deleted.' });
      setIsEditingModalOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      showToast({ type: 'error', title: 'Delete failed', message: err.message || 'Try again' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFinalize = async () => {
    if (!activeCycle) {
      showToast({
        type: 'error',
        title: 'No active cycle',
        message: 'Create or activate a cycle before finalizing questions.',
        actionText: 'Dismiss',
      });
      return;
    }

    setIsFinalizing(true);
    try {
      await api.evaluationCycles.finalizeQuestions(activeCycle.cycle_id);
      setActiveCycle((prev) => (prev ? { ...prev, questions_locked: true } : prev));
      showToast({
        type: 'success',
        title: 'Questions finalized',
        message: 'Questions are now locked and nomination emails were sent.',
        actionText: 'Done',
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Finalize failed',
        message: err.message || 'Try again',
        actionText: 'Dismiss',
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleDragStart = (questionId) => {
    if (isLocked || isReordering) return;
    setDraggedQuestionId(questionId);
  };

  const handleDragEnd = () => {
    setDraggedQuestionId(null);
    setDropTargetSectionId(null);
  };

  const handleDropOnSection = async (targetSectionId) => {
    if (isLocked || isReordering || !draggedQuestionId) {
      return;
    }

    const movedQuestion = questions.find((question) => question.question_id === draggedQuestionId);
    if (!movedQuestion) {
      handleDragEnd();
      return;
    }

    const sourceSectionId = movedQuestion.section_id ?? null;
    const normalizedTargetSectionId = targetSectionId ?? null;

    const sourceQuestions = sortByOrder(
      questions.filter(
        (question) => (question.section_id ?? null) === sourceSectionId && question.question_id !== movedQuestion.question_id,
      ),
    );
    const targetQuestions = sortByOrder(
      questions.filter(
        (question) => (question.section_id ?? null) === normalizedTargetSectionId && question.question_id !== movedQuestion.question_id,
      ),
    );

    const movedToTarget = {
      ...movedQuestion,
      section_id: normalizedTargetSectionId,
    };
    const nextTargetQuestions = [...targetQuestions, movedToTarget];

    const reassignedSource = sourceSectionId === normalizedTargetSectionId
      ? []
      : sourceQuestions.map((question, index) => ({
        ...question,
        order_in_section: index,
      }));
    const reassignedTarget = nextTargetQuestions.map((question, index) => ({
      ...question,
      order_in_section: index,
    }));

    const updatedMap = new Map();
    reassignedSource.forEach((question) => updatedMap.set(question.question_id, question));
    reassignedTarget.forEach((question) => updatedMap.set(question.question_id, question));

    const nextQuestions = questions.map((question) => updatedMap.get(question.question_id) || question);
    const changedQuestions = nextQuestions.filter((question) => {
      const prev = questions.find((item) => item.question_id === question.question_id);
      if (!prev) return false;
      return (prev.section_id ?? null) !== (question.section_id ?? null)
        || (prev.order_in_section ?? 0) !== (question.order_in_section ?? 0);
    });

    setQuestions(nextQuestions);
    const baseSections = sections
      .filter((section) => section.id !== null)
      .map((section) => ({ id: section.id, name: section.name, order: section.order }));
    setSections(rebuildSectionsWithQuestions(baseSections, nextQuestions));
    setIsReordering(true);

    try {
      for (const question of changedQuestions) {
        await api.questions.update(question.question_id, {
          section_id: question.section_id,
          order_in_section: question.order_in_section,
        });
      }
      showToast({ type: 'success', title: 'Reordered', message: 'Question order updated.' });
    } catch (err) {
      showToast({ type: 'error', title: 'Reorder failed', message: err.message || 'Try again' });
      await load();
    } finally {
      setIsReordering(false);
      handleDragEnd();
    }
  };

  const handleDropOnQuestion = async (targetQuestionId, targetSectionId) => {
    if (isLocked || isReordering || !draggedQuestionId || draggedQuestionId === targetQuestionId) {
      return;
    }

    const movedQuestion = questions.find((question) => question.question_id === draggedQuestionId);
    const targetQuestion = questions.find((question) => question.question_id === targetQuestionId);
    if (!movedQuestion || !targetQuestion) {
      handleDragEnd();
      return;
    }

    const sourceSectionId = movedQuestion.section_id ?? null;
    const normalizedTargetSectionId = targetSectionId ?? null;

    const sourceQuestions = sortByOrder(
      questions.filter(
        (question) => (question.section_id ?? null) === sourceSectionId && question.question_id !== movedQuestion.question_id,
      ),
    );

    const targetQuestions = sortByOrder(
      questions.filter(
        (question) => (question.section_id ?? null) === normalizedTargetSectionId && question.question_id !== movedQuestion.question_id,
      ),
    );

    const insertIndex = targetQuestions.findIndex((question) => question.question_id === targetQuestionId);
    const movedToTarget = {
      ...movedQuestion,
      section_id: normalizedTargetSectionId,
    };

    const nextTargetQuestions = [...targetQuestions];
    nextTargetQuestions.splice(insertIndex >= 0 ? insertIndex : nextTargetQuestions.length, 0, movedToTarget);

    const reassignedSource = sourceSectionId === normalizedTargetSectionId
      ? []
      : sourceQuestions.map((question, index) => ({
        ...question,
        order_in_section: index,
      }));

    const reassignedTarget = nextTargetQuestions.map((question, index) => ({
      ...question,
      order_in_section: index,
    }));

    const updatedMap = new Map();
    reassignedSource.forEach((question) => updatedMap.set(question.question_id, question));
    reassignedTarget.forEach((question) => updatedMap.set(question.question_id, question));

    const nextQuestions = questions.map((question) => updatedMap.get(question.question_id) || question);
    const changedQuestions = nextQuestions.filter((question) => {
      const prev = questions.find((item) => item.question_id === question.question_id);
      if (!prev) return false;
      return (prev.section_id ?? null) !== (question.section_id ?? null)
        || (prev.order_in_section ?? 0) !== (question.order_in_section ?? 0);
    });

    setQuestions(nextQuestions);
    const baseSections = sections
      .filter((section) => section.id !== null)
      .map((section) => ({ id: section.id, name: section.name, order: section.order }));
    setSections(rebuildSectionsWithQuestions(baseSections, nextQuestions));
    setIsReordering(true);

    try {
      for (const question of changedQuestions) {
        await api.questions.update(question.question_id, {
          section_id: question.section_id,
          order_in_section: question.order_in_section,
        });
      }
      showToast({ type: 'success', title: 'Reordered', message: 'Question order updated.' });
    } catch (err) {
      showToast({ type: 'error', title: 'Reorder failed', message: err.message || 'Try again' });
      await load();
    } finally {
      setIsReordering(false);
      handleDragEnd();
    }
  };

  const isCreateSectionDisabled = isLocked || isCreatingSectionBusy || !newSectionName.trim();

  return (
    <div className="flex-1 p-6 lg:p-12 bg-brand-bg min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-brand-black">Questions</h1>
          <p className="text-sm text-brand-grey">Manage evaluation form questions and sections.</p>
        </div>
        <div>
          <Button
            onClick={() => openEditor(null)}
            disabled={isLocked}
            className="bg-brand-maroon text-white"
          >
            Add Question
          </Button>
        </div>
      </div>

      {activeCycle && (
        <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${isLocked ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
          {isLocked
            ? `Questions are locked for the ${activeCycle.year} cycle.`
            : `Questions are editable for the ${activeCycle.year} cycle.`}
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-gray-100 bg-white px-6 py-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-grey">Active Cycle</div>
            <div className="mt-1 text-base font-semibold text-brand-black">
              {activeCycle ? activeCycle.year : 'None'}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-grey">Forms Started</div>
            <div className="mt-1 text-sm text-brand-black">
              {activeCycle ? formatTimestamp(activeCycle.forms_started_at, 'Not started') : 'Not started'}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-grey">Questions Locked</div>
            <div className="mt-1 text-sm text-brand-black">
              {activeCycle ? lockedTimestamp : 'Not locked'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {isLoading ? (
          <div>Loading questions...</div>
        ) : (
          <div className="space-y-6">
            {sections.map((sec) => (
              <div key={sec.id}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{sec.name}</h3>
                  <Button
                    onClick={() => openEditor({ section_id: sec.id, question_text: '', type: 'LIKERT', is_required: true, is_active: true, order_in_section: getNextQuestionOrder(sec.id) })}
                    disabled={isLocked}
                  >
                    Add in section
                  </Button>
                </div>
                <ul
                  className={`space-y-2 rounded-xl p-2 transition-colors ${dropTargetSectionId === (sec.id ?? null) ? 'bg-brand-bg' : ''}`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (!isLocked && !isReordering) {
                      setDropTargetSectionId(sec.id ?? null);
                    }
                  }}
                  onDragLeave={() => {
                    setDropTargetSectionId(null);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleDropOnSection(sec.id ?? null);
                  }}
                >
                  {sec.questions.map((q) => (
                    <li
                      key={q.question_id}
                      draggable={!isLocked && !isReordering}
                      onDragStart={() => handleDragStart(q.question_id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(event) => {
                        event.preventDefault();
                        if (!isLocked && !isReordering) {
                          setDropTargetSectionId(sec.id ?? null);
                        }
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        handleDropOnQuestion(q.question_id, sec.id ?? null);
                      }}
                      className={`group flex items-center justify-between p-3 rounded-md border border-gray-100 hover:bg-gray-50 cursor-pointer ${draggedQuestionId === q.question_id ? 'opacity-50' : ''}`}
                      onClick={() => {
                        if (!draggedQuestionId) {
                          openEditor(q);
                        }
                      }}
                    >
                      <div>
                        <div className="font-medium">{q.question_text}</div>
                        <div className="text-xs text-brand-grey">Type: {q.type} • Required: {q.is_required ? 'Yes' : 'No'} • Active: {q.is_active ? 'Yes' : 'No'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={(e) => { e.stopPropagation(); openEditor(q); }}
                          disabled={isLocked}
                          className="bg-white border opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Edit
                        </Button>
                      </div>
                    </li>
                  ))}
                  {sec.questions.length === 0 && (
                    <li className="rounded-md border border-dashed border-gray-200 px-3 py-4 text-sm text-brand-grey">
                      Drop a question here
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {isEditingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{editing?.question_id ? 'Edit Question' : 'Add Question'}</h2>
              <button onClick={() => { setIsEditingModalOpen(false); setEditing(null); }} className="text-brand-grey">Close</button>
            </div>

            <QuestionEditor
              question={editing}
              sections={sections}
              onChange={setEditing}
              getNextQuestionOrder={getNextQuestionOrder}
              isCreatingSection={isCreatingSection}
              newSectionName={newSectionName}
              newSectionOrder={newSectionOrder}
              onNewSectionNameChange={setNewSectionName}
              onNewSectionOrderChange={setNewSectionOrder}
              onStartCreateSection={startCreateSection}
              onCancelCreateSection={cancelCreateSection}
              onCreateSection={handleCreateSection}
              isCreateSectionDisabled={isCreateSectionDisabled}
            />

            <div className="mt-6 flex items-center justify-between gap-3">
              {editing?.question_id ? (
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting || isLocked}
                  className="hover:bg-red-500"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-3">
                <Button onClick={() => { setIsEditingModalOpen(false); setEditing(null); }} className="border">Cancel</Button>
                <Button onClick={handleSave} className="bg-brand-maroon text-white">Save</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 flex justify-end">
        <Button
          onClick={handleFinalize}
          disabled={isFinalizing || isLocked || !activeCycle}
          className="w-full lg:w-auto bg-brand-maroon text-white px-12 py-3 h-auto rounded-[16px] text-lg font-medium transition-all shadow-[0_8px_20px_-4px_rgba(123,17,19,0.3)]"
        >
          {isLocked ? 'Questions Finalized' : isFinalizing ? 'Finalizing...' : 'Finalize Questions'}
        </Button>
      </div>
    </div>
  );
};

export default QuestionsPage;
