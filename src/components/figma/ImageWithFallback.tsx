import { DollarSign } from "lucide-react";
import { useState } from "react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  style?: React.CSSProperties;
}

export const ImageWithFallback = ({
  src,
  alt,
  className = "",
  fallbackSrc,
  style,
}: ImageWithFallbackProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // If primary source failed and we have a fallback
  if (hasError && fallbackSrc) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        style={style}
        onError={() => setHasError(true)}
        onLoad={handleLoad}
      />
    );
  }

  // If both failed or no fallback, show icon
  if (hasError) {
    return (
      <div
        className={`${className} bg-muted rounded flex items-center justify-center`}
        style={style}
      >
        <DollarSign className="w-1/2 h-1/2 text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {isLoading && <div className={`${className} bg-muted rounded animate-pulse`} style={style} />}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? "hidden" : ""}`}
        style={style}
        onError={handleError}
        onLoad={handleLoad}
      />
    </>
  );
};
