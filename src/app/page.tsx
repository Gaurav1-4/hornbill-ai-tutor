import Link from 'next/link';
import { getAllNotes } from '@/lib/notes';
import VoiceChat from '@/components/VoiceChat';

export default function Home() {
  const notes = getAllNotes();

  const prose = notes.filter(n => n.type === 'Prose');
  const poetry = notes.filter(n => n.type === 'Poetry');

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-blue-900">📚 Hornbill AI Tutor</h1>
          <p className="text-lg text-gray-600">Your interactive study guide for Class 11 CBSE English.</p>
        </header>

        <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <VoiceChat />
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Prose Chapters</h2>
            <ul className="space-y-3">
              {prose.map(note => (
                <li key={note.slug}>
                  <Link href={`/notes/${note.slug}`} className="block p-4 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition">
                    <h3 className="font-semibold text-lg text-blue-800">{note.title}</h3>
                    <p className="text-sm text-gray-500">by {note.author}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Poetry</h2>
            <ul className="space-y-3">
              {poetry.map(note => (
                <li key={note.slug}>
                  <Link href={`/notes/${note.slug}`} className="block p-4 rounded-xl hover:bg-green-50 border border-transparent hover:border-green-100 transition">
                    <h3 className="font-semibold text-lg text-green-800">{note.title}</h3>
                    <p className="text-sm text-gray-500">by {note.author}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

      </div>
    </main>
  );
}
