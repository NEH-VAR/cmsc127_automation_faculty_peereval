import React from 'react';
import Question from './Question';

const QuestionSection = ({id}) => {
    const sectionTable = {
        "section-1": {
          title: "A. Professional Knowledge",
          questions: [
            { type: "likert", text: "Knowledgeable in his/her field of specialization" },
            { type: "open", text: "Updates course content with recent developments" }
          ]
        }
    };

    const currentSection = sectionTable[id] || { title: "Section Not Found", questions: [] };

  return (
      <div>
        <h2 className="font-bold text-4 leading-[1.2] mb-4">{currentSection.title}</h2>

        <div className="flex flex-col gap-10">
            {currentSection.questions.map((q, index) => (
              <Question 
                key={`${id}-q-${index}`} 
                type={q.type} 
                question={q.text} 
              />
            ))}
        </div>

      </div>
    );
};

export default QuestionSection;
