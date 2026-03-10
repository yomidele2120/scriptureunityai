import { motion } from 'framer-motion';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const sharedValues = [
  { title: 'Mercy and Compassion', icon: '❤️', desc: 'All Abrahamic traditions emphasize God\'s mercy and call believers to show compassion to others.' },
  { title: 'Justice and Fairness', icon: '⚖️', desc: 'The Qur\'an, Bible, and Ethiopian scriptures all command justice and standing against oppression.' },
  { title: 'Kindness to Neighbors', icon: '🤝', desc: 'Treating neighbors with kindness and respect is a shared principle across all three traditions.' },
  { title: 'Honoring Parents', icon: '👨‍👩‍👧', desc: 'Reverence for parents is commanded in the Qur\'an, Bible, and Ethiopian Orthodox tradition.' },
  { title: 'Charity and Generosity', icon: '🎁', desc: 'Giving to those in need is a central obligation in Islam (Zakat), Christianity (Tithing), and Ethiopian tradition.' },
  { title: 'Seeking Knowledge', icon: '📖', desc: 'All traditions encourage the pursuit of knowledge and understanding of God\'s creation.' },
];

export default function UnderstandingPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-12">
          <span className="text-4xl mb-3 block">🕊</span>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            Understanding Faiths
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto leading-relaxed">
            The Abrahamic religions — Islam, Christianity, and Judaism — share deep historical 
            roots and many moral teachings. This section highlights what unites rather than divides.
          </p>
        </motion.div>

        <div className="gold-divider mb-10" />

        <section className="mb-12">
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-6 text-center">
            Shared Moral Teachings
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {sharedValues.map((val, i) => (
              <motion.div
                key={val.title}
                {...fadeUp}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-card border border-border rounded-lg p-5"
              >
                <span className="text-2xl mb-2 block">{val.icon}</span>
                <h3 className="font-heading text-lg font-semibold text-foreground">{val.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="gold-divider mb-10" />

        <section className="mb-12">
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-4 text-center">
            Historical Connections
          </h2>
          <div className="bg-card border border-border rounded-lg p-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              The Abrahamic faiths trace their spiritual lineage to the patriarch Abraham (Ibrahim in Arabic). 
              This shared ancestry creates a foundation for mutual understanding and respect.
            </p>
            <p>
              The Qur'an frequently references biblical figures — Moses (Musa), Jesus (Isa), Mary (Maryam), 
              David (Dawud), and Solomon (Sulayman) — often providing complementary perspectives on their stories.
            </p>
            <p>
              The Ethiopian Orthodox tradition preserves ancient texts like 1 Enoch and Jubilees that offer 
              unique insights into early Jewish and Christian thought, providing a bridge between traditions.
            </p>
            <p>
              Throughout history, scholars from all three traditions have engaged in intellectual exchange, 
              contributing to philosophy, science, medicine, and the arts in ways that transcend religious boundaries.
            </p>
          </div>
        </section>

        <div className="bg-primary/5 border border-accent/20 rounded-lg p-6 text-center">
          <p className="font-heading text-lg text-foreground italic">
            "O mankind, indeed We have created you from male and female and made you peoples and 
            tribes that you may know one another."
          </p>
          <p className="text-sm text-muted-foreground mt-2">— Qur'an 49:13</p>
        </div>
      </div>
    </div>
  );
}
