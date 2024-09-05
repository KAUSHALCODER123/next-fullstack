'use client';
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Hero from "@/app/component/hero";
import Image from "next/image";
export default function Home() {
  const { data: session, status } = useSession();

  const [teachers, setTeachers] = useState([]);
  const [teacherIndices, setTeacherIndices] = useState([0, 1]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize clickCount from localStorage or start at 0
  const [clickCount, setClickCount] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedClickCount = localStorage.getItem('clickCount');
      return savedClickCount ? parseInt(savedClickCount, 10) : 0;
    }
    return 0; // Fallback in case the window is not available
  });

  useEffect(() => {
    async function fetchTeachers() {
      try {
        const response = await fetch("/api/Teachers");
        if (!response.ok) {
          throw new Error("Failed to fetch teachers");
        }
        const data = await response.json();
        setTeachers(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTeachers();
  }, []);

  // Save clickCount to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('clickCount', clickCount);
    }
  }, [clickCount]);

  const calculateElo = (ratingA, ratingB, scoreA, gamesPlayedA, kBase = 32) => {
    const k = kBase / (1 + Math.log10(1 + gamesPlayedA));
    const expectedScoreA = 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
    return ratingA + k * (scoreA - expectedScoreA);
  };

  const handleRank = async (winnerIndex, loserIndex) => {
    if (clickCount >= 10) {
      return; // Stop ranking when click count exceeds the limit
    }

    const updatedTeachers = [...teachers];
    const winner = updatedTeachers[winnerIndex];
    const loser = updatedTeachers[loserIndex];

    const newWinnerScore = calculateElo(winner.Score, loser.Score, 1, winner.gamesPlayed);
    const newLoserScore = calculateElo(loser.Score, winner.Score, 0, loser.gamesPlayed);

    winner.Score = newWinnerScore;
    winner.gamesPlayed += 1;
    loser.Score = newLoserScore;
    loser.gamesPlayed += 1;

    setTeachers(updatedTeachers);

    try {
      await fetch(`/api/Teachers/${winner._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Score: winner.Score, gamesPlayed: winner.gamesPlayed }),
      });
      await fetch(`/api/Teachers/${loser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Score: loser.Score, gamesPlayed: loser.gamesPlayed }),
      });
    } catch (err) {
      setError(err.message);
    }

    // Increment click count
    setClickCount((prevCount) => prevCount + 1);

    // Update the teacher indices for the next pair
    setTeacherIndices((prevIndices) => {
      const nextIndex1 = (prevIndices[1] + 1) % updatedTeachers.length;
      const nextIndex2 = (nextIndex1 + 1) % updatedTeachers.length;
      return [nextIndex1, nextIndex2];
    });
  };

  const teacher1 = teachers[teacherIndices[0]] || {};
  const teacher2 = teachers[teacherIndices[1]] || {};
  const sortedTeachers = Array.isArray(teachers)
    ? [...teachers].sort((a, b) => b.Score - a.Score)
    : [];

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  // Conditionally render based on clickCount
  if (clickCount == 10) {
    return (
      <main className="text-white flex min-h-screen flex-col items-center justify-between p-6 sm:p-10 bg-gradient-to-b from-gray-900 to-gray-700">
        <h1>Welcome {session?.user?.name}</h1>
      
        <Image src='/vote.png' width='300' height='500' alt='Vote' />
        <p>You have reached the maximum of 10 clicks this session!</p>
      </main>
    );
  }

  return (
    <main className="text-white flex min-h-screen flex-col items-center justify-between p-6 sm:p-10 bg-gradient-to-b from-gray-900 to-gray-700">
      <p className="text-xl sm:text-2xl text-center">Welcome {session?.user?.email}</p>
     
      <p className="text-xl sm:text-2xl text-center">Vote Remaining: {10 -clickCount}</p>
 
      <Hero
        session={session}
        teacher1={teacher1}
        teacher2={teacher2}
        teacherIndices={teacherIndices}
        handleRank={handleRank}
        voteCount={0} // Define or remove if not needed
        maxVotes={10} // Define or remove if not needed
      />

      <table className="min-w-full bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden">
        <thead className="bg-gray-700 text-white">
          <tr>
            <th className="w-1/2 px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg">Name</th>
            <th className="w-1/2 px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg">Score</th>
           
          </tr>
        </thead>
        <tbody>
          {sortedTeachers.map((teacher, index) => (
            <tr key={teacher._id} className={`text-center ${index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800'}`}>
              <td className="border border-gray-700 px-4 sm:px-6 py-2 sm:py-4 text-sm sm:text-lg">{teacher.name}</td>
              <td className="border border-gray-700 px-4 sm:px-6 py-2 sm:py-4 text-sm sm:text-lg">{Math.ceil(teacher.Score)}</td>
             
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
