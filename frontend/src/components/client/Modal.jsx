import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

const Modal = ({type}) => {
    const renderContent = () => {
      switch (type) {
        case 'confirm-submit':
          return {
            title: "Confirm Submission",
            body: "Are you sure you want to submit? This action cannot be undone.",
            confirmText: "Submit",
            color: "var(--color-brand-off-red)"
          };
        default:
          return { title: "Notice", body: "Something happened.", confirmText: "Okay", color: "#222" };
      }
    };

    const content = renderContent();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div 
                className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border-t-8"
                style={{ borderTopColor: content.color }}
            >
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-[#222]">{content.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{content.body}</p>
                </div>

                <div className="flex justify-end gap-3 p-4 bg-gray-50">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-200 rounded-md transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="px-6 py-2 text-sm font-bold text-white rounded-md shadow-sm transition-opacity hover:opacity-90"
                        style={{ backgroundColor: content.color }}
                    >
                        {content.confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
