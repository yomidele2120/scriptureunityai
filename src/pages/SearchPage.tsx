import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BibleResult {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
}

interface QuranResult {
  id: string;
  surah_no: number;
  surah_name_en: string;
  surah_name_roman: string | null;
  ayah_no: number;
  text_en: string;
  text_ar: string | null;
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [bibleResults, setBibleResults] = useState<BibleResult[]>([]);
  const [quranResults, setQuranResults] = useState<QuranResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [parsedParams, setParsedParams] = useState<any>(null);

  const doSearch = async (q: string) => {
    if (!q.trim()) return;
    setIsSearching(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase.functions.invoke('scripture-search', {
        body: { query: q },
      });

      if (error) {
        toast.error('Search failed: ' + error.message);
        return;
      }

      setBibleResults(data.results?.bible || []);
      setQuranResults(data.results?.quran || []);
      setParsedParams(data.parsed);
    } catch (err: any) {
      toast.error('Search error: ' + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  // Auto-search when query param changes
  useState(() => {
    if (query) doSearch(query);
  });

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-6 text-center">
          Scripture Search
        </h1>
        <SearchBar large />

        {isSearching && (
          <div className="mt-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Searching scriptures with AI...</p>
          </div>
        )}

        {hasSearched && !isSearching && (
          <div className="mt-8">
            <p className="text-sm text-muted-foreground mb-6">
              Showing results for "<span className="text-foreground font-medium">{query}</span>"
              {parsedParams && (
                <span className="text-xs ml-2">
                  (source: {parsedParams.source}
                  {parsedParams.book && `, book: ${parsedParams.book}`}
                  {parsedParams.chapter && `, ch: ${parsedParams.chapter}`}
                  {parsedParams.verse && `, v: ${parsedParams.verse}`}
                  {parsedParams.keyword && `, keyword: ${parsedParams.keyword}`})
                </span>
              )}
            </p>

            {/* Bible results */}
            {bibleResults.length > 0 && (
              <div className="mb-8">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-scripture-bible" />
                  Bible ({bibleResults.length} results)
                </h2>
                <div className="space-y-3">
                  {bibleResults.map((v) => (
                    <div key={v.id} className="bg-card border border-border rounded-lg p-4">
                      <p className="text-sm font-medium text-primary mb-1">
                        {v.book} {v.chapter}:{v.verse}
                        <span className="text-xs text-muted-foreground ml-2">({v.translation})</span>
                      </p>
                      <p className="text-foreground text-sm leading-relaxed">{v.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quran results */}
            {quranResults.length > 0 && (
              <div className="mb-8">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-scripture-quran" />
                  Qur'an ({quranResults.length} results)
                </h2>
                <div className="space-y-3">
                  {quranResults.map((v) => (
                    <div key={v.id} className="bg-card border border-border rounded-lg p-4">
                      <p className="text-sm font-medium text-primary mb-1">
                        Surah {v.surah_name_en} ({v.surah_name_roman}) {v.surah_no}:{v.ayah_no}
                      </p>
                      {v.text_ar && (
                        <p className="text-foreground text-base leading-relaxed mb-2 text-right font-arabic" dir="rtl">
                          {v.text_ar}
                        </p>
                      )}
                      <p className="text-foreground text-sm leading-relaxed">{v.text_en}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bibleResults.length === 0 && quranResults.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No results found. Try a different query.</p>
              </div>
            )}
          </div>
        )}

        {!hasSearched && !query && (
          <div className="mt-16 text-center">
            <span className="text-5xl mb-4 block">🔍</span>
            <p className="text-muted-foreground">
              Enter a question or topic to search across the Qur'an and Bible
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
