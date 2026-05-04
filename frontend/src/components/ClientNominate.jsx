import React, { useState } from 'react';
import logo from '../assets/website logo.svg';
import DynamicButton from './client/DynamicButton';
import TeacherCard from './client/TeacherCard';

const ClientNominate = ({name}) => {

    const TEACHERS = [
        { id: 1, name: "Dr. Smith", dept: "Computer Science" },
        { id: 2, name: "Prof. Jones", dept: "Information Technology" },
        { id: 3, name: "Dr. Garcia", dept: "Computer Science" },
        { id: 4, name: "Prof. Lee", dept: "Mathematics" },
        { id: 5, name: "Dr. Wang", dept: "Engineering" },
    ];    
        return (
            <div className="w-full px-4 xl:px-20 xl:flex xl:flex-col xl:items-center">
                <div className="w-full xl:w-fit py-10 flex flex-col gap-15 items-center ">
                    <div className="w-full flex flex-col gap-5 md:items-center">
                        <h1 className="text-5xl leading-[1.2] lg:text-6xl font-normal text-brand-green mb-2 font-heading">Good Day {name}!</h1>
                        <p className="text-sm leading-[1.2] text-[#222]">
                            Please nominate five faculty members to conduct your evaluation.
                        </p>
                    </div>

                    <div className="grid grid-cols-12 xl:grid-cols-15  gap-x-4 md:gap-x-5 gap-y-8 md:gap-y-12 w-full ">
                        {TEACHERS.map((teacher, index) => {
                            let gridClasses = "col-span-6 md:col-span-4 xl:col-span-3";

                            if (TEACHERS.length % 2 !== 0 && index === TEACHERS.length - 1) {
                                        gridClasses += " col-start-4";
                                    };

                            if (index===3) {
                                        gridClasses += " md:col-start-3"; 
                            }

                            return (
                                <div className={`${gridClasses} md:w-full flex flex-col items-center`}>
                                    <TeacherCard 
                                        key={teacher.id} 
                                        teacherName={teacher.name}
                                        teacherDept={teacher.dept}
                                    />
                                </div>
                                );
                            })}
                    </div>

                    {TEACHERS.length <= 4 ? (
                        <DynamicButton 
                            content="Add Faculty" 
                            className="bg-[#A43245] py-3 px-14 h-auto"
                        />
                    ) : (
                        <DynamicButton 
                            content="Submit Forms" 
                            className="bg-[#A43245] py-3 px-14 h-auto"
                        />
                    )}
                </div>
            </div>   
        );
    };

export default ClientNominate;
