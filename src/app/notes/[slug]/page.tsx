import { getNoteData, getAllNotes } from '@/lib/notes';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

export async function generateStaticParams() {
  const notes = getAllNotes();
  return notes.map((note) => ({
    slug: note.slug,
  }));
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const noteData = getNoteData(resolvedParams.slug);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="text-blue-600 hover:underline font-semibold">
          &larr; Back to Home
        </Link>
        
        <article className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 prose prose-blue lg:prose-lg max-w-none">
          <div className="mb-8 border-b pb-4">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{noteData.title}</h1>
            <p className="text-gray-500 font-medium">By {noteData.author}</p>
            <div className="mt-4 inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold">
              {noteData.type}
            </div>
            <p className="mt-4 italic text-gray-600 border-l-4 border-gray-300 pl-4">{noteData.theme}</p>
          </div>
          
          <ReactMarkdown>{noteData.content}</ReactMarkdown>
        </article>
      </div>
    </main>
  );
}
