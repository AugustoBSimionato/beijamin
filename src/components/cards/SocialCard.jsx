import { Twitter, Instagram, Github, Youtube, Linkedin, Globe } from 'lucide-react';
import { cn } from '../BentoCard';

const platforms = {
    twitter: { icon: Twitter, color: 'bg-[#1DA1F2]', label: 'Twitter' },
    instagram: { icon: Instagram, color: 'bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#FCAF45]', label: 'Instagram' },
    github: { icon: Github, color: 'bg-[#24292e]', label: 'GitHub' },
    youtube: { icon: Youtube, color: 'bg-[#FF0000]', label: 'YouTube' },
    linkedin: { icon: Linkedin, color: 'bg-[#0077b5]', label: 'LinkedIn' },
    website: { icon: Globe, color: 'bg-gray-100', label: 'Website' },
};

export default function SocialCard({ platform, username, url, className, ...props }) {
    const config = platforms[platform] || platforms.website;
    const Icon = config.icon;
    const isLight = platform === 'website';

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block h-full w-full group">
            <div
                className={cn(
                    "h-full w-full rounded-[24px] overflow-hidden",
                    "transition-all duration-300 ease-out",
                    "hover:shadow-xl hover:shadow-black/15",
                    "hover:scale-[1.02]",
                    config.color,
                    className
                )}
                {...props}
            >
                <div className={cn(
                    "p-5 h-full flex flex-col justify-between",
                    isLight ? "text-gray-900" : "text-white"
                )}>
                    {/* Icon */}
                    <div className="flex justify-between items-start">
                        <Icon className={cn(
                            "w-7 h-7 transition-transform duration-300 group-hover:scale-110",
                            isLight ? "text-gray-700" : "text-white"
                        )} />
                    </div>

                    {/* Label & Username */}
                    <div>
                        <h3 className="font-bold text-base tracking-tight">{config.label}</h3>
                        {username && (
                            <p className={cn(
                                "font-medium text-sm",
                                isLight ? "text-gray-500" : "text-white/80"
                            )}>
                                @{username}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </a>
    );
}
