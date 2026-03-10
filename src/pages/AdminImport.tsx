import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// OSIS book ID to full name mapping
const OSIS_BOOK_NAMES: Record<string, string> = {
  Gen: 'Genesis', Exod: 'Exodus', Lev: 'Leviticus', Num: 'Numbers', Deut: 'Deuteronomy',
  Josh: 'Joshua', Judg: 'Judges', Ruth: 'Ruth', '1Sam': '1 Samuel', '2Sam': '2 Samuel',
  '1Kgs': '1 Kings', '2Kgs': '2 Kings', '1Chr': '1 Chronicles', '2Chr': '2 Chronicles',
  Ezra: 'Ezra', Neh: 'Nehemiah', Esth: 'Esther', Job: 'Job', Ps: 'Psalms', Psa: 'Psalms',
  Prov: 'Proverbs', Eccl: 'Ecclesiastes', Song: 'Song of Solomon', Isa: 'Isaiah',
  Jer: 'Jeremiah', Lam: 'Lamentations', Ezek: 'Ezekiel', Dan: 'Daniel', Hos: 'Hosea',
  Joel: 'Joel', Amos: 'Amos', Obad: 'Obadiah', Jonah: 'Jonah', Mic: 'Micah',
  Nah: 'Nahum', Hab: 'Habakkuk', Zeph: 'Zephaniah', Hag: 'Haggai', Zech: 'Zechariah',
  Mal: 'Malachi', Matt: 'Matthew', Mark: 'Mark', Luke: 'Luke', John: 'John',
  Acts: 'Acts', Rom: 'Romans', '1Cor': '1 Corinthians', '2Cor': '2 Corinthians',
  Gal: 'Galatians', Eph: 'Ephesians', Phil: 'Philippians', Col: 'Colossians',
  '1Thess': '1 Thessalonians', '2Thess': '2 Thessalonians', '1Tim': '1 Timothy',
  '2Tim': '2 Timothy', Titus: 'Titus', Phlm: 'Philemon', Heb: 'Hebrews',
  Jas: 'James', '1Pet': '1 Peter', '2Pet': '2 Peter', '1John': '1 John',
  '2John': '2 John', '3John': '3 John', Jude: 'Jude', Rev: 'Revelation',
  // Deuterocanonical / Apocrypha
  Tob: 'Tobit', Jdt: 'Judith', AddEsth: 'Additions to Esther', Wis: 'Wisdom of Solomon',
  Sir: 'Sirach', Bar: 'Baruch', EpJer: 'Letter of Jeremiah', PrAzar: 'Prayer of Azariah',
  Sus: 'Susanna', Bel: 'Bel and the Dragon', '1Macc': '1 Maccabees', '2Macc': '2 Maccabees',
  '3Macc': '3 Maccabees', '4Macc': '4 Maccabees', '1Esd': '1 Esdras', '2Esd': '2 Esdras',
  PrMan: 'Prayer of Manasseh', AddPs: 'Additional Psalms',
  // Additional abbreviations
  PSA: 'Psalms', GEN: 'Genesis', EXO: 'Exodus', LEV: 'Leviticus',
  MRK: 'Mark', MRk: 'Mark', PHM: 'Philemon', Phm: 'Philemon',
  SNG: 'Song of Solomon', LAM: 'Lamentations', OBA: 'Obadiah',
  NAM: 'Nahum', HAB: 'Habakkuk', ZEP: 'Zephaniah', HAG: 'Haggai',
  ZEC: 'Zechariah', MAL: 'Malachi', MAT: 'Matthew', LUK: 'Luke',
  JHN: 'John', ACT: 'Acts', ROM: 'Romans', GAL: 'Galatians',
  EPH: 'Ephesians', PHP: 'Philippians', COL: 'Colossians',
  TIT: 'Titus', HEB: 'Hebrews', JAS: 'James', JDE: 'Jude',
  REV: 'Revelation', EST: 'Esther', RUT: 'Ruth',
};

function getBookName(osisId: string): string {
  return OSIS_BOOK_NAMES[osisId] || osisId;
}

interface ParsedVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  canon_type: string;
}

