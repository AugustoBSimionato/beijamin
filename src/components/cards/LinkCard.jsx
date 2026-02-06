import { ArrowUpRight } from 'lucide-react';
import BentoCard from '../BentoCard';

export default function LinkCard({ title, subtitle, image, url, className }) {
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block h-full w-full group">
            <BentoCard className={`relative overflow-hidden ${className}`}>
                {image && (
                    <div className="absolute inset-0 z-0">
                        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                    </div>
                )}

                <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                    <div className="self-end bg-white/20 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="w-5 h-5 text-white" />
                    </div>

                    <div>
                        <h3 className="font-bold text-xl leading-tight">{title}</h3>
                        {subtitle && <p className="text-white/80 text-sm mt-1 line-clamp-2">{subtitle}</p>}
                    </div>
                </div>
            </BentoCard>
        </a>
    );
}
