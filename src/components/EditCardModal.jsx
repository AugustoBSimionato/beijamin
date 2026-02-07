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
                image: initialData.image || ''
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

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. My Instagram"
                            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                        />
                    </div>

                    {/* Subtitle */}
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

                    {/* URL */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">URL</label>
                        <input
                            type="url"
                            name="url"
                            value={formData.url}
                            onChange={handleChange}
                            placeholder="https://..."
                            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                        />
                    </div>

                    {/* Image URL (Optional) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL (Optional)</label>
                        <input
                            type="url"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="https://... (for large cards)"
                            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                        />
                        <p className="text-xs text-gray-400 mt-1">Leave empty to use the platform icon style.</p>
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
