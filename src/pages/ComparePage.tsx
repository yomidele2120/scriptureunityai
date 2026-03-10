import { useState } from 'react';
import VerseCard from '@/components/VerseCard';
import { sampleQuranVerses, sampleBibleVerses, sampleEthiopianVerses } from '@/data/mockScriptures';

const scriptureOptions = [
  { value: 'bible', label: 'Bible' },
  { value: 'ethiopian', label: 'Ethiopian Bible' },
  { value: 'quran', label: "Qur'an" },
] as const;

export default function ComparePage() {
  const [leftSource, setLeftSource] = useState<string>('bible');
  const [rightSource, setRightSource] = useState<string>('quran');

  function getVerses(source: string) {
    switch (source) {
      case 'quran': return sampleQuranVerses.map(v => ({ type: 'quran' as const, verse: v }));
      case 'bible': return sampleBibleVerses.map(v => ({ type: 'bible' as const, verse: v }));
      case 'ethiopian': return sampleEthiopianVerses.map(v => ({ type: 'ethiopian' as const, verse: v }));
      default: return [];
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-6xl">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2 text-center">
          Compare Scriptures
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          View verses side-by-side across different traditions
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left column */}
          <div>
            <select
              value={leftSource}
              onChange={(e) => setLeftSource(e.target.value)}
              className="w-full mb-4 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              {scriptureOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div className="space-y-3">
              {getVerses(leftSource).slice(0, 3).map((data, i) => (
                <VerseCard key={i} data={data} />
              ))}
            </div>
          </div>

          {/* Right column */}
          <div>
            <select
              value={rightSource}
              onChange={(e) => setRightSource(e.target.value)}
              className="w-full mb-4 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              {scriptureOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div className="space-y-3">
              {getVerses(rightSource).slice(0, 3).map((data, i) => (
                <VerseCard key={i} data={data} />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5 mt-8">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
            🤖 AI Comparison Summary
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            When connected to the AI backend, this section will display a neutral, scholarly 
            comparison summary highlighting shared themes and respectful differences between 
            the selected scriptures.
          </p>
        </div>
      </div>
    </div>
  );
}
