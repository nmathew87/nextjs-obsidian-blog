import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const options = {
      cast: false, // Prevents automatic type casting
    };

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);
    frontMatterObsidianToMD(matterResult.data)

    // Combine the data with the id
    return {
      id,
      ...matterResult.data,
    };
  });
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ''),
      },
    };
  });
}

export async function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);
  matterResult.content = contentObsidianToMD(matterResult.content)
  matterResult.data = frontMatterObsidianToMD(matterResult.data)

  // Use remark to convert markdown into HTML string
  // const processedContent = await remark()
  //   .use(html)
  //   .process(matterResult.content);
  // const contentHtml = processedContent.toString();

  const content = matterResult.content;
  // Combine the data with the id and contentHtml
  return {
    id,
    content,
    ...matterResult.data,
  };
}

function frontMatterObsidianToMD(data) {
  let newData = data
  if (typeof newData.date !== 'string') {
    newData.date = newData.date.toISOString().split('T')[0];
  }
  return newData
}

function contentObsidianToMD(content) {

  // Regular expression to match text in double brackets
  let linkRegex = /\[\[([^\]]+)\]\]/g;
  let imageRegex = /!\[\[([^\]]+)\]\]/g;

  // do images first
  let replacedImagesText = content.replace(imageRegex, '![](/images/$1)');
  let replacedLinksText = replacedImagesText.replace(linkRegex, '[$1]($1)');

  return replacedLinksText
}