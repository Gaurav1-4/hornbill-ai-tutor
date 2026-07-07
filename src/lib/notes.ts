import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'src/content');

export interface NoteMetadata {
  slug: string;
  title: string;
  author: string;
  type: string;
  theme: string;
}

export function getAllNotes(): NoteMetadata[] {
  if (!fs.existsSync(contentDirectory)) return [];
  const fileNames = fs.readdirSync(contentDirectory);
  const allNotesData = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(contentDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
      slug,
      ...(matterResult.data as { title: string; author: string; type: string; theme: string }),
    };
  });

  return allNotesData.sort((a, b) => {
    if (a.title < b.title) return -1;
    if (a.title > b.title) return 1;
    return 0;
  });
}

export function getNoteData(slug: string) {
  const fullPath = path.join(contentDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);
  
  return {
    slug,
    content: matterResult.content,
    ...(matterResult.data as { title: string; author: string; type: string; theme: string }),
  };
}
