import { mockData } from './mockData';

export const mockApi = {
    magicLinks: {
        validate: async () => {
            const data = mockData('client-nominate');
            return data.auth;
        },
    },
    auth: {
        setToken: () => {}, // no-op
    },
    users: {
        getById: async () => {
            const data = mockData('client-nominate');
            return data.userDetails;
        },
    },
    evaluationCycles: {
        getAssignedFaculty: async () => {
            const data = mockData('client-nominate');
            return data.faculty;
        },
    },
    nominations: {
        submit: async () => {
            return { success: true };
        },
    },
};
