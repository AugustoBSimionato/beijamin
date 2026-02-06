import { Twitter, Instagram, Github, Youtube, Linkedin, Globe } from 'lucide-react';
import BentoCard from '../BentoCard';
import { cn } from '../BentoCard';

const platforms = {
    twitter: { icon: Twitter, color: 'bg-[#1DA1F2] text-white', label: 'Twitter' },
    instagram: { icon: Instagram, color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white', label: 'Instagram' },
    github: { icon: Github, color: 'bg-[#24292e] text-white', label: 'GitHub' },
    youtube: { icon: Youtube, color: 'bg-[#FF0000] text-white', label: 'YouTube' },
    linkedin: { icon: Linkedin, color: 'bg-[#0077b5] text-white', label: 'LinkedIn' },
    website: { icon: Globe, color: 'bg-gray-100 text-black', label: 'Website' },
};

export default function SocialCard({ platform, username, url, className, ...props }) {
    const config = platforms[platform] || platforms.website;
    const Icon = config.icon;

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
            <BentoCard
                className={cn("border-none h-full", config.color, className)}
                {...props}
            >
                <div className="p-6 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <Icon className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{config.label}</h3>
                        {username && <p className="font-medium opacity-80 text-sm">@{username}</p>}
                    </div>
                </div>
            </BentoCard>
        </a>
    );
}
