import React from 'react';

const ProfileCard = () => {
            return (
                <div className="rounded-2xl shadow-lg w-[180px] h-[280px] flex flex-col overflow-hidden">
                    <div className="image-container">
                        <img 
                            src="https://placehold.co/180x200?text=Profile+Image" 
                            alt="A person in a blue and white sports jersey with orange gloves, standing outdoors with trees in the background"
                        />
                    </div>
                    <div className="flex flex-col gap-3 p-3">
                        <div className="text-xs">
                            Assoc. Engr. PhD. Prof.<br />
                            First Name M. Last Name
                        </div>
                        <div className="text-[9px] text-[#717171]">
                            Math 28 | CMSC 124
                        </div>
                    </div>
                </div>
            );
        };

export default ProfileCard;
