import { Helmet } from 'react-helmet';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAIStream } from '@/hooks/useAIStream';

// Scripture structure data
const bibleBooks = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
  'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
  'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
  'Ephesians', 'Philippians', 'Colossians',
  '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
  'Titus', 'Philemon', 'Hebrews', 'James',
  '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation',
];

const bibleChapterCounts: Record<string, number> = {
  Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34,
  Joshua: 24, Judges: 21, Ruth: 4, '1 Samuel': 31, '2 Samuel': 24,
  '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36,
  Ezra: 10, Nehemiah: 13, Esther: 10, Job: 42, Psalms: 150, Proverbs: 31,
  Ecclesiastes: 12, 'Song of Solomon': 8, Isaiah: 66, Jeremiah: 52,
  Lamentations: 5, Ezekiel: 48, Daniel: 12, Hosea: 14, Joel: 3,
  Amos: 9, Obadiah: 1, Jonah: 4, Micah: 7, Nahum: 3, Habakkuk: 3,
  Zephaniah: 3, Haggai: 2, Zechariah: 14, Malachi: 4,
  Matthew: 28, Mark: 16, Luke: 24, John: 21, Acts: 28,
  Romans: 16, '1 Corinthians': 16, '2 Corinthians': 13, Galatians: 6,
  Ephesians: 6, Philippians: 4, Colossians: 4, '1 Thessalonians': 5,
  '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4,
  Titus: 3, Philemon: 1, Hebrews: 13, James: 5,
  '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1,
  Jude: 1, Revelation: 22,
};

const ethiopianBooks = [
  '1 Enoch', '2 Enoch', 'Jubilees', '1 Meqabyan', '2 Meqabyan', '3 Meqabyan',
  'Sirach', 'Wisdom of Solomon', 'Tobit', 'Judith', 'Baruch',
  '1 Esdras', '2 Esdras', 'Prayer of Manasseh',
];

const ethiopianChapterCounts: Record<string, number> = {
  '1 Enoch': 108, '2 Enoch': 100, Jubilees: 50, '1 Meqabyan': 36,
  '2 Meqabyan': 24, '3 Meqabyan': 32, Sirach: 51, 'Wisdom of Solomon': 19,
  Tobit: 14, Judith: 16, Baruch: 6, '1 Esdras': 9, '2 Esdras': 16,
  'Prayer of Manasseh': 1,
};


const quranSurahs = Array.from({ length: 114 }, (_, i) => `Surah ${i + 1}`);


const scriptureTypes: Record<string, { title: string; books: string[]; color: string }> = {
  bible: { title: 'The Holy Bible', books: bibleBooks, color: 'scripture-bible' },
  quran: { title: 'The Holy Quran', books: quranSurahs, color: 'scripture-quran' },
  other: { title: 'Ethiopian & Other Scriptures', books: ethiopianBooks, color: 'scripture-ethiopian' },
};

function getBookChapterCount(type: string, book: string): number {
  if (type === 'bible') return bibleChapterCounts[book] || 1;
  if (type === 'other') return ethiopianChapterCounts[book] || 1;
  if (type === 'quran') return 1; // quran surah selection is chapter-level already
  return 1;
}

