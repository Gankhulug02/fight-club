import Image from "next/image";

// Helper function to check if logo is a URL (image) or emoji
export const isImageUrl = (logo: string): boolean => {
  return (
    logo.startsWith("http://") ||
    logo.startsWith("https://") ||
    logo.startsWith("/")
  );
};

// Helper component to render logo (image or emoji)
export const TeamLogo = ({
  logo,
  size = "text-3xl",
}: {
  logo: string;
  size?: string;
}) => {
  if (isImageUrl(logo)) {
    return (
      <Image
        height={500}
        width={500}
        src={logo}
        alt="Team logo"
        className={` object-contain rounded-lg size-14`}
        onError={(e) => {
          // Fallback to emoji if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          const fallback = document.createElement("span");
          fallback.className = size;
          fallback.textContent = "⚡";
          target.parentNode?.appendChild(fallback);
        }}
      />
    );
  }
  return <span className={size}>{logo || "⚡"}</span>;
};
