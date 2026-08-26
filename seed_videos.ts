import { prisma } from './src/lib/prisma';
import fs from 'fs';
import path from 'path';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

const creatorMap: Record<string, string> = {
  "PART2-revised2-with subtitles3-final": "deanjoseph__",
  "1080p - FULL EDIT TRIAL": "joshukzz",
  "$900PC-FINAL": "NwBuilds",
};

async function main() {
  const publicVideosPath = path.join(process.cwd(), 'public', 'videos');
  const categories = ['cinematic', 'experiments', 'shortforms'];

  for (const category of categories) {
    const categoryPath = path.join(publicVideosPath, category);
    
    if (fs.existsSync(categoryPath)) {
      const files = fs.readdirSync(categoryPath);
      
      for (const file of files) {
        if (file.endsWith('.mp4')) {
          const title = file.replace('.mp4', '');
          const slug = slugify(`${category}-${title}`);
          const videoUrl = `/videos/${category}/${file}`;
          
          // Determine aspect ratio based on category
          const aspectRatio = category === 'shortforms' ? '9:16' : '16:9';
          const creator = creatorMap[title] || null;
          
          // Check if it already exists by slug
          const existing = await prisma.project.findUnique({
            where: { slug }
          });
          
          if (!existing) {
            console.log(`Adding ${title} to ${category}...`);
            await prisma.project.create({
              data: {
                title,
                slug,
                category,
                videoUrl,
                aspectRatio,
                creator,
              }
            });
          } else {
            console.log(`Skipping/Updating ${title}...`);
            if (creator && existing.creator !== creator) {
              await prisma.project.update({
                where: { slug },
                data: { creator }
              });
            }
          }
        }
      }
    }
  }
  
  console.log('Done adding videos to the database!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
