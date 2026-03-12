import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import AIResponse from '@/components/AIResponse';
import { useAIStream } from '@/hooks/useAIStream';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { response, isLoading, error, query: aiQuery } = useAIStream();

  useEffect(() => {
    if (query) {
      aiQuery({ query, mode: 'search' });
    }
  }, [query]);

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-6 text-center">
          Scripture Search
        </h1>
        <SearchBar large />

        <div className="mt-8">
          <AIResponse
            content={response}
            isLoading={isLoading}
            error={error}
            placeholder={!query ? 'Enter a question or topic to search across religious traditions — "Is Jesus God?", "Genesis 1:1", "Quran Surah Al-Fatihah"' : undefined}
          />
        </div>
      </div>
    </div>
  );
}
