import React from 'react';

const ProfileCard = ({className, teacherName, teacherDept}) => {
            return (
                <div className={`${className} rounded-2xl shadow-lg w-full max-w-[180px] max-h-[280px] flex flex-col overflow-hidden`}>
                    <div className="image-container">
                        <img 
                            src="https://placehold.co/180x200?text=Profile+Image" 
                            alt="A person in a blue and white sports jersey with orange gloves, standing outdoors with trees in the background"
                        />
                    </div>
                    <div className="flex flex-col gap-3 p-3">
                        <div className="text-xs">
                            {teacherName}
                        </div>
                        <div className="text-[9px] text-[#717171]">
                            {teacherDept}
                        </div>
                    </div>
                </div>
            );
        };

export default ProfileCard;
