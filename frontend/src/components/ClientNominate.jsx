import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DynamicButton from './client/DynamicButton';
import TeacherCard from './client/TeacherCard';
import RelationshipModal from './client/RelationshipModal';
import NominationSubmitted from './client/NominationSubmitted';
import { apiProvider as api } from '../lib/apiProvider';
import { useToast } from '../lib/ToastContext';
import { USE_MOCK } from '../lib/config';

const ClientNominate = () => {
    const [searchParams] = useSearchParams();
    const { showToast } = useToast();
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState('');
    const [faculty, setFaculty] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [relationships, setRelationships] = useState({}); // Store relationships by evaluator_id
    const [evaluatee, setEvaluatee] = useState({ id: null, name: 'Faculty' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalFaculty, setModalFaculty] = useState(null);

    const token = searchParams.get('token') || (USE_MOCK ? 'mock-token' : null);

    useEffect(() => {
        const loadNominationData = async () => {
            if (!token && !USE_MOCK) {
                setError('Missing nomination token.');
                setStatus('error');
                return;
            }

            try {
                const auth = await api.magicLinks.validate(token);
                if (auth.purpose !== 'NOMINATION') {
                    throw new Error('This link is not for nominations.');
                }

                api.auth.setToken(auth.access_token);

                const userDetails = await api.users.getById(auth.user_id);
                setEvaluatee({ id: auth.user_id, name: userDetails?.full_name || 'Faculty' });

                const assignments = await api.evaluationCycles.getAssignedFaculty(auth.reference_id);
                const list = Array.isArray(assignments)
                    ? assignments
                            .filter((item) => item.user_id !== auth.user_id)
                            .map((item) => ({
                                id: item.user_id,
                                name: item.user?.full_name || 'Faculty',
                                email: item.user?.email || '',
                                image_base64: item.user?.image_base64 || null,
                            }))
                    : [];

                setFaculty(list);
                setStatus('ready');
            } catch (err) {
                setError(err.message || 'Unable to load nomination data.');
                setStatus('error');
            }
        };

        loadNominationData();
    }, [token]);

    const toggleSelection = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds((prev) => prev.filter((item) => item !== id));
            setRelationships((prev) => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
            return;
        }

        if (selectedIds.length >= 5) {
            showToast({
                type: 'warning',
                title: 'Maximum reached',
                message: 'You can only nominate 5 faculty members.',
                actionText: 'Dismiss',
            });
            return;
        }

        // Open modal to select relationship
        const selectedFaculty = faculty.find((f) => f.id === id);
        setModalFaculty({ ...selectedFaculty, evaluator_id: id });
        setModalOpen(true);
    };

    const handleRelationshipConfirm = (relationshipData) => {
        const evaluatorId = modalFaculty.evaluator_id;
        
        // Add to selected and store relationship
        setSelectedIds((prev) => [...prev, evaluatorId]);
        setRelationships((prev) => ({
            ...prev,
            [evaluatorId]: relationshipData,
        }));
        
        setModalOpen(false);
        setModalFaculty(null);
    };

    const handleRelationshipCancel = () => {
        setModalOpen(false);
        setModalFaculty(null);
    };

    const handleSubmit = async () => {
        if (selectedIds.length !== 5) {
            showToast({
                type: 'warning',
                title: 'Select 5 faculty',
                message: 'Please nominate exactly 5 faculty members.',
                actionText: 'Dismiss',
            });
            return;
        }

        setSubmitting(true);
        try {
            // Build the relationships payload
            const relationshipsPayload = selectedIds.map((evaluatorId) => ({
                evaluator_id: evaluatorId,
                ...relationships[evaluatorId],
            }));

            await api.nominations.submit({ relationships: relationshipsPayload });
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
                title="Nomination submitted"
                message="Thank you! Your nominations have been recorded. You may now close this page."
            />
        );
    }

    if (status === 'loading') {
        return (
            <div className="w-full px-4 xl:px-20 py-10 text-center">
                Loading nomination form...
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="w-full px-4 xl:px-20 py-10 text-center text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="w-full px-4 xl:px-20 xl:flex xl:flex-col xl:items-center">
            {modalOpen && (
                <RelationshipModal
                    faculty={modalFaculty}
                    onConfirm={handleRelationshipConfirm}
                    onCancel={handleRelationshipCancel}
                />
            )}
            
            <div className="w-full xl:w-fit py-10 flex flex-col gap-15 items-center ">
                <div className="w-full flex flex-col gap-5 md:items-center">
                    <h1 className="text-5xl leading-[1.2] lg:text-6xl font-normal text-brand-green mb-2 font-heading">Good Day {evaluatee.name}!</h1>
                    <p className="text-sm leading-[1.2] text-[#222]">
                        Please nominate five faculty members to conduct your evaluation.
                    </p>
                    <p className="text-xs text-brand-grey">
                        Selected {selectedIds.length} of 5
                    </p>
                </div>

                <div className="grid grid-cols-12 xl:grid-cols-15  gap-x-4 md:gap-x-5 gap-y-8 md:gap-y-12 w-full ">
                    {faculty.map((teacher, index) => {
                        let gridClasses = "col-span-6 md:col-span-4 xl:col-span-3";

                        if (faculty.length % 2 !== 0 && index === faculty.length - 1) {
                            gridClasses += " col-start-4";
                        }

                        if (index === 3) {
                            gridClasses += " md:col-start-3"; 
                        }

                        return (
                            <div key={teacher.id} className={`${gridClasses} md:w-full flex flex-col items-center`}>
                                <TeacherCard
                                    teacherName={teacher.name}
                                    teacherDept={teacher.email}
                                    imageSrc={teacher.image_base64 ? `data:image/*;base64,${teacher.image_base64}` : ''}
                                    isSelected={selectedIds.includes(teacher.id)}
                                    onClick={() => toggleSelection(teacher.id)}
                                />
                            </div>
                        );
                    })}
                </div>

                <DynamicButton
                    content={submitting ? 'Submitting...' : 'Submit Forms'}
                    onClick={handleSubmit}
                    className="bg-[#A43245] py-3 px-14 h-auto"
                    disabled={submitting}
                />
            </div>
        </div>
    );
};

export default ClientNominate;
