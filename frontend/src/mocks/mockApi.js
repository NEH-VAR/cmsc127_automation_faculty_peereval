import { mockData } from './mockData';
import { getMockKeyFromRoute } from './mockRouteMap';

const getData = () => {
    const key = getMockKeyFromRoute();
    return mockData(key);
};

export const mockApi = {
    magicLinks: {
        validate: async () => {
            return getData().auth;
        },
    },

    auth: {
        setToken: () => {},
        setUser: () => {},
        getUser: () => {
            return getData().userDetails;
        },
    },

    users: {
        getById: async () => {
            return getData().userDetails;
        },
    },

    evaluationCycles: {
        getAssignedFaculty: async () => {
            return getData().faculty;
        },
    },

    nominations: {
        submit: async () => {
            return { success: true };
        },
    },
    questions: {
        findActive: async () => {
            return getData().questions;
        },
    },
    evaluations: {
        getById: async () => {
            return getData().evaluation;
        },
    },
    answers: {
        submit: async () => {
            return { success: true };
        },
    },
};
