import { useState } from 'react';
import { Twitter, Instagram, Github, Youtube, Linkedin, Globe, MessageCircle, Link as LinkIcon } from 'lucide-react';
import { cn } from '../BentoCard';

const platforms = {
    twitter: { icon: Twitter, color: 'text-[#1DA1F2]', bg: 'bg-[#1DA1F2]/10', label: 'Twitter' },
    instagram: { icon: Instagram, color: 'text-[#E1306C]', bg: 'bg-[#E1306C]/10', label: 'Instagram' }, // Gradient text is hard, sticking to solid pink-ish
    github: { icon: Github, color: 'text-[#24292e]', bg: 'bg-[#24292e]/10', label: 'GitHub' },
    youtube: { icon: Youtube, color: 'text-[#FF0000]', bg: 'bg-[#FF0000]/10', label: 'YouTube' },
    linkedin: { icon: Linkedin, color: 'text-[#0077b5]', bg: 'bg-[#0077b5]/10', label: 'LinkedIn' },
    website: { icon: Globe, color: 'text-gray-700', bg: 'bg-gray-100', label: 'Website' },
    whatsapp: { icon: MessageCircle, color: 'text-[#25D366]', bg: 'bg-[#25D366]/10', label: 'WhatsApp' },
    link: { icon: LinkIcon, color: 'text-gray-700', bg: 'bg-gray-100', label: 'Link' },
};

export default function SocialCard({ platform, username, url, className, title, subtitle, icon, ...props }) {
    const [imgError, setImgError] = useState(false);

    // Determine configuration
    let config = platforms[platform] || platforms.link;

    // Override with custom icon if provided (e.g. from props)
    // If 'icon' prop is passed, we might need to handle it, but for now relying on platform config

    const Icon = config.icon;

    // Safe URL parsing for favicon and subtitle
    let hostname = '';
    let faviconUrl = null;
    try {
        if (url) {
            let urlToParse = url;
            // Add protocol if missing
            if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:') && !url.startsWith('#')) {
                urlToParse = `https://${url}`;
            }

            const urlObj = new URL(urlToParse);
            hostname = urlObj.hostname.replace('www.', '');

            // Only generate favicon for valid http/https protocols and non-empty hostname
            if (hostname && (urlObj.protocol === 'http:' || urlObj.protocol === 'https:')) {
                faviconUrl = `https://unavatar.io/${hostname}?fallback=false`;
            }
        }
    } catch (e) {
        // Invalid URL, fallback to default behavior
    }

    const showFavicon = (platform === 'link' || platform === 'website') && faviconUrl && !imgError;

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block h-full w-full group">
            <div
                className={cn(
                    "h-full w-full rounded-[32px] overflow-hidden bg-white border border-gray-200", // White bg, border
                    "transition-all duration-300 ease-out",
                    "hover:shadow-lg hover:shadow-black/5 hover:border-gray-300",
                    "hover:scale-[1.02]",
                    className
                )}
                {...props}
            >
                <div className="p-6 h-full flex flex-col justify-between">
                    {/* Icon */}
                    <div className="mb-4">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                            config.bg,
                            "overflow-hidden" // Ensure image doesn't bleed
                        )}>
                            {showFavicon ? (
                                <img
                                    src={faviconUrl}
                                    alt={config.label}
                                    className="w-8 h-8 object-contain"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <Icon className={cn(
                                    "w-6 h-6",
                                    config.color
                                )} />
                            )}
                        </div>
                    </div>

                    {/* Label & Username/Subtitle */}
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{title || config.label}</h3>
                        <p className="text-sm text-gray-500 font-medium">
                            {subtitle || (username ? `@${username}` : hostname || 'Visit')}
                        </p>
                    </div>
                </div>
            </div>
        </a>
    );
}
