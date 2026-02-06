import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import BentoGrid from '../../components/BentoGridNew';
import BentoCard from '../../components/BentoCard';
import SocialCard from '../../components/cards/SocialCard';
import LinkCard from '../../components/cards/LinkCard';
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Pencil, Plus, Save, LogOut, X } from 'lucide-react';

console.log("ProfilePage.jsx loaded");

// Default layout for new users
const defaultLayout = [
    { i: 'profile', x: 0, y: 0, w: 2, h: 2 },
    { i: 'instagram', x: 2, y: 0, w: 1, h: 1 },
    { i: 'twitter', x: 3, y: 0, w: 1, h: 1 },
    { i: 'github', x: 2, y: 1, w: 1, h: 1 },
    { i: 'youtube', x: 3, y: 1, w: 1, h: 1 },
    { i: 'portfolio', x: 0, y: 2, w: 2, h: 1 },
    { i: 'blog', x: 2, y: 2, w: 2, h: 1 },
];

export default function ProfilePage() {
    const { username } = useParams();
    const { user, logout, loginWithGoogle } = useAuth();

    // Check ownership
    const isOwner = user && user.email.split('@')[0] === username;

    const [layout, setLayout] = useState(defaultLayout);
    const [profileData, setProfileData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
                        if (data.layout && data.layout.length > 0) {
                            setLayout(data.layout);
                        }
                        setProfileData({
                            displayName: data.displayName || user.displayName,
                            photoURL: data.photoURL || user.photoURL,
                            bio: data.bio || "Creating cool things."
                        });
                    } else {
                        // User exists in Auth but not Firestore yet (shouldn't happen with AuthContext fix, but safety net)
                        setProfileData({
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            bio: "Creating cool things."
                        });
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
                        if (data.layout && data.layout.length > 0) {
                            setLayout(data.layout);
                        }
                        setProfileData({
                            displayName: data.displayName || username,
                            photoURL: data.photoURL || null,
                            bio: data.bio || "Welcome to my profile."
                        });
                    } else {
                        // User not found in Firestore
                        console.log("User not found via query");
                        setProfileData({
                            displayName: username,
                            photoURL: null,
                            bio: "Welcome to my profile."
                        });
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
    const handleLayoutChange = (newLayout) => {
        setLayout(newLayout);
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
                layout: layout || [],
                displayName: profileData?.displayName || user.displayName || "User",
                bio: profileData?.bio || "Creating cool things.",
                photoURL: profileData?.photoURL || user.photoURL || null,
                username: username || "user", // Fallback if username is somehow undefined
                updatedAt: new Date().toISOString() // Use string for date to be safe with JSON hack, or keep date object if not using JSON hack method
            };

            // Using a strict sanitizer that preserves Dates if needed, but JSON.parse/stringify is easiest for removing undefineds
            // Firestore handles nulls, but hates undefined.
            const saveData = sanitizeForFirestore(rawData);

            // Restore Date object if needed, or Firestore accepts ISO strings nicely too usually, 
            // but let's keep it as ServerTimestamp or Date object if possible.
            // Actually, let's just manually sanitize the specific fields we know might be trouble, 
            // or use a better sanitizer.

            // Clean simple sanitization:
            const finalData = {
                ...saveData,
                updatedAt: new Date() // Put the date back as a real Date object
            };

            console.log("Saving clean data:", finalData);

            await setDoc(doc(db, "users", user.uid), finalData, { merge: true });

            setHasUnsavedChanges(false);
            setIsEditMode(false);
        } catch (e) {
            console.error("Error saving profile", e);
            alert(`Failed to save: ${e.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Add a new card block
    const addNewCard = () => {
        const newId = `card-${Date.now()}`;
        // Find the lowest available y position
        const maxY = layout.reduce((max, item) => {
            const bottom = item.y + item.h;
            return bottom > max ? bottom : max;
        }, 0);

        const newLayoutItem = { i: newId, x: 0, y: maxY, w: 1, h: 1 };
        setLayout(prev => [...prev, newLayoutItem]);
        setHasUnsavedChanges(true);
    };

    // Cancel edit mode
    const cancelEdit = () => {
        setIsEditMode(false);
        // TODO: Could restore original layout here
    };

    return (
        <div className="min-h-screen p-4 md:p-8 bg-[#F7F7F5]">
            <div className="max-w-[1200px] mx-auto">
                {/* Header / Nav */}
                <div className="flex justify-between items-center mb-8 px-2">
                    <h1 className="text-2xl font-bold truncate max-w-[70%] text-gray-900">@{username}</h1>
                    <div className="flex gap-2">
                        {!isOwner && (
                            <button
                                onClick={loginWithGoogle}
                                className="bg-black text-white px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform"
                            >
                                Sign Up
                            </button>
                        )}
                    </div>
                </div>

                <BentoGrid
                    layout={layout}
                    isEditable={isEditMode}
                    onLayoutChange={handleLayoutChange}
                >
                    <div key="profile">
                        <BentoCard title="Profile" className="bg-white justify-center items-center text-center">
                            <div className="p-6 flex flex-col items-center justify-center h-full">
                                <div className="w-32 h-32 bg-gray-200 rounded-full mb-6 overflow-hidden border-4 border-gray-50 flex items-center justify-center shadow-inner">
                                    {profileData?.photoURL ? (
                                        <img src={profileData.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl">👤</span>
                                    )}
                                </div>
                                <h2 className="text-3xl font-extrabold tracking-tight">{profileData?.displayName || username}</h2>
                                <p className="text-gray-500 mt-2 font-medium max-w-xs leading-relaxed">{profileData?.bio}</p>
                            </div>
                        </BentoCard>
                    </div>

                    <div key="instagram">
                        <SocialCard platform="instagram" username="augusto" url="https://instagram.com" />
                    </div>
                    <div key="twitter">
                        <SocialCard platform="twitter" username="augusto" url="https://twitter.com" />
                    </div>
                    <div key="github">
                        <SocialCard platform="github" username="augusto" url="https://github.com" />
                    </div>
                    <div key="youtube">
                        <SocialCard platform="youtube" username="augusto" url="https://youtube.com" />
                    </div>

                    <div key="portfolio">
                        <LinkCard
                            title="My Portfolio"
                            subtitle="Check out my latest case studies and UI designs."
                            url="https://example.com"
                            image="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop"
                        />
                    </div>
                    <div key="blog">
                        <LinkCard
                            title="Read my Blog"
                            subtitle="Thoughts on React, Design Systems, and Bento Grids."
                            url="https://example.com/blog"
                            image="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&h=600&fit=crop"
                        />
                    </div>

                    {/* Dynamically added cards */}
                    {layout.filter(l => l.i.startsWith('card-')).map(l => (
                        <div key={l.i}>
                            <BentoCard className="bg-white flex items-center justify-center h-full">
                                <div className="text-center p-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                                        <Plus className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-gray-400 text-sm font-medium">New Block</p>
                                </div>
                            </BentoCard>
                        </div>
                    ))}
                </BentoGrid>

                {/* Floating Action Buttons */}
                {isOwner && (
                    <>
                        {/* Edit Mode Toolbar */}
                        {isEditMode ? (
                            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-200 rounded-full py-3 px-6 flex items-center gap-3 z-50">
                                {/* Add Block Button */}
                                <button
                                    onClick={addNewCard}
                                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-full font-semibold text-sm transition-all hover:scale-105"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Block
                                </button>

                                <div className="w-px h-8 bg-gray-200"></div>

                                {/* Save Button */}
                                <button
                                    onClick={saveProfile}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>

                                {/* Cancel Button */}
                                <button
                                    onClick={cancelEdit}
                                    className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                                    title="Cancel"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="w-px h-8 bg-gray-200"></div>

                                {/* Logout Button */}
                                <button
                                    onClick={() => logout()}
                                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            /* Edit Button (when not in edit mode) */
                            <button
                                onClick={() => setIsEditMode(true)}
                                className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full font-bold text-sm shadow-2xl shadow-black/20 z-50 flex items-center gap-2 transition-all hover:scale-105"
                            >
                                <Pencil className="w-4 h-4" />
                                Edit Profile
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
