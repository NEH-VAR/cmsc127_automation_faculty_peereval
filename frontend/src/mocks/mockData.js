export const mockData = (key) => {
    const datasets = {
        'client-nominate': {
            auth: {
                purpose: 'NOMINATION',
                access_token: 'mock-token',
                user_id: 1,
                reference_id: 101,
            },
            userDetails: {
                id: 1,
                full_name: 'Juan Dela Cruz',
            },
            faculty: [
                {
                    user_id: 2,
                    user: {
                        full_name: 'Prof. Maria Santos',
                        email: 'maria.santos@example.com',
                        image_base64: null,
                    },
                },
                {
                    user_id: 3,
                    user: {
                        full_name: 'Dr. Pedro Reyes',
                        email: 'pedro.reyes@example.com',
                        image_base64: null,
                    },
                },
                {
                    user_id: 4,
                    user: {
                        full_name: 'Engr. Ana Cruz',
                        email: 'ana.cruz@example.com',
                        image_base64: null,
                    },
                },
                {
                    user_id: 5,
                    user: {
                        full_name: 'Prof. Luis Garcia',
                        email: 'luis.garcia@example.com',
                        image_base64: null,
                    },
                },
                {
                    user_id: 6,
                    user: {
                        full_name: 'Dr. Carla Mendoza',
                        email: 'carla.mendoza@example.com',
                        image_base64: null,
                    },
                }
            ],
        },
        'client-forms': {
            auth: {
                purpose: 'EVALUATION',
                access_token: 'mock-evaluation-token',
                user_id: 1,
                reference_id: 999,
            },
            userDetails: {
                id: 1,
                full_name: 'Juan Dela Cruz',
            },
            evaluation: {
                id: 999,
                nomination: {
                    evaluatee: {
                        full_name: 'Prof. Maria Santos',
                    },
                },
            },
            questions: [
                {
                    question_id: 1,
                    question_text: 'The instructor clearly explains the course objectives.',
                    type: 'LIKERT',
                    is_required: true,
                    section: {
                        id: 1,
                        name: 'Instructional Clarity',
                        order: 1,
                    },
                },
                {
                    question_id: 2,
                    question_text: 'The instructor demonstrates mastery of the subject matter.',
                    type: 'LIKERT',
                    is_required: true,
                    section: {
                        id: 1,
                        name: 'Instructional Clarity',
                        order: 1,
                    },
                },
                {
                    question_id: 3,
                    question_text: 'The instructor encourages student participation.',
                    type: 'LIKERT',
                    is_required: true,
                    section: {
                        id: 2,
                        name: 'Classroom Engagement',
                        order: 2,
                    },
                },
                {
                    question_id: 4,
                    question_text: 'The instructor is approachable and responsive.',
                    type: 'LIKERT',
                    is_required: false,
                    section: {
                        id: 2,
                        name: 'Classroom Engagement',
                        order: 2,
                    },
                },
                {
                    question_id: 5,
                    question_text: 'What are the strengths of this instructor?',
                    type: 'TEXT',
                    is_required: false,
                    section: {
                        id: 3,
                        name: 'Qualitative Feedback',
                        order: 3,
                    },
                },
                {
                    question_id: 6,
                    question_text: 'What areas can be improved?',
                    type: 'TEXT',
                    is_required: false,
                    section: {
                        id: 3,
                        name: 'Qualitative Feedback',
                        order: 3,
                    },
                },
                {
                    question_id: 7,
                    question_text: 'Additional comments',
                    type: 'TEXT',
                    is_required: false,
                    section: null, // triggers "Uncategorized"
                },
    ],
}, 
    }

    if (!datasets[key]) {
            throw new Error(`No mock dataset for key: ${key}`);
        }

    return datasets[key];
    }
