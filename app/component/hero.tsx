"use client";

import { FiUser } from "react-icons/fi";



interface HeroProps {

  teacher1: { name: string };
  teacher2: { name: string };
  teacherIndices: [number, number];
  handleRank: (index1: number, index2: number) => void;
  voteCount: number;
  maxVotes: number;
}

const Hero: React.FC<HeroProps> = ({  teacher1, teacher2, teacherIndices, handleRank, voteCount, maxVotes }) => {
 

  return (
    <section className="flex flex-col items-center mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
        <div className="card bg-gray-800 rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300 p-4 sm:p-6">
          <FiUser className="text-white text-7xl sm:text-9xl" />
          <h2 className="text-center text-xl sm:text-2xl font-bold mt-4 sm:mt-6">{teacher1.name}</h2>
          <button
            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-full mt-6 sm:mt-8 shadow-lg transform hover:scale-105 transition-transform duration-300"
            onClick={() => handleRank(teacherIndices[0], teacherIndices[1])}
          >
            Vote for {teacher1.name}
          </button>
        </div>
        <div className="card bg-gray-800 rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300 p-4 sm:p-6">
          <FiUser className="text-white text-7xl sm:text-9xl" />
          <h2 className="text-center text-xl sm:text-2xl font-bold mt-4 sm:mt-6">{teacher2.name}</h2>
          <button
            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-full mt-6 sm:mt-8 shadow-lg transform hover:scale-105 transition-transform duration-300"
            onClick={() => handleRank(teacherIndices[1], teacherIndices[0])}
          >
            Vote for {teacher2.name}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
