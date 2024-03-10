import Link from "next/link";
import Image from "next/image";

interface PostProps {
  title: string;
  date: string;
  excerpt: string;
  imageUrl: string;
  url: string;
}

const Post: React.FC<PostProps> = ({ title, date, excerpt, imageUrl, url }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <Image
        width={400}
        height={600}
        src={imageUrl}
        alt={title}
        className="w-full h-49 object-cover rounded-t-lg"
      />
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-2">{date}</p>
        <p>{excerpt}</p>
        <br />
        <Link href={url}>Read more</Link>
      </div>
    </div>
  );
};

export default Post;
