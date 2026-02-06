import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '../BentoCard';

export default function LinkCard({ title, subtitle, image, url, className, showArrow = true }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const hasValidImage = image && !imageError;
    const showImage = hasValidImage && imageLoaded;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block h-full w-full group"
        >
            <div
                className={cn(
                    "relative h-full w-full rounded-[24px] overflow-hidden",
                    "transition-all duration-300 ease-out",
                    "hover:shadow-xl hover:shadow-black/10",
                    "hover:scale-[1.02]",
                    // Fallback gradient when no image or image failed
                    !showImage && "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900",
                    className
                )}
            >
                {/* Background Image */}
                {hasValidImage && (
                    <div className="absolute inset-0">
                        <img
                            src={image}
                            alt={title}
                            className={cn(
                                "w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110",
                                imageLoaded ? "opacity-100" : "opacity-0"
                            )}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                        />
                        {/* Subtle gradient overlay at bottom for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </div>
                )}

                {/* Content Layer */}
                <div className="relative z-10 h-full flex flex-col justify-between p-5">
                    {/* Top Right Arrow */}
                    {showArrow && (
                        <div className="self-end">
                            <div className={cn(
                                "p-2.5 rounded-full backdrop-blur-md",
                                "transition-all duration-300",
                                "bg-white/20 opacity-0 group-hover:opacity-100 group-hover:bg-white/30"
                            )}>
                                <ArrowUpRight className="w-4 h-4 text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </div>
                        </div>
                    )}

                    {/* Title & Subtitle */}
                    <div className="mt-auto text-white">
                        <h3 className="font-bold text-lg leading-snug tracking-tight drop-shadow-sm">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-sm mt-1.5 line-clamp-2 leading-relaxed font-medium text-white/85 drop-shadow-sm">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </a>
    );
}
