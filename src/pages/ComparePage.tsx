import { useState } from 'react';
import { motion } from 'framer-motion';
import AIResponse from '@/components/AIResponse';
import { useAIStream } from '@/hooks/useAIStream';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const quickCompare = [
  'Bible vs Quran',
  'Christianity vs Islam vs Judaism',
  'Jesus in Christianity vs Islam vs Judaism',
  'Concept of God across religions',
  'Salvation in Christianity vs Islam',
  'Prayer in Christianity vs Islam vs Judaism',
  'Fasting in Christianity vs Islam',
  'Trinity vs Tawhid',
  'Prophets in Christianity vs Islam',
  'Afterlife beliefs across religions',
];

const debateQuestions = [
  'Is Jesus God?',
  'Do Jews believe Jesus is the Messiah?',
  'Was Jesus crucified?',
  'Which religion came first?',
  'What is the difference between Trinity and Tawhid?',
  'Is the Bible or Quran more historically accurate?',
  'Do all religions worship the same God?',
];

export default function ComparePage() {
  const { response, isLoading, error, query: aiQuery } = useAIStream();
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [customQuery, setCustomQuery] = useState('');

  const handleCompare = (q: string) => {
    setActiveQuery(q);
    aiQuery({ query: q, mode: 'compare' });
  };

  const handleDebate = (q: string) => {
    setActiveQuery(q);
    aiQuery({ query: q, mode: 'debate' });
  };

  const handleCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuery.trim()) {
      handleCompare(customQuery.trim());
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2 text-center">
            Compare & Debate
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            AI-powered religious comparison and theological debate — click any topic or ask your own question
          </p>
        </motion.div>

        {/* Custom comparison input */}
        <form onSubmit={handleCustom} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="Enter your own comparison or debate question..."
              className="flex-1 bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <button
              type="submit"
              disabled={isLoading || !customQuery.trim()}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              Compare
            </button>
          </div>
        </form>

        {/* Quick comparisons */}
        <div className="mb-6">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-3">⚖️ Quick Comparisons</h2>
          <div className="flex flex-wrap gap-2">
            {quickCompare.map((q) => (
              <button
                key={q}
                onClick={() => handleCompare(q)}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeQuery === q
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent/20'
                } disabled:opacity-50`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Debate questions */}
        <div className="mb-8">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-3">🔥 Debate Questions</h2>
          <div className="flex flex-wrap gap-2">
            {debateQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleDebate(q)}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeQuery === q
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent/20'
                } disabled:opacity-50`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <AIResponse
          content={response}
          isLoading={isLoading}
          error={error}
          placeholder="Click a comparison or debate topic above, or enter your own question to get a detailed AI analysis."
        />
      </div>
    </div>
  );
}
