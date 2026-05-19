import React from 'react';
import { Linkedin, Mail, Github } from 'lucide-react';
import { useToast } from '../../lib/ToastContext';
//Developers Pictures
import buhayan_image from "../../assets/images/buhayan-image.jpg"
import lorejo_image from "../../assets/images/lorejo-image.jpg"
import grageda_image from "../../assets/images/grageda-image.jpg"
import albinda_image from "../../assets/images/albinda-image.jpg"
import lumapas_image from "../../assets/images/lumapas-image.jpg"

//Project Manager Picture
import tampugao_image from "../../assets/images/tampugao-image.jpg"
import siapuatco_image from "../../assets/images/siapuatco-image.jpg"
import abot_image from "../../assets/images/abot-image.jpg"


const ProfileCard = ({ name, role, imageUrl, linkedin, github, email }) => {
  const { showToast } = useToast();

  const handleCopyEmail = (e) => {
    e.preventDefault();
    if (email) {
      navigator.clipboard.writeText(email);
      showToast({
        type: 'success',
        title: 'Copied!',
        message: 'Email address has been copied to your clipboard.'
      });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border-[2px]  w-[260px] h-[400px] flex-shrink-0 bg-white shadow-sm">
      {/* Background Image */}
      <img
        src={imageUrl}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/20 to-transparent"></div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end">
        <h3 className="text-white font-sans font-medium text-[15px] mb-1.5">{name}</h3>
        <p className="text-gray-300 font-sans text-[11px] leading-relaxed mb-5 pr-4">
          {role}
        </p>

        <div className="flex items-center justify-end gap-2.5 mt-1">
          {github && (
            <a href={github} target="_blank" rel="noreferrer" aria-label="GitHub Profile" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#333] hover:text-white transition-colors text-gray-300">
              <Github className="w-4 h-4" />
            </a>
          )}
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn Profile" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-colors text-gray-300">
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {email && (
            <button onClick={handleCopyEmail} aria-label="Copy Email" className="w-8 h-8 rounded-full bg-[#7B1113] flex items-center justify-center hover:bg-[#5a0c0e] transition-colors text-white">
              <Mail className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Acknowledgments = () => {
  const leadership = [
    {
      name: "Mohammad Muraya S. Tampugao",
      role: "Project Manager",
      linkedin: "https://www.linkedin.com/in/mm-tampugao?",
      github: "https://github.com/EmTampz",
      email: "mmtampugao@gmail.com",
      imageUrl: tampugao_image
    },
    {
      name: "Aaron Dave A. Siapuatco",
      role: "Project Manager",
      linkedin: "https://www.linkedin.com/in/aarondavesiapuatco/",
      github: "https://github.com/ewandeyb",
      email: "aaronsiapuatco@gmail.com",
      imageUrl: siapuatco_image
    },
    {
      name: "Gracie Anne R. Abot",
      role: "Project Manager",
      linkedin: "www.linkedin.com/in/gracieanneabot",
      github: "https://github.com/girlaliiing",
      email: "abotgracieanne2@gmail.com",
      imageUrl: abot_image
    }
  ];

  const implementation = [
    {
      name: "Joseph Francis D. Buhayan",
      role: "Lead Developer and Backend Developer",
      linkedin: "https://www.linkedin.com/in/jospeh-buhayan/",
      github: "https://github.com/SenpaiCuber",
      email: "josephfrancisbuhayan@gmail.com",
      imageUrl: buhayan_image
    },
    {
      name: "Ravhen M. Grageda",
      role: "Frontend Developer and UI/UX Designer",
      linkedin: "https://www.linkedin.com/in/nehvar/Github",
      github: "https://github.com/NEH-VAR/",
      email: "ravhen.yt@gmail.com",
      imageUrl: grageda_image
    },
    {
      name: "Charisse C. Lorejo",
      role: "UI/UX Designer and Frontend Developer",
      linkedin: "https://linkedin.com/in/cha-lorejo",
      github: "https://github.com/chalorejo",
      email: "charissecardineslorejo@gmail.com",
      imageUrl: lorejo_image
    },
    {
      name: "Alex Neal R. Albinda",
      role: "Backend Developer and Quality Assurance Specialist",
      linkedin: "https://www.linkedin.com/in/alasdiel",
      github: "https://www.github.com/alasdiel",
      email: "alex.albinda9@gmail.com",
      imageUrl: albinda_image
    },
    {
      name: "Nas John D. Lumapas",
      role: "Database Administrator and Backend Developer",
      linkedin: "https://www.linkedin.com/in/nj0104/",
      github: "https://github.com/NJ0104",
      email: "lumapasnasjohn@gmail.com",
      imageUrl: lumapas_image
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center py-16 px-6 bg-white min-h-screen">

      {/* The Implementation Team Section */}
      <div className="w-full max-w-5xl flex flex-col items-center mb-16">
        <h2 className="text-2xl font-heading text-[#00563F] mb-3">
          The Implementation Team
        </h2>
        <p className="text-[13px] font-sans text-[#222222] mb-10">
          CMSC 127 | Transforming requirements into functional code.
        </p>

        <div className="flex flex-wrap justify-center gap-6 max-w-[850px]">
          {implementation.map((person, idx) => (
            <ProfileCard key={`impl-${idx}`} {...person} />
          ))}
        </div>
      </div>

      {/* Strategic Leadership Section */}
      <div className="w-full max-w-5xl flex flex-col items-center mb-16">
        <h2 className="text-2xl font-heading text-[#00563F] mb-3">
          Strategic Leadership
        </h2>
        <p className="text-[13px] font-sans text-[#222222] mb-10">
          CMSC 183 | Driving the roadmap, scope, and technical vision.
        </p>

        <div className="flex flex-wrap justify-center gap-6">
          {leadership.map((person, idx) => (
            <ProfileCard key={`lead-${idx}`} {...person} />
          ))}
        </div>
      </div>

    </div>
  );
};

export default Acknowledgments;
