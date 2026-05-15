import React from 'react';
import { Linkedin, Mail } from 'lucide-react';
import lorejo_image from "../../assets/images/lorejo-image.jpg"
// import { albinda_image } from "../../assets/images/albinda.jpg"
// import { buhayan_image } from "../../assets/images/buhayan.jpg"
// import { grageda_image } from "../../assets/images/grageda.jpg"
// import { lumapas_image } from "../../assets/images/lumapas.jpg"

const ProfileCard = ({ name, role, stats, imageUrl }) => {
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
          <a href="#" aria-label="LinkedIn Profile" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-colors text-gray-300">
            <Linkedin className="w-4 h-4" />
          </a>
          <a href="#" aria-label="Email" className="w-8 h-8 rounded-full bg-[#7B1113] flex items-center justify-center hover:bg-[#5a0c0e] transition-colors text-white">
            <Mail className="w-4 h-4" />
          </a>
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
      stats: { followers: 412, messages: 89 },
      imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Maria Santos",
      role: "Lead System Architect ensuring system scalability and robust database design.",
      stats: { followers: 384, messages: 62 },
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Ana Reyes",
      role: "Lead UI/UX Designer driving intuitive interfaces and accessible experiences.",
      stats: { followers: 521, messages: 104 },
      imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop"
    }
  ];

  const implementation = [
    {
      name: "Joseph Francis Buhayan",
      role: "Lead Developer and Backend Developer ",
      stats: { followers: 215, messages: 34 },
      imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Ravhen Grageda",
      role: "Frontend Developer and UI/UX Designer",
      stats: { followers: 189, messages: 45 },
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Charisse Lorejo",
      role: "UI/UX Designer and Frontend Developer",
      stats: { followers: 276, messages: 58 },
      imageUrl: lorejo_image
    },
    {
      name: "Alex Neal Albinda",
      role: "Backend Developer and Quality Assurance Specialist",
      stats: { followers: 154, messages: 21 },
      imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Nas John Lumapas",
      role: "Database Administrator and Backend Developer",
      stats: { followers: 198, messages: 37 },
      imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=600&auto=format&fit=crop"
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center py-16 px-6 bg-white min-h-screen">

      {/* Strategic Leadership Section */}

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
