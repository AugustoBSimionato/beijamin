import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import BentoGrid from '../../components/BentoGridNew';
import BentoCard from '../../components/BentoCard';
import SocialCard from '../../components/cards/SocialCard';
import LinkCard from '../../components/cards/LinkCard';
import EditCardModal from '../../components/EditCardModal'; // Import new modal
import ConfirmationModal from '../../components/ConfirmationModal'; // Import confirmation modal
import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Pencil, Plus, Save, X, Trash2, Edit2 } from 'lucide-react';
import React from 'react';

// Default layouts for new users
const defaultLayouts = {
    lg: [
        { i: 'profile', x: 0, y: 0, w: 2, h: 4 }, // Taller profile section
        { i: 'instagram', x: 2, y: 0, w: 1, h: 1 },
        { i: 'twitter', x: 3, y: 0, w: 1, h: 1 },
        { i: 'github', x: 2, y: 1, w: 1, h: 1 },
        { i: 'youtube', x: 3, y: 1, w: 1, h: 1 },
        { i: 'portfolio', x: 2, y: 2, w: 2, h: 1 },
        { i: 'blog', x: 2, y: 3, w: 2, h: 1 },
    ],
    md: [
        { i: 'profile', x: 0, y: 0, w: 2, h: 2 },
        { i: 'instagram', x: 0, y: 2, w: 1, h: 1 },
        { i: 'twitter', x: 1, y: 2, w: 1, h: 1 },
        { i: 'github', x: 0, y: 3, w: 1, h: 1 },
        { i: 'youtube', x: 1, y: 3, w: 1, h: 1 },
        { i: 'portfolio', x: 0, y: 4, w: 2, h: 1 },
        { i: 'blog', x: 0, y: 5, w: 2, h: 1 },
    ],
    sm: [
        { i: 'profile', x: 0, y: 0, w: 1, h: 2 }, // Mobile profile
        { i: 'instagram', x: 0, y: 2, w: 1, h: 1 },
        { i: 'twitter', x: 0, y: 3, w: 1, h: 1 },
        { i: 'github', x: 0, y: 4, w: 1, h: 1 },
        { i: 'youtube', x: 0, y: 5, w: 1, h: 1 },
        { i: 'portfolio', x: 0, y: 6, w: 1, h: 1 },
        { i: 'blog', x: 0, y: 7, w: 1, h: 1 },
    ]
};

// Default items data
const defaultItems = {
    instagram: { id: 'instagram', type: 'social', platform: 'whatsapp', title: 'Mentoria VIP', subtitle: 'bit.ly', url: 'https://whatsapp.com' },
    twitter: { id: 'twitter', type: 'social', platform: 'link', title: 'Contato', subtitle: 'gmail.com', url: 'mailto:contact@example.com' },
    github: { id: 'github', type: 'social', platform: 'whatsapp', title: 'Curso Vértice', subtitle: 'wa.me', url: 'https://wa.me' },
    youtube: { id: 'youtube', type: 'social', platform: 'whatsapp', title: 'Agendar Consulta', subtitle: 'wa.me', url: 'https://wa.me' },
    portfolio: { id: 'portfolio', type: 'link', title: 'Portfolio', image: 'https://images.unsplash.com/photo-1588776814546-1ffcf4722e12?w=800&h=800&fit=crop', url: '#' },
    blog: { id: 'blog', type: 'social', platform: 'website', title: 'Website', subtitle: 'mysite.com', url: 'https://example.com' },
};

