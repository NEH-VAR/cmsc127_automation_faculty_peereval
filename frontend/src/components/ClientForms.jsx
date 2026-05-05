import React, { useState, useEffect } from 'react';
import Question from './client/Question';
import DynamicButton from './client/DynamicButton';
import NominationSubmitted from './client/NominationSubmitted';
import { api } from '../lib/api';
import { useToast } from '../lib/ToastContext';

const ClientForms = ({ evaluationId, evaluateeName }) => {
    const { showToast } = useToast();
    const [sections, setSections] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                // Fetch active questions (which include their .section relation)
                const questionsResp = await api.questions.findActive();
                const qs = Array.isArray(questionsResp) ? questionsResp : [];
                
                // Group questions by section
                const sectionMap = new Map();
                const uncategorized = { id: null, name: 'Uncategorized', order: 9999, questions: [] };
                
                qs.forEach(q => {
                    const sec = q.section;
                    if (sec) {
                        if (!sectionMap.has(sec.id)) {
                            sectionMap.set(sec.id, { ...sec, questions: [] });
                        }
                        sectionMap.get(sec.id).questions.push(q);
                    } else {
                        uncategorized.questions.push(q);
                    }
                });
                
                const finalSections = Array.from(sectionMap.values());
                if (uncategorized.questions.length > 0) {
                    finalSections.push(uncategorized);
                }
                
                // Sort sections by order
                finalSections.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
                
                setSections(finalSections);
            } catch (err) {
                showToast({
                    type: 'error',
                    title: 'Error loading questions',
                    message: err.message,
                    actionText: 'Dismiss',
                });
            } finally {
                setLoading(false);
            }
        };

        if (evaluationId) {
            fetchQuestions();
        }
    }, [evaluationId, showToast]);

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSubmit = async () => {
        // Validate that all required questions are answered
        let allValid = true;
        
        sections.forEach(section => {
            section.questions.forEach(q => {
                if (q.is_required && !answers[q.question_id]) {
                    allValid = false;
                }
            });
        });

        if (!allValid) {
            showToast({
                type: 'warning',
                title: 'Incomplete Form',
                message: 'Please answer all required questions before submitting.',
                actionText: 'Dismiss',
            });
            return;
        }

        setSubmitting(true);
        try {
            const formattedAnswers = Object.entries(answers).map(([questionId, value]) => {
                const isLikert = typeof value === 'number';
                return {
                    question_id: parseInt(questionId),
                    numeric_score: isLikert ? value : undefined,
                    text_response: isLikert ? undefined : value
                };
            });

            await api.answers.submit({
                evaluation_id: parseInt(evaluationId),
                answers: formattedAnswers
            });
            
            setSubmitted(true);
        } catch (err) {
            showToast({
                type: 'error',
                title: 'Submission failed',
                message: err.message || 'Please try again.',
                actionText: 'Dismiss',
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <NominationSubmitted
                title="Evaluation submitted"
                message="Thank you! Your evaluation has been recorded. You may now close this page."
            />
        );
    }

    if (!evaluationId) {
        return (
            <div className="w-full px-4 xl:px-20 py-10 text-center text-red-600">
                Invalid evaluation access. Please use the link from your email.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="w-full px-4 xl:px-20 py-10 text-center">
                Loading evaluation form...
            </div>
        );
    }

    return (
        <div className="w-full px-4 xl:px-20 xl:flex xl:flex-col xl:items-center">
            <div className="w-full xl:w-[800px] py-10 flex flex-col gap-10">
                <div className="w-full flex flex-col gap-5">
                    <h1 className="text-5xl leading-[1.2] lg:text-6xl font-normal text-brand-green mb-2 font-heading">
                        Peer Evaluation for {evaluateeName}
                    </h1>
                    <p className="text-sm leading-[1.2] text-[#222]">
                        This document is the digitalized version of the MPI Form 2 or the Peer Evaluation Form for Faculty.
                    </p>
                </div>
                
                <div className="w-full flex flex-col gap-3">
                    <div className="w-full bg-[#E0E0E0] h-0.5"></div>
                    <h2 className="text-4 leading-[1.2] text-[#00563F] font-bold">Rating Scale</h2>
                    <p className="text-3 leading-[1.2]">1 - Strongly Disagree<br/>2 - Disagree<br/>3 - Agree<br/>4 - Strongly Agree</p>
                    <div className="w-full bg-[#E0E0E0] h-0.5"></div>
                </div>

                {sections.map((section, idx) => (
                    <div key={section.id || `section-${idx}`} className="flex flex-col gap-6">
                        {section.name && (
                            <h2 className="font-bold text-xl text-brand-green mb-2">{section.name}</h2>
                        )}
                        {section.questions.map(q => (
                            <Question 
                                key={q.question_id}
                                type={q.type.toLowerCase().replace('_', '-')} 
                                question={q.question_text} 
                                value={answers[q.question_id]}
                                onChange={(val) => handleAnswerChange(q.question_id, val)}
                            />
                        ))}
                    </div>
                ))}
                
                <div className="flex justify-center mt-6">
                    <DynamicButton 
                        content={submitting ? 'Submitting...' : 'Submit Evaluation'} 
                        className="bg-[#A43245] py-3 px-10 h-auto"
                        onClick={handleSubmit}
                        disabled={submitting}
                    />
                </div>
            </div>
        </div>   
    );
};

export default ClientForms;
