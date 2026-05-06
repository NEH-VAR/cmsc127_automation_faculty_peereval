export const getMockKeyFromRoute = () => {
    const path = window.location.pathname;

    if (path.includes('client-nominate')) return 'client-nominate';
    if (path.includes('client-forms')) return 'client-forms';

    return 'default';
};
