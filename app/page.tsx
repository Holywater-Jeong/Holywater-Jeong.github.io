import { allPosts } from '@/.contentlayer/generated';
import Link from 'next/link';
import dayjs from 'dayjs';

export default function Home() {
  const posts = allPosts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="prose dark:prose-invert">
      {posts.map((post) => (
        <article key={post._id}>
          <Link href={post.slug}>
            <h2 style={{ marginBottom: '0.25em' }}>{post.title}</h2>
            <span>{dayjs(post.date).format('YYYY-MM-DD')}</span>
          </Link>
          {post.description && <p>{post.description}</p>}
        </article>
      ))}
    </div>
  );
}
