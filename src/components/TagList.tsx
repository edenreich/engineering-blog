import React from "react";

interface TagListProps {
  tags: string[];
  selectedTags: string[];
  onTagClick: (selectedTags: string[]) => void;
}

const TagList: React.FC<TagListProps> = ({
  tags,
  selectedTags,
  onTagClick,
}) => {
  const handleTagClick = (tag: string) => {
    const isSelected = selectedTags.includes(tag);

    if (isSelected) {
      const updatedTags = selectedTags.filter(
        (selectedTag) => selectedTag !== tag
      );
      onTagClick(updatedTags);
    } else {
      onTagClick([...selectedTags, tag]);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
      {tags.map((tag, index) => {
        const isSelected = selectedTags.includes(tag);

        return (
          <span
            key={index}
            className={`px-4 py-2 text-lg rounded ${
              isSelected
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            } cursor-pointer`}
            onClick={() => handleTagClick(tag)}
          >
            #{tag}
          </span>
        );
      })}
    </div>
  );
};

export default TagList;
