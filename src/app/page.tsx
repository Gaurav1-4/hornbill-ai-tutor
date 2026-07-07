import Link from 'next/link';
import { getAllNotes } from '@/lib/notes';
import VoiceChat from '@/components/VoiceChat';
import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';

export default function Home() {
  const notes = getAllNotes();

  const prose = notes.filter(n => n.type === 'Prose');
  const poetry = notes.filter(n => n.type === 'Poetry');

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-blue-900">📚 Hornbill AI Tutor</h1>
            <p className="text-gray-600">Your interactive study guide for Class 11 CBSE English.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4 items-center">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition">Log In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">Sign Up</button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton appearance={{ elements: { userButtonAvatarBox: 'w-10 h-10' } }} />
            </Show>
          </div>
        </header>

        <Show when="signed-in">
          <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <VoiceChat />
          </section>
        </Show>
        
        <Show when="signed-out">
          <section className="bg-blue-50 text-center rounded-2xl p-8 border border-blue-100">
            <h2 className="text-xl font-bold text-blue-900 mb-2">Want to use the AI Voice Tutor?</h2>
            <p className="text-blue-700 mb-4">Please log in or sign up to interact with the Hornbill Voice Bot.</p>
            <SignInButton mode="modal">
                <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow hover:bg-blue-700 transition">Log In to Chat</button>
            </SignInButton>
          </section>
        </Show>

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
