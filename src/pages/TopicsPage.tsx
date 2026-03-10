import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TopicCard from '@/components/TopicCard';
import VerseCard from '@/components/VerseCard';
import { topics, sampleQuranVerses, sampleBibleVerses, sampleEthiopianVerses } from '@/data/mockScriptures';

export default function TopicsPage() {
  const { topicId } = useParams();

  if (topicId) {
    const topic = topics.find((t) => t.id === topicId);
    if (!topic) return <div className="container py-16 text-center text-muted-foreground">Topic not found</div>;

    return (
      <div className="min-h-screen py-8">
        <div className="container max-w-4xl">
          <Link to="/topics" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> All topics
          </Link>
          <div className="mb-8">
            <span className="text-3xl mb-2 block">{topic.icon}</span>
            <h1 className="font-heading text-3xl font-bold text-foreground">{topic.name}</h1>
            <p className="text-muted-foreground mt-2">{topic.description}</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {topic.subtopics.map((sub) => (
              <span key={sub.id} className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm font-medium">
                {sub.name}
              </span>
            ))}
          </div>

          <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Related Verses</h2>
          <div className="space-y-3">
            <VerseCard data={{ type: 'quran', verse: sampleQuranVerses[3] }} />
            <VerseCard data={{ type: 'bible', verse: sampleBibleVerses[1] }} />
            <VerseCard data={{ type: 'ethiopian', verse: sampleEthiopianVerses[3] }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-5xl">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2 text-center">Topic Explorer</h1>
        <p className="text-muted-foreground text-center mb-8">Browse scriptures by theme across traditions</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      </div>
    </div>
  );
}
