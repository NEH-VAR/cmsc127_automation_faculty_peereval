import React, { useState } from 'react';
import logo from '../assets/website logo.svg';
import DynamicButton from './client/DynamicButton';
import TeacherCard from './client/TeacherCard';

const ClientNominate = () => {

        return (
            <div className="w-full px-4">
                <div className="w-full py-10 flex flex-col gap-15 items-center">
                    <div className="w-full flex flex-col gap-5">
                        <h1 className="text-5xl leading-[1.2] lg:text-6xl font-normal text-brand-green mb-2 font-heading">Peer Evaluation Form for Faculty</h1>
                        <p className="text-sm leading-[1.2] text-[#222]">
                            This document is the digitalized version of the MPI Form 2 or the Peer Evaluation Form for Faculty, with the following details taken at the bottom of the Word file document.
                        </p>
                    </div>
                    <div className="flex flex-col widht-fit gap-8">
                        <TeacherCard/>
                        <TeacherCard/>
                        <TeacherCard/>
                        <TeacherCard/>
                        <TeacherCard/>
                    </div>

                    {/* If Teacher card is 5, submit forms, if not add faculty */}
                    <DynamicButton content="Submit Forms" className="bg-[#A43245] py-3 h-auto "/>
                </div>
            </div>   
        );
    };

export default ClientNominate;
