import React, { useState, useEffect } from 'react';

const ModalNameConfirm = ({ isOpen, onClose, onConfirm, expectedName }) => {
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (isOpen) {
            setInputValue('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isNameValid = inputValue.trim().toLowerCase() === (expectedName || '').trim().toLowerCase();

    const handleSubmit = () => {
        if (isNameValid) {
            onConfirm(inputValue.trim());
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && isNameValid) {
            handleSubmit();
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-[450px] rounded-xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-800">Confirm Evaluation</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div className="px-6 py-6">
                    <p className="text-sm text-gray-600 mb-4">
                        Please enter your full name to confirm evaluation.
                    </p>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="First Name M. Last Name"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#A43245] focus:ring-2 focus:ring-[#A43245]/20"
                        autoFocus
                    />
                </div>

                <div className="flex justify-center border-t border-gray-200 px-6 py-5">
                    <button
                        onClick={handleSubmit}
                        disabled={!isNameValid}
                        className={`rounded-lg px-12 py-3 text-sm font-medium text-white transition-all ${
                            isNameValid
                                ? 'bg-[#A43245] hover:bg-[#8b2937] cursor-pointer'
                                : 'bg-gray-300 opacity-50 cursor-not-allowed'
                        }`}
                    >
                        Submit Forms
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalNameConfirm;
