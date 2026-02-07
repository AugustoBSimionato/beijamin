import { X, Sparkles, LayoutGrid, Globe, Smartphone, UserCog } from 'lucide-react';

export default function AboutModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const features = [
        {
            icon: Sparkles,
            title: "Smart Link Paste",
            description: "Just paste a URL and we'll automatically detect the platform, title, and handle for you."
        },
        {
            icon: LayoutGrid,
            title: "Bento Grid Layout",
            description: "A beautiful, fully customizable grid system that adapts to your content."
        },
        {
            icon: Globe,
            title: "Dynamic Favicons",
            description: "We automatically fetch high-quality icons for any website you add."
        },
        {
            icon: Smartphone,
            title: "Mobile First",
            description: "Designed to look stunning on every device, from phones to desktops."
        },
        {
            icon: UserCog,
            title: "Fully Customizable",
            description: "Edit your bio, avatar, and rearrange blocks to tell your unique story."
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 relative">

                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            🍱 About Beijamin
                        </h2>
                        <p className="text-gray-500 mt-1">The richest link-in-bio experience.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="grid gap-6">
                        {features.map((feature, index) => (
                            <div key={index} className="flex gap-4 items-start group">
                                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-black/5 text-black flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-1">{feature.title}</h3>
                                    <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-center">
                    <p className="text-sm text-gray-400 font-medium">
                        Built with ❤️ by Augusto Simionato
                    </p>
                </div>
            </div>
        </div>
    );
}