export default function ProfilePage() {
    const { username } = useParams();
    const { user, logout, loginWithGoogle } = useAuth();

    // Check ownership
    const isOwner = user && user.email.split('@')[0] === username;

    const [layouts, setLayouts] = useState(defaultLayouts);
    const [items, setItems] = useState(defaultItems); // State for card data
    const [profileData, setProfileData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Modal state
    const [editingCardId, setEditingCardId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteConfirmationId, setDeleteConfirmationId] = useState(null); // ID of card to delete

    // State for undo/redo
    const snapshot = useRef(null);

    // Enter Edit Mode - Snapshot current state
    const enterEditMode = () => {
        snapshot.current = {
            layouts: JSON.parse(JSON.stringify(layouts)),
            items: JSON.parse(JSON.stringify(items)),
            profileData: { ...profileData }
        };
        setIsEditMode(true);
    };

    // Cancel Changes - Revert to snapshot
    const cancelChanges = () => {
        if (snapshot.current) {
            setLayouts(snapshot.current.layouts);
            setItems(snapshot.current.items);
            setProfileData(snapshot.current.profileData);
        }
        setHasUnsavedChanges(false);
        setIsEditMode(false);
        snapshot.current = null;
    };

    // Bio editing
    const handleBioChange = (e) => {
        setProfileData(prev => ({ ...prev, bio: e.target.value }));
        setHasUnsavedChanges(true); // Ensure save button enables
    };

    // Helper to migrate legacy single layout to layouts object
    const migrateLayout = (data) => {
        if (data.layouts && Object.keys(data.layouts).length > 0) {
            return data.layouts;
        }
        if (data.layout && data.layout.length > 0) {
            // Lazy migration: Use old desktop layout for lg and md, generate sm
            console.log("Migrating legacy layout...");
            return {
                lg: data.layout,
                md: data.layout,
                sm: data.layout.map(item => ({ ...item, x: 0, w: 1 })) // Simplistic mobile conversion
            };
        }
        return defaultLayouts;
    };

    // Fetch user data from Firestore
    useEffect(() => {
        async function fetchData() {
            if (isOwner && user) {
                // Owner viewing their own profile - direct access by UID
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setLayouts(migrateLayout(data));
                        if (data.items) setItems(data.items); // Load items if exist

                        setProfileData({
                            displayName: data.displayName || user.displayName,
                            photoURL: data.photoURL || user.photoURL,
                            bio: data.bio || "Creating cool things."
                        });
                        document.title = `${data.displayName || user.displayName} | Beijamin`;
                    } else {
                        setProfileData({
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            bio: "Creating cool things."
                        });
                        document.title = `${user.displayName} | Beijamin`;
                    }
                } catch (e) {
                    console.error("Error fetching profile:", e);
                    setProfileData({
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        bio: "Creating cool things."
                    });
                }
            } else {
                // Visitor viewing profile - query by username
                try {
                    const q = query(collection(db, "users"), where("username", "==", username));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const userDoc = querySnapshot.docs[0];
                        const data = userDoc.data();

                        // Visitor found the user!
                        setLayouts(migrateLayout(data));
                        if (data.items) setItems(data.items);

                        setProfileData({
                            displayName: data.displayName || username,
                            photoURL: data.photoURL || null,
                            bio: data.bio || "Welcome to my profile."
                        });
                        document.title = `${data.displayName || username} | Beijamin`;
                    } else {
                        // User not found in Firestore
                        console.log("User not found via query");
                        setProfileData({
                            displayName: username,
                            photoURL: null,
                            bio: "Welcome to my profile."
                        });
                        document.title = `${username} | Beijamin`;
                    }
                } catch (e) {
                    console.error("Error fetching public profile:", e);
                    setProfileData({
                        displayName: username,
                        photoURL: null,
                        bio: "Welcome to my profile."
                    });
                }
            }
        }
        fetchData();
    }, [isOwner, user, username]);

    // Handle layout changes from drag/drop
    const handleLayoutChange = (currentLayout, allLayouts) => {
        setLayouts(allLayouts);
        setHasUnsavedChanges(true);
    };

    // Helper to remove undefined values
    const sanitizeForFirestore = (obj) => {
        return JSON.parse(JSON.stringify(obj, (key, value) => {
            return value === undefined ? null : value;
        }));
    };

    // Save profile to Firestore
    const saveProfile = async () => {
        if (!isOwner || !user) return;
        setIsSaving(true);
        try {
            // Ensure no undefined values are passed to Firestore
            const rawData = {
                layouts: layouts,
                items: items, // Save items!
                displayName: profileData?.displayName || user.displayName || "User",
                bio: profileData?.bio || "Creating cool things.",
                photoURL: profileData?.photoURL || user.photoURL || null,
                username: username || "user",
                updatedAt: new Date().toISOString()
            };

            const saveData = sanitizeForFirestore(rawData);

            const finalData = {
                ...saveData,
                updatedAt: new Date()
            };

            console.log("Saving clean data:", finalData);

            await setDoc(doc(db, "users", user.uid), finalData, { merge: true });

            setHasUnsavedChanges(false);
            setIsEditMode(false);
            snapshot.current = null; // Clear snapshot
        } catch (e) {
            console.error("Error saving profile", e);
        } finally {
            setIsSaving(false);
        }
    };

    // Add a new card block
    const addNewCard = () => {
        const newId = "card-" + Date.now();

        // Helper to find bottom for a specific layout array
        const findBottom = (layoutArray) => {
            return layoutArray.reduce((max, item) => {
                const bottom = item.y + item.h;
                return bottom > max ? bottom : max;
            }, 0);
        };

        const newLayouts = { ...layouts };

        // Add to all responsive layouts
        ['lg', 'md', 'sm'].forEach(breakpoint => {
            if (!newLayouts[breakpoint]) newLayouts[breakpoint] = [];
            const maxY = findBottom(newLayouts[breakpoint]);
            // For sm/mobile force width to 1, otherwise 1
            const width = breakpoint === 'sm' ? 1 : 1;
            newLayouts[breakpoint] = [
                ...newLayouts[breakpoint],
                { i: newId, x: 0, y: maxY, w: width, h: 1 }
            ];
        });

        // Add to items
        setItems(prev => ({
            ...prev,
            [newId]: { id: newId, type: 'social', platform: 'link', title: 'New Link', subtitle: 'Edit this card', url: '#' }
        }));

        setLayouts(newLayouts);
        setHasUnsavedChanges(true);
    };

    // Delete card - prepare for confirmation
    const handleDeleteCard = (id) => {
        setDeleteConfirmationId(id);
    };

    // Confirm Deletion
    const confirmDelete = () => {
        if (!deleteConfirmationId) return;
        const id = deleteConfirmationId;

        // Remove from layouts
        const newLayouts = { ...layouts };
        ['lg', 'md', 'sm'].forEach(bk => {
            if (newLayouts[bk]) {
                newLayouts[bk] = newLayouts[bk].filter(item => item.i !== id);
            }
        });
        setLayouts(newLayouts);

        // Remove from items
        const newItems = { ...items };
        delete newItems[id];
        setItems(newItems);

        setHasUnsavedChanges(true);
        setDeleteConfirmationId(null);
    };

    // Open Edit Modal
    const handleEditCard = (id) => {
        setEditingCardId(id);
        setIsModalOpen(true);
    };

    // Save Card Changes from Modal
    const handleSaveCardData = (newData) => {
        if (!editingCardId) return;

        setItems(prev => ({
            ...prev,
            [editingCardId]: {
                ...prev[editingCardId],
                ...newData
            }
        }));
        setHasUnsavedChanges(true);
    };

    // Cancel edit mode
    const cancelEdit = () => {
        setIsEditMode(false);
        // TODO: Could restore original layout here
    };

    // Helper to extract keys from layouts to render items
    const allKeys = new Set();
    Object.values(layouts).forEach(layoutArr => {
        layoutArr?.forEach(item => allKeys.add(item.i));
    });

    // Dynamic Favicon - Circular Crop or Initials
    useEffect(() => {
        const updateFavicon = (url) => {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = url;
        };

        const drawInitialsFavicon = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 64;
            canvas.height = 64;

            // Background
            ctx.fillStyle = "#000000"; // Black background
            ctx.beginPath();
            ctx.arc(32, 32, 32, 0, 2 * Math.PI);
            ctx.fill();

            // Text
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "bold 32px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const name = profileData?.displayName || username || "U";
            const initials = name.slice(0, 2).toUpperCase();
            ctx.fillText(initials, 32, 32);

            updateFavicon(canvas.toDataURL());
        };

        if (profileData?.photoURL) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.referrerPolicy = "no-referrer";
            // Append timestamp to bypass potential 429 cache
            img.src = `${profileData.photoURL}${profileData.photoURL.includes('?') ? '&' : '?'}t=${Date.now()}`;

            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    canvas.width = 64;
                    canvas.height = 64;

                    ctx.beginPath();
                    ctx.arc(32, 32, 32, 0, 2 * Math.PI);
                    ctx.closePath();
                    ctx.clip();

                    ctx.drawImage(img, 0, 0, 64, 64);
                    updateFavicon(canvas.toDataURL());
                } catch (e) {
                    console.error("Error generating favicon (canvas):", e);
                    drawInitialsFavicon(); // Fallback
                }
            };

            img.onerror = (e) => {
                console.error("Error loading profile image for favicon:", e);
                drawInitialsFavicon(); // Fallback
            };
        } else {
            drawInitialsFavicon();
        }
    }, [profileData?.photoURL, profileData?.displayName, username]);

    // Render a card based on its item data
    const renderCard = (key) => {
        if (key === 'profile') {
            return (
                <div key="profile" className={`h-full ${isEditMode ? "cursor-grab active:cursor-grabbing" : ""}`}>
                    <div className="h-full flex flex-col justify-center px-4 md:px-0">
                        <div className="w-[180px] h-[180px] rounded-full overflow-hidden mb-6 border border-gray-100 shadow-sm relative group flex-none self-start">
                            {profileData?.photoURL ? (
                                <img
                                    src={profileData.photoURL?.replace('s96-c', 's400-c')}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl">👤</div>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-3">
                            {profileData?.displayName || username}
                        </h1>
                        <p className="text-gray-500 text-lg md:text-xl font-medium max-w-sm leading-relaxed">
                            {isEditMode ? (
                                <textarea
                                    value={profileData?.bio || ""}
                                    onChange={handleBioChange}
                                    className="no-drag w-full bg-white border border-gray-200 rounded-xl p-2 focus:ring-2 focus:ring-black outline-none resize-none"
                                    rows={3}
                                    placeholder="Write a short bio..."
                                />
                            ) : (
                                profileData?.bio
                            )}
                        </p>
                    </div>
                </div>
            );
        }

        const item = items[key];

        // Fallback for missing items (legacy keys or sync issues)
        if (!item) {
            return (
                <div key={key} className={`h-full relative group/card ${isEditMode ? "cursor-grab active:cursor-grabbing" : ""}`}>
                    {isEditMode && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteCard(key); }}
                                className="no-drag pointer-events-auto p-2 bg-white text-red-500 rounded-full shadow-lg hover:scale-110 transition-transform"
                                title="Delete Empty Block"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <BentoCard className="bg-gray-50 flex items-center justify-center h-full border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 text-xs">Empty / Legacy Item</p>
                    </BentoCard>
                </div>
            );
        }

        const isSocial = item.type === 'social' || !item.image;

        return (
            <div key={key} className={`h-full relative group/card ${isEditMode ? "cursor-grab active:cursor-grabbing" : ""}`}>
                {isEditMode && (
                    <div className="absolute inset-0 z-50 bg-black/5 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none rounded-[32px]">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleEditCard(key); }}
                            className="no-drag pointer-events-auto p-3 bg-white text-black rounded-full shadow-lg hover:scale-110 transition-transform"
                            title="Edit"
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteCard(key); }}
                            className="no-drag pointer-events-auto p-3 bg-white text-red-500 rounded-full shadow-lg hover:scale-110 transition-transform"
                            title="Delete"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <div className={isEditMode ? "pointer-events-none h-full" : "h-full"}>
                    {item.image ? (
                        <div className="w-full h-full rounded-[32px] overflow-hidden bg-gray-100">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <SocialCard
                            platform={item.platform}
                            title={item.title}
                            subtitle={item.subtitle}
                            url={item.url}
                        />
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen p-4 md:p-8 bg-[#FAFAFA] text-gray-900 font-sans">
            <div className="max-w-[1200px] mx-auto pb-32">
                {/* Header / Nav - Simplified for clean look */}
                <div className="flex justify-end items-center mb-8 px-2">
                    {!user && (
                        <button
                            onClick={loginWithGoogle}
                            className="bg-black text-white px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform"
                        >
                            Log in
                        </button>
                    )}
                </div>

                <BentoGrid
                    layouts={layouts}
                    isEditable={isEditMode}
                    onLayoutChange={handleLayoutChange}
                >
                    {Array.from(allKeys).map(key => renderCard(key))}
                </BentoGrid>

                {/* Floating Action Buttons */}
                {isOwner && (
                    <>
                        {/* Edit Mode Toolbar - Floating Pill Design */}
                        {isEditMode ? (
                            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/10 border border-gray-100 rounded-2xl py-2 px-3 flex items-center gap-1 z-50 animate-in slide-in-from-bottom-5 duration-300">
                                {/* Add Block Button */}
                                <button
                                    onClick={addNewCard}
                                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-sm"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Block
                                </button>

                                <div className="w-px h-8 bg-gray-200 mx-2"></div>

                                {/* Save Button */}
                                <button
                                    onClick={saveProfile}
                                    disabled={isSaving || !hasUnsavedChanges}
                                    className="p-3 text-black hover:bg-gray-100 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Save"
                                >
                                    <Save className="w-5 h-5" />
                                </button>

                                {/* Exit/Undo Button */}
                                <button
                                    onClick={cancelChanges}
                                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    title="Cancel & Exit"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            /* Edit Button (when not in edit mode) */
                            <button
                                onClick={enterEditMode}
                                className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full font-bold text-sm shadow-2xl shadow-black/20 z-50 flex items-center gap-2 transition-all hover:scale-105 animate-in fade-in slide-in-from-bottom-5 duration-500"
                            >
                                <Pencil className="w-4 h-4" />
                                Edit Profile
                            </button>
                        )}
                    </>
                )}

                <EditCardModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveCardData}
                    initialData={editingCardId ? items[editingCardId] : null}
                />

                <ConfirmationModal
                    isOpen={!!deleteConfirmationId}
                    onClose={() => setDeleteConfirmationId(null)}
                    onConfirm={confirmDelete}
                    title="Delete Card"
                    message="Are you sure you want to delete this card? This action cannot be undone."
                    confirmText="Delete"
                    isDestructive={true}
                />
            </div>
        </div>
    );
}