function parseOSIS(xmlText: string, translationName: string, canonType: string): ParsedVerse[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  const verses: ParsedVerse[] = [];
  
  // Find all verse start elements with sID
  const allVerseStarts = doc.querySelectorAll('verse[sID]');
  
  allVerseStarts.forEach((verseStart) => {
    const osisID = verseStart.getAttribute('osisID') || verseStart.getAttribute('sID') || '';
    const parts = osisID.split('.');
    if (parts.length < 3) return;
    
    const bookId = parts[0];
    const chapter = parseInt(parts[1], 10);
    const verseNum = parseInt(parts[2], 10);
    
    if (isNaN(chapter) || isNaN(verseNum)) return;
    
    // Collect text between sID and eID
    let textContent = '';
    let node: Node | null = verseStart.nextSibling;
    const eID = verseStart.getAttribute('sID');
    
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        if (el.tagName === 'verse' && el.getAttribute('eID')) {
          break;
        }
        // Get text content from child elements (skip tags like <transChange>, <divineName>, etc.)
        textContent += el.textContent || '';
      } else if (node.nodeType === Node.TEXT_NODE) {
        textContent += node.textContent || '';
      }
      node = node.nextSibling;
    }
    
    const cleanText = textContent.replace(/\s+/g, ' ').trim();
    if (!cleanText) return;
    
    verses.push({
      book: getBookName(bookId),
      chapter,
      verse: verseNum,
      text: cleanText,
      translation: translationName,
      canon_type: canonType,
    });
  });
  
  return verses;
}

export default function AdminImport() {
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [translationName, setTranslationName] = useState('KJV');
  const [canonType, setCanonType] = useState('Protestant');

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setStatus('Please select an XML file');
      return;
    }

    setIsImporting(true);
    setStatus('Reading file...');
    
    try {
      const xmlText = await file.text();
      setStatus('Parsing OSIS XML...');
      
      const verses = parseOSIS(xmlText, translationName, canonType);
      setTotal(verses.length);
      setStatus(`Parsed ${verses.length} verses. Uploading...`);

      // Send in batches of 1000 to edge function
      const batchSize = 1000;
      let uploaded = 0;

      for (let i = 0; i < verses.length; i += batchSize) {
        const batch = verses.slice(i, i + batchSize);
        const { data, error } = await supabase.functions.invoke('import-bible-verses', {
          body: { verses: batch },
        });

        if (error) {
          setStatus(`Error at batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
          setIsImporting(false);
          return;
        }

        uploaded += batch.length;
        setProgress(uploaded);
        setStatus(`Uploaded ${uploaded} / ${verses.length} verses...`);
      }

      setStatus(`✅ Import complete! ${uploaded} verses imported for ${translationName}.`);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-6">Bible Data Import</h1>
        <p className="text-muted-foreground mb-6">
          Upload OSIS XML files to import Bible verses into the database.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Translation Name</label>
            <select
              value={translationName}
              onChange={(e) => setTranslationName(e.target.value)}
              className="w-full border border-border rounded-md p-2 bg-card text-foreground"
              disabled={isImporting}
            >
              <option value="KJV">King James Version (KJV)</option>
              <option value="OEB">Open English Bible (OEB)</option>
              <option value="ASV">American Standard Version (ASV)</option>
              <option value="WEB">World English Bible (WEB)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Canon Type</label>
            <select
              value={canonType}
              onChange={(e) => setCanonType(e.target.value)}
              className="w-full border border-border rounded-md p-2 bg-card text-foreground"
              disabled={isImporting}
            >
              <option value="Protestant">Protestant</option>
              <option value="Catholic">Catholic</option>
              <option value="Orthodox">Orthodox</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">OSIS XML File</label>
            <input
              type="file"
              accept=".xml"
              ref={fileRef}
              className="w-full border border-border rounded-md p-2 bg-card text-foreground"
              disabled={isImporting}
            />
          </div>

          <button
            onClick={handleImport}
            disabled={isImporting}
            className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:opacity-90 disabled:opacity-50"
          >
            {isImporting ? 'Importing...' : 'Import Verses'}
          </button>

          {status && (
            <div className="p-4 rounded-md bg-muted text-foreground">
              <p>{status}</p>
              {total > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-border rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(progress / total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {progress} / {total} ({Math.round((progress / total) * 100)}%)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
