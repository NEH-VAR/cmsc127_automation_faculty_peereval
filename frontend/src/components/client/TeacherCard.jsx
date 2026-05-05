import React from 'react';

const ProfileCard = ({ className, teacherName, teacherDept, imageSrc, isSelected, onClick }) => {
    const profileSrc = imageSrc || 'https://placehold.co/180x200?text=Profile+Image';
    return (
        <button
            type="button"
            onClick={onClick}
            className={`${className} rounded-2xl shadow-lg w-full max-w-[180px] max-h-[280px] flex flex-col overflow-hidden border transition-colors ${isSelected ? 'border-[#A43245]' : 'border-transparent'}`}
        >
            <div className="image-container">
                <img
                    src={profileSrc}
                    alt="Profile placeholder"
                />
            </div>
            <div className="flex flex-col gap-3 p-3 text-left">
                <div className="text-xs">
                    {teacherName}
                </div>
                <div className="text-[9px] text-[#717171]">
                    {teacherDept}
                </div>
                {isSelected && (
                    <div className="text-[10px] font-semibold text-[#A43245]">Selected</div>
                )}
            </div>
        </button>
    );
};

export default ProfileCard;
