'use client';
// RandomQuoteCard.tsx
import React, { useEffect, useState } from "react";

const quotes = [
  "The best way to get started is to quit talking and begin doing.",
  "Don’t let yesterday take up too much of today.",
  "It’s not whether you get knocked down, it’s whether you get up.",
  "If you are working on something exciting, it will keep you motivated.",
  "Success is not in what you have, but who you are.",
];

const getRandomQuote = () =>
  quotes[Math.floor(Math.random() * quotes.length)];

const RandomQuoteCard: React.FC = () => {
  const [quote, setQuote] = useState<string>("");

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-center text-blue-600">
        Random Quote
      </h2>
      <p className="text-gray-700 text-center italic">"{quote}"</p>
      <button
        onClick={() => setQuote(getRandomQuote())}
        className="mt-6 block mx-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        New Quote
      </button>
    </div>
  );
};

export default RandomQuoteCard;
