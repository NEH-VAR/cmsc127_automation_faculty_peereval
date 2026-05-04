import React, { useState } from 'react';
import NominationSubmitted from './client/NominationSubmitted';
const ClientAssurancePage = () => {


    return (
        <NominationSubmitted 
            title="Nomination Submitted!" 
            message="You will be notified once the peer evaluation phase commences." 
        />
  );
};

export default ClientAssurancePage;
