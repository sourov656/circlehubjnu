import Link from "next/link";
import Image from "next/image";

/**
 * Reusable Logo component for CircleHub JnU
 */
interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string | null;
  className?: string;
}

export default function Logo({
  size = "md",
  showText = true,
  href = "/",
  className = "",
}: LogoProps) {
  const sizePixels = {
    sm: 32,
    md: 40,
    lg: 48,
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const logoContent = (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Image
        src="/logo/transparent-logo.png"
        alt="CircleHub JnU Logo"
        width={sizePixels[size]}
        height={sizePixels[size]}
        className="rounded-lg"
      />
      {showText && (
        <span
          className={`${textSizeClasses[size]} font-bold text-foreground whitespace-nowrap`}
        >
          CircleHub JnU
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-block hover:opacity-80 transition-opacity"
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
