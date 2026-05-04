import React, { useState } from 'react';

const NominationSubmitted = ({title, message}) => {

    return (
        <div className="w-full h-screen px-3 py-10 flex flex-col justify-center">
            <div className="h-fit flex flex-col gap-10 text-center">
                <h1 className="text-4xl md:text-5xl font-medium text-brand-green font-[optima] leading-[1.2] uppercase ">{title}</h1>
                <p className="text-sm">{message}</p>
            </div>
        </div>
  );
};

export default NominationSubmitted;
