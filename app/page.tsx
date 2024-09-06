'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image'; // Ensure you have this import if you're using Next.js
import Hero from '@/app/component/hero'; // Adjust the path based on your project structure


interface Teacher {
  _id: string;
  name: string;
  Score: number;
  gamesPlayed: number;
}

export default function Home() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherIndices, setTeacherIndices] = useState<[number, number]>([0, 1]);
  const [availableIndices, setAvailableIndices] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize clickCount from localStorage or start at 0
  const [clickCount, setClickCount] = useState<number>(() => {
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
        // Initialize available indices when teachers are fetched
        const indices = Array.from({ length: data.data.length }, (_, i) => i);

        setAvailableIndices(shuffleArray(indices));
      } catch (err: any) {
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
      localStorage.setItem('clickCount', clickCount.toString());
    }
  }, [clickCount]);

  // Function to shuffle the array
  const shuffleArray = (array: number[]): number[] => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const calculateElo = (
    ratingA: number,
    ratingB: number,
    scoreA: number,
    gamesPlayedA: number,
    kBase: number = 32
  ): number => {
    const k = kBase / (1 + Math.log10(1 + gamesPlayedA));
    const expectedScoreA = 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
    return ratingA + k * (scoreA - expectedScoreA);
  };

  const handleRank = async (winnerIndex: number, loserIndex: number) => {
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
    } catch (err: any) {
      setError(err.message);
    }

    // Increment click count
    setClickCount((prevCount) => prevCount + 1);

    // Update the teacher indices for the next pair
    setTeacherIndices((prevIndices) => {
      if (availableIndices.length < 2) {
        // If fewer than two indices are left, reshuffle
        const reshuffledIndices = shuffleArray(Array.from({ length: updatedTeachers.length }, (_, i) => i));

        setAvailableIndices(reshuffledIndices);
      }

      // Get two unique random indices
      const [nextIndex1, nextIndex2, ...remainingIndices] = availableIndices;
      setAvailableIndices(remainingIndices);
      return [nextIndex1, nextIndex2];
    });
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  // Prepare the teachers to display
  const teacher1 = teachers[teacherIndices[0]];
  const teacher2 = teachers[teacherIndices[1]];
  
  const sortedTeachers = [...teachers].sort((a, b) => b.Score - a.Score);

  if (clickCount === 90) {
    return (
      <main className="text-white flex min-h-screen flex-col items-center justify-between p-6 sm:p-10 bg-gradient-to-b from-gray-900 to-gray-700">
        <h1>Welcome</h1>
        <Image src='/vote.png' width={300} height={500} alt='Vote' />
        <p>You have reached the maximum of 10 clicks this session!</p>
      </main>
    );
  }

  return (
    <main className="text-white flex min-h-screen flex-col items-center justify-between p-6 sm:p-10 bg-gradient-to-b from-gray-900 to-gray-700">
      <p className="text-xl sm:text-2xl text-center">Welcome from below 2 cards vote your fav teacher</p>
      <p className="text-xl sm:text-2xl text-center">Vote Remaining: {10 - clickCount}</p>

      <Hero
        teacher1={teacher1}
        teacher2={teacher2}
        teacherIndices={teacherIndices}
        handleRank={handleRank}
        voteCount={clickCount}
        maxVotes={10}
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
