import { useSearchParams } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import VerseCard from '@/components/VerseCard';
import { sampleQuranVerses, sampleBibleVerses, sampleEthiopianVerses } from '@/data/mockScriptures';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  // Mock search — in production this would be semantic search via pgvector
  const hasQuery = query.length > 0;

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-6 text-center">
          Scripture Search
        </h1>
        <SearchBar large />

        {hasQuery && (
          <div className="mt-8">
            <p className="text-sm text-muted-foreground mb-6">
              Showing results for "<span className="text-foreground font-medium">{query}</span>" across all scriptures
            </p>

            {/* Qur'an results */}
            <div className="mb-8">
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-scripture-quran" />
                Qur'an
              </h2>
              <div className="space-y-3">
                {sampleQuranVerses.slice(0, 2).map((v) => (
                  <VerseCard key={v.id} data={{ type: 'quran', verse: v }} />
                ))}
              </div>
            </div>

            {/* Bible results */}
            <div className="mb-8">
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-scripture-bible" />
                Bible
              </h2>
              <div className="space-y-3">
                {sampleBibleVerses.slice(0, 2).map((v) => (
                  <VerseCard key={v.id} data={{ type: 'bible', verse: v }} />
                ))}
              </div>
            </div>

            {/* Ethiopian Bible results */}
            <div className="mb-8">
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-scripture-ethiopian" />
                Ethiopian Bible
              </h2>
              <div className="space-y-3">
                {sampleEthiopianVerses.slice(0, 2).map((v) => (
                  <VerseCard key={v.id} data={{ type: 'ethiopian', verse: v }} />
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 mt-4">
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                🤖 AI Context
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered contextual explanations will appear here when connected to the backend. 
                The system will use semantic search across all scriptures to provide scholarly, 
                neutral context about your query.
              </p>
            </div>
          </div>
        )}

        {!hasQuery && (
          <div className="mt-16 text-center">
            <span className="text-5xl mb-4 block">🔍</span>
            <p className="text-muted-foreground">
              Enter a question or topic to search across the Qur'an, Bible, and Ethiopian Bible
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
