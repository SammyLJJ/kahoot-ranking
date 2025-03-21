import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { motion } from 'framer-motion';

export default function Home() {
  const [data, setData] = useState([]);
  const [topN, setTopN] = useState(3);
  const [showPodium, setShowPodium] = useState(false);
  const [animationData, setAnimationData] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationData((prevData) =>
        prevData.map((item) => {
          if (item.targetScore > item.currentScore) {
            return { ...item, currentScore: item.currentScore + 1 };
          }
          return item;
        })
      );
    }, 50);
    return () => clearInterval(interval);
  }, [animationData]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data.map((row) => ({
          name: row.name,
          targetScore: parseInt(row.score, 10),
          currentScore: 0,
        }));
        parsed.sort((a, b) => b.targetScore - a.targetScore);
        setData(parsed);
        setAnimationData(parsed.map((p) => ({ ...p, currentScore: 0 })));
      },
    });
  };

  const renderPodium = () => {
    const winners = animationData.slice(0, topN);
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-purple-600 to-pink-400 text-white">
        <h1 className="text-6xl font-bold mb-12 animate-bounce">🎉 领奖台 🎉</h1>
        <div className="flex gap-8 items-end">
          {winners.map((winner, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center justify-end bg-white text-black p-4 rounded-2xl shadow-xl w-40"
              animate={{ y: [100, 0], opacity: [0, 1] }}
              transition={{ duration: 0.8 }}
              style={{ height: `${300 - index * 60}px` }}
            >
              <div className="text-xl font-bold mb-2">{winner.name}</div>
              <div className="text-3xl font-extrabold">{winner.currentScore}</div>
              <div className="mt-2 text-sm text-gray-600">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-10 min-h-screen bg-gray-100">
      <audio ref={audioRef} src="/win.mp3" preload="auto" />
      {!showPodium ? (
        <div className="space-y-6">
          <h1 className="text-4xl font-bold">🏆 Kahoot 风格排行榜生成器</h1>
          <input type="file" accept=".csv" onChange={handleFileUpload} className="border p-2 rounded" />
          <div>
            <label className="font-semibold mr-2">领奖台人数:</label>
            <input
              type="number"
              value={topN}
              onChange={(e) => setTopN(parseInt(e.target.value))}
              className="border p-1 w-20 rounded"
              min={1}
              max={10}
            />
          </div>
          <button
            onClick={() => {
              setShowPodium(true);
              setTimeout(() => {
                if (audioRef.current) audioRef.current.play();
              }, 500);
            }}
            className="bg-blue-500 text-white p-2 rounded"
          >
            生成领奖台
          </button>
        </div>
      ) : (
        renderPodium()
      )}
    </div>
  );
}
