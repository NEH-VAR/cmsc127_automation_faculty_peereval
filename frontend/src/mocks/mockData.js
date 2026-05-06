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

    }

    if (!datasets[key]) {
            throw new Error(`No mock dataset for key: ${key}`);
        }

    return datasets[key];
    }
