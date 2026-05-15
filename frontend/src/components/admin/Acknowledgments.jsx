import React from 'react';
import { User, MessageCircle } from 'lucide-react';

const ProfileCard = ({ name, role, stats, imageUrl }) => {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border-[4px] border-[#00563F] w-[260px] h-[400px] flex-shrink-0 bg-white shadow-sm">
      {/* Background Image */}
      <img 
        src={imageUrl} 
        alt={name}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/60 to-transparent"></div>
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end">
        <h3 className="text-white font-sans font-medium text-[15px] mb-1.5">{name}</h3>
        <p className="text-gray-300 font-sans text-[11px] leading-relaxed mb-5 pr-4">
          {role}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-3 text-gray-300 font-sans text-[10px] items-center">
            <span className="flex items-center gap-1.5">
              <User className="w-3 h-3" strokeWidth={2.5} />
              {stats.followers}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="w-3 h-3" strokeWidth={2.5} />
              {stats.messages}
            </span>
          </div>
          <button className="bg-[#7B1113] hover:bg-[#5a0c0e] text-white px-3 py-1.5 rounded-full text-[10px] font-medium transition-colors">
            Follow +
          </button>
        </div>
      </div>
    </div>
  );
};

const Acknowledgments = () => {
  const placeholderImage = "https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?q=80&w=600&auto=format&fit=crop";

  const leadership = Array(3).fill({
    name: "Sophie Bennett",
    role: "A Product Designer focused on intuitive user experiences.",
    stats: { followers: 312, messages: 48 },
    imageUrl: placeholderImage
  });

  const implementation = Array(5).fill({
    name: "Sophie Bennett",
    role: "A Product Designer focused on intuitive user experiences.",
    stats: { followers: 312, messages: 48 },
    imageUrl: placeholderImage
  });

  return (
    <div className="flex-1 flex flex-col items-center py-16 px-6 bg-white min-h-screen">
      
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

    </div>
  );
};

export default Acknowledgments;