export default function ScriptureReaderPage() {
  const { type, bookSlug, chapter } = useParams<{ type: string; bookSlug?: string; chapter?: string }>();
  const navigate = useNavigate();

  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  const scripture = type ? scriptureTypes[type] : null;

  const normalizedBook = useMemo(() => {
    if (!bookSlug) return null;
    return decodeURIComponent(bookSlug);
  }, [bookSlug]);

  useEffect(() => {
    if (normalizedBook) {
      setSelectedBook(normalizedBook);
      if (chapter) {
        const chapNum = parseInt(chapter, 10);
        if (!Number.isNaN(chapNum)) {
          setSelectedChapter(chapNum);
        }
      } else {
        setSelectedChapter(null);
      }
    }
  }, [normalizedBook, chapter]);

  const [scriptureResponse, setScriptureResponse] = useState('');
  const { response, isLoading, error, query: aiQuery } = useAIStream();

  const targetChapter = selectedChapter || 1;

  useEffect(() => {
    if (!scripture || !selectedBook) return;

    const typeForPrompt = type === 'quran' ? 'Quran' : type === 'bible' ? 'Bible' : 'Ethiopian scripture';
    let queryStr = '';

    if (type === 'quran') {
      const surahNumberMatch = selectedBook.match(/(\d+)/);
      const surahNumber = surahNumberMatch ? Number(surahNumberMatch[0]) : null;
      queryStr = `Provide the entire Surah ${selectedBook} (${surahNumber || ''}) from the Quran in Arabic with verse numbering and Sahih International English translation per ayah. Include proper reference for each ayah.`;
    } else {
      queryStr = `Provide the complete text for ${typeForPrompt} book "${selectedBook}", chapter ${targetChapter}. Include verse numbers and exact references in the form ${selectedBook} ${targetChapter}:<verse>.`;    }

    aiQuery({ query: queryStr, mode: 'scripture', language: 'en' });
  }, [scripture, selectedBook, selectedChapter, type, targetChapter, aiQuery]);

  useEffect(() => {
    setScriptureResponse(response);
  }, [response]);

  if (!scripture) {
    return (
      <div className="min-h-screen py-16 text-center">
        <p className="text-muted-foreground">Scripture type not found.</p>
        <Link to="/" className="text-primary mt-4 inline-block">← Return Home</Link>
      </div>
    );
  }

  const chapterCount = selectedBook ? getBookChapterCount(type || '', selectedBook) : 0;

  return (
    <>
      <Helmet>
        <title>{scripture.title} — Scripture Unity AI</title>
        <meta name="description" content={`Read ${scripture.title} with full chapters and verses.`} />
      </Helmet>
      <div className="min-h-screen py-8">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
          </div>

          <div className="text-center mb-10">
            <BookOpen className={`h-12 w-12 text-${scripture.color} mx-auto mb-4`} />
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              {scripture.title}
            </h1>
            <p className="text-muted-foreground mt-2">
              Select a book to begin reading
            </p>
          </div>

          {selectedBook ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <button
                onClick={() => {
                  setSelectedBook(null);
                  setSelectedChapter(null);
                  navigate(`/read/${type}`);
                }}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
              >
                <ArrowLeft className="h-4 w-4" /> All Books
              </button>

              <div className="bg-card border border-border rounded-xl p-6 md:p-10 mb-6">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-2">{scripture.title}</h2>
                <p className="text-muted-foreground">{selectedBook} {type !== 'quran' && selectedChapter ? `- Chapter ${selectedChapter}` : ''}</p>
              </div>

              {type !== 'quran' && (
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-2">Select Chapter</h3>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                    {Array.from({ length: chapterCount }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => {
                          setSelectedChapter(num);
                          navigate(`/read/${type}/${encodeURIComponent(selectedBook)}/${num}`);
                        }}
                        className={`rounded-md px-2 py-1 text-sm ${selectedChapter === num ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-primary/10'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Scripture Passage</h3>
                <p className="text-muted-foreground text-sm mb-4">AI-generated content (using source mode “scripture”).</p>
                {isLoading ? (
                  <p className="text-muted-foreground">Loading chapter content...</p>
                ) : error ? (
                  <p className="text-destructive">{error}</p>
                ) : scriptureResponse ? (
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{scriptureResponse}</pre>
                ) : (
                  <p className="text-muted-foreground">Select a chapter to load content.</p>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {scripture.books.map((book, i) => (
                <motion.button
                  key={book}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.5) }}
                  onClick={() => setSelectedBook(book)}
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:glow-border transition-all text-left group"
                >
                  <span className="font-heading text-foreground font-medium">{book}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
