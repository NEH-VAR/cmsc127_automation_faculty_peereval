import React from 'react';
import { Linkedin, Mail, Github } from 'lucide-react';
import { useToast } from '../../lib/ToastContext';
import buhayan_image from "../../assets/images/buhayan-image.jpg"
import lorejo_image from "../../assets/images/lorejo-image.jpg"
// import { albinda_image } from "../../assets/images/albinda.jpg"
// import { grageda_image } from "../../assets/images/grageda.jpg"
// import { lumapas_image } from "../../assets/images/lumapas.jpg"

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
      <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/45 to-transparent"></div>

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
      name: "Juan Dela Cruz",
      role: "Project Manager guiding the technical roadmap and client coordination.",
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      email: "juan.delacruz@up.edu.ph",
      imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Maria Santos",
      role: "Lead System Architect ensuring system scalability and robust database design.",
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      email: "maria.santos@up.edu.ph",
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Ana Reyes",
      role: "Lead UI/UX Designer driving intuitive interfaces and accessible experiences.",
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      email: "ana.reyes@up.edu.ph",
      imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop"
    }
  ];

  const implementation = [
    {
      name: "Joseph Francis Buhayan",
      role: "Lead Developer and Backend Developer",
      linkedin: "https://www.linkedin.com/in/jospeh-buhayan/",
      github: "https://github.com/SenpaiCuber",
      email: "josephfrancisbuhayan@gmail.com",
      imageUrl: buhayan_image
    },
    {
      name: "Ravhen Grageda",
      role: "Frontend Developer and UI/UX Designer",
      linkedin: "https://linkedin.com/in/ravhen-grageda",
      github: "https://github.com",
      email: "rgrageda@up.edu.ph",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Charisse Lorejo",
      role: "UI/UX Designer and Frontend Developer",
      linkedin: "https://linkedin.com/in/cha-lorejo",
      github: "https://github.com/chalorejo",
      email: "charissecardineslorejo@gmail.com",
      imageUrl: lorejo_image
    },
    {
      name: "Alex Neal Albinda",
      role: "Backend Developer and Quality Assurance Specialist",
      linkedin: "https://linkedin.com/in/alex-neal-albinda",
      github: "https://github.com",
      email: "aalbinda@up.edu.ph",
      imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Nas John Lumapas",
      role: "Database Administrator and Backend Developer",
      linkedin: "https://linkedin.com/in/nas-john-lumapas",
      github: "https://github.com",
      email: "nlumapas@up.edu.ph",
      imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=600&auto=format&fit=crop"
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
          CMSC 186 | Driving the roadmap, scope, and technical vision.
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
