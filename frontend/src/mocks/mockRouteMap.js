export const getMockKeyFromRoute = () => {
    const path = window.location.pathname;

    if (path.includes('client-nominate') || path.includes('nominate')) return 'client-nominate';
    if (path.includes('client-forms') || path.includes('evaluate')) return 'client-forms';

    return 'default';
};
