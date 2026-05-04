import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ClientForms from './ClientForms';
import { api } from '../lib/api';

const EvaluateRoute = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState('');
    const [evaluationData, setEvaluationData] = useState(null);

    const token = searchParams.get('token');

    useEffect(() => {
        const validateAndLoad = async () => {
            if (!token) {
                setError('Missing evaluation token.');
                setStatus('error');
                return;
            }

            try {
                // 1. Validate magic link
                const auth = await api.magicLinks.validate(token);
                if (auth.purpose !== 'EVALUATION') {
                    throw new Error('This link is not for evaluations.');
                }

                // 2. Set authentication
                api.auth.setToken(auth.access_token);
                
                // Fetch user details to sync localStorage if needed
                const user = await api.users.getById(auth.user_id);
                api.auth.setUser(user);

                // 3. Fetch evaluation details to get evaluatee name
                const evaluation = await api.evaluations.getById(auth.reference_id);
                
                setEvaluationData({
                    evaluationId: auth.reference_id,
                    evaluateeName: evaluation.nomination?.evaluatee?.full_name || 'Faculty Member'
                });
                
                setStatus('ready');
            } catch (err) {
                setError(err.message || 'Unable to load evaluation form.');
                setStatus('error');
            }
        };

        validateAndLoad();
    }, [token]);

    if (status === 'loading') {
        return (
            <div className="w-full px-4 xl:px-20 py-20 text-center flex flex-col items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mb-4"></div>
                <p className="text-brand-grey">Loading evaluation form...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="w-full px-4 xl:px-20 py-20 text-center flex flex-col items-center justify-center min-h-[50vh]">
                <div className="text-red-500 text-5xl mb-4">!</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Link</h2>
                <p className="text-red-600 max-w-md">{error}</p>
            </div>
        );
    }

    return (
        <ClientForms 
            evaluationId={evaluationData.evaluationId} 
            evaluateeName={evaluationData.evaluateeName} 
        />
    );
};

export default EvaluateRoute;
