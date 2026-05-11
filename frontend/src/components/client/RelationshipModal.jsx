import React, { useState } from 'react';

const RELATIONSHIP_OPTIONS = [
  {
    id: 'research_partnership',
    label: 'Research partnership/collaboration',
    value: 1,
  },
  {
    id: 'co_teaching',
    label: 'Co-teaching in a team-taught course',
    value: 2,
  },
  {
    id: 'service_committee',
    label: 'Service/committee engagement',
    value: 3,
  },
  {
    id: 'others',
    label: 'Others',
    value: 'others',
  },
];

const RelationshipModal = ({ faculty, onConfirm, onCancel }) => {
  const [selectedRelationship, setSelectedRelationship] = useState(null);
  const [otherText, setOtherText] = useState('');

  const handleConfirm = () => {
    if (!selectedRelationship) {
      alert('Please select a relationship type');
      return;
    }

    if (selectedRelationship === 'others' && !otherText.trim()) {
      alert('Please provide text for "Others"');
      return;
    }

    onConfirm({
      relationship_id: selectedRelationship === 'others' ? null : selectedRelationship,
      relationship_other_text: selectedRelationship === 'others' ? otherText.trim() : null,
    });

    // Reset state
    setSelectedRelationship(null);
    setOtherText('');
  };

  const handleCancel = () => {
    setSelectedRelationship(null);
    setOtherText('');
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[500px] max-h-[80vh] overflow-y-auto rounded-xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
        <div className="border-b border-gray-200 px-6 py-6">
          <h2 className="mb-2 text-xl font-semibold text-gray-800">Select Your Relationship</h2>
          <p className="m-0 text-sm text-gray-500">
            What is your relationship with <strong>{faculty?.name}</strong>?
          </p>
        </div>

        <div className="px-6 py-6">
          <div className="flex flex-col gap-3">
            {RELATIONSHIP_OPTIONS.map((option) => (
              <div
                key={option.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <input
                  type="radio"
                  id={option.id}
                  name="relationship"
                  checked={selectedRelationship === option.value}
                  onChange={() => setSelectedRelationship(option.value)}
                  className="mt-1 cursor-pointer accent-[#A43245]"
                />
                <label htmlFor={option.id} className="m-0 cursor-pointer text-sm text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>

          {selectedRelationship === 'others' && (
            <div className="mt-4 rounded-lg bg-gray-100 p-3">
              <label htmlFor="otherText" className="mb-2 block text-sm font-medium text-gray-800">
                Please specify (required):
              </label>
              <textarea
                id="otherText"
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                placeholder="Enter your relationship..."
                className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-[#A43245] focus:border-[#A43245] focus:ring-2"
                rows="3"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            className="rounded-md bg-gray-200 px-5 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-[#A43245] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#8b2937]"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default RelationshipModal;
