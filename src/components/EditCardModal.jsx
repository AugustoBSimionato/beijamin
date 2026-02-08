import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';

const availableIcons = [
    { id: 'instagram', label: 'Instagram', value: 'instagram' },
    { id: 'twitter', label: 'Twitter', value: 'twitter' },
    { id: 'github', label: 'GitHub', value: 'github' },
    { id: 'youtube', label: 'YouTube', value: 'youtube' },
    { id: 'linkedin', label: 'LinkedIn', value: 'linkedin' },
    { id: 'website', label: 'Website (Globe)', value: 'website' },
    { id: 'whatsapp', label: 'WhatsApp', value: 'whatsapp' },
    { id: 'map', label: 'Maps (Location)', value: 'map' },
    { id: 'link', label: 'Generic Link', value: 'link' },
];

export default function EditCardModal({ isOpen, onClose, onSave, initialData }) {
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        url: '',
        platform: 'link',
        image: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                subtitle: initialData.subtitle || '',
                url: initialData.url || '',
                platform: initialData.platform || 'link',
                image: initialData.image || '',
                zoom: initialData.zoom || 3
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    const handlePaste = (e) => {
        // Implement smart link detection
        const pastedText = e.clipboardData.getData('text');

        try {
            const urlObj = new URL(pastedText); // Check if valid URL
            const hostname = urlObj.hostname.replace('www.', '');
            const pathname = urlObj.pathname;

            let newPlatform = 'link';
            let newTitle = '';
            let newSubtitle = '';

            // Map URL to platform
            if (hostname.includes('instagram.com')) {
                newPlatform = 'instagram';
                newTitle = 'Instagram';
                const user = pathname.split('/')[1];
                if (user) newSubtitle = `@${user}`;
            } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
                newPlatform = 'twitter';
                newTitle = 'Twitter';
                const user = pathname.split('/')[1];
                if (user) newSubtitle = `@${user}`;
            } else if (hostname.includes('github.com')) {
                newPlatform = 'github';
                newTitle = 'GitHub';
                const user = pathname.split('/')[1];
                if (user) newSubtitle = `@${user}`;
            } else if (hostname.includes('linkedin.com') && pathname.includes('/in/')) {
                newPlatform = 'linkedin';
                newTitle = 'LinkedIn';
                const user = pathname.split('/in/')[1]?.split('/')[0];
                if (user) newSubtitle = `Connect with ${user}`;
            } else if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
                newPlatform = 'youtube';
                newTitle = 'YouTube';
                if (pathname.includes('/@')) {
                    newSubtitle = pathname.split('/')[1]; // includes @
                } else {
                    newSubtitle = 'Subscribe';
                }
            } else if (hostname.includes('wa.me') || hostname.includes('whatsapp.com')) {
                newPlatform = 'whatsapp';
                newTitle = 'WhatsApp';
                newSubtitle = 'Chat on WhatsApp';
            } else if (hostname.includes('google.com/maps') || hostname.includes('maps.google.com') || hostname.includes('goo.gl')) {
                newPlatform = 'map';
                newTitle = 'Location';

                // Extract coordinates from URL if possible
                // Matches @lat,lng,z or ?q=lat,lng
                const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
                const match = pastedText.match(regex);
                if (match) {
                    setFormData(prev => ({ ...prev, lat: match[1], lng: match[2] }));
                }
            }

            // If we detected a specific platform, update form data ONLY if fields are empty/default
            if (newPlatform !== 'link') {
                setFormData(prev => ({
                    ...prev,
                    platform: (prev.platform === 'link' || !prev.platform) ? newPlatform : prev.platform,
                    title: (!prev.title || prev.title === 'New Link') ? newTitle : prev.title,
                    subtitle: (!prev.subtitle || prev.subtitle === 'Edit this card') ? newSubtitle : prev.subtitle,
                    url: pastedText // Ensure pasted text is set (state update might race with default paste)
                }));
                // Prevent default paste behavior as we're handling it manually via state
                e.preventDefault();
            }

        } catch (error) {
            // Not a valid URL, ignore and let default paste happen
        }
    };

    const isMap = formData.platform === 'map';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Edit Card</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Platform/Icon Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Icon / Platform</label>
                        <select
                            name="platform"
                            value={formData.platform}
                            onChange={handleChange}
                            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                        >
                            {availableIcons.map(icon => (
                                <option key={icon.id} value={icon.value}>{icon.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Title / Location Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            {isMap ? 'Location Name' : 'Title'}
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder={isMap ? "e.g. San Francisco, CA" : "e.g. My Instagram"}
                            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                        />
                    </div>

                    {/* Subtitle - Hidden for Map if not needed, or use as extra info */}
                    {!isMap && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Subtitle / Username</label>
                            <input
                                type="text"
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleChange}
                                placeholder="e.g. @username or Description"
                                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                            />
                        </div>
                    )}

                    {/* URL - Required for Map */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            {isMap ? 'Google Maps Link' : 'URL'}
                        </label>
                        <input
                            type="url"
                            name="url"
                            value={formData.url}
                            onChange={handleChange}
                            onPaste={handlePaste} // Detect smart paste
                            placeholder={isMap ? "Paste the google maps link here" : "https://..."}
                            required={isMap}
                            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                        />
                    </div>

                    {/* Zoom Level - Only for Map */}
                    {isMap && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-gray-700">Zoom Level</label>
                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                    {formData.zoom || 3}x
                                </span>
                            </div>
                            <input
                                type="range"
                                name="zoom"
                                min="1"
                                max="18"
                                step="1"
                                value={formData.zoom || 3}
                                onChange={handleChange}
                                className="w-full accent-black cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>World</span>
                                <span>City</span>
                                <span>Street</span>
                            </div>
                        </div>
                    )}

                    {/* Image URL (Optional) - Hidden for map as we use a static map or generated one, or let user override? Keeping optional for flexibility */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL (Optional)</label>
                        <input
                            type="url"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="https://... (override default look)"
                            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                        />
                        <p className="text-xs text-gray-400 mt-1">Leave empty to use the default style.</p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-black hover:bg-gray-800 transition-colors shadow-lg shadow-black/20"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
