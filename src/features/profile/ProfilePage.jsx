import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import BentoGrid from '../../components/BentoGrid';
import BentoCard from '../../components/BentoCard';
import SocialCard from '../../components/cards/SocialCard';
import LinkCard from '../../components/cards/LinkCard';
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

console.log("ProfilePage.jsx loaded");

// Temporary dummy data
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
    const { username } = useParams(); // URL username
    const { user, logout } = useAuth();

    // Check ownership: Authenticated user matches the URL username
    const isOwner = user && user.email.split('@')[0] === username;

    const [layout, setLayout] = useState(defaultLayout);
    const [profileData, setProfileData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function fetchData() {
            // If isOwner, we want to try fetching from Firestore 'users/{uid}'
            // If public, we also want to fetch from specific UID if we had a mapping (username -> uid).
            // Since we don't have a username->uid mapping service yet, we assume URL username IS user.email.split('@')[0] 
            // and we only support fetching if we know the UID (which requires querying queries).
            // For MVP: 
            // If Owner: Fetch their own doc.
            // If Visitor: We can't easily find doc by 'username' without a query index. 
            // Let's implement query by username ideally, but for MVP step:
            // We'll only show "Real" data if Owner. If visitor, show Mock data for demo.

            if (isOwner) {
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.layout && data.layout.length > 0) setLayout(data.layout);
                        // We could also store 'items' map for card content customization
                        setProfileData({
                            displayName: data.displayName || user.displayName,
                            photoURL: data.photoURL || user.photoURL,
                            bio: data.bio || "Creating cool things."
                        });
                    } else {
                        setProfileData({
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            bio: "Creating cool things."
                        });
                    }
                } catch (e) {
                    console.error("Error fetching profile:", e);
                }
            } else {
                // Mock public view because we don't have username lookup yet
                setProfileData({
                    displayName: "Augusto S.",
                    photoURL: null,
                    bio: "Just a visitor viewing this profile."
                });
            }
        }
        fetchData();
    }, [isOwner, user, username]);

    const handleLayoutChange = (currentLayout) => {
        setLayout(currentLayout);
    };

    const saveProfile = async () => {
        if (!isOwner) return;
        setIsSaving(true);
        try {
            await setDoc(doc(db, "users", user.uid), {
                layout,
                displayName: profileData.displayName,
                bio: profileData.bio,
                photoURL: profileData.photoURL,
                updatedAt: new Date()
            }, { merge: true });
            alert("Profile saved successfully!");
        } catch (e) {
            console.error("Error saving profile", e);
            alert("Failed to save.");
        } finally {
            setIsSaving(false);
        }
    };

    const addNewCard = () => {
        const newId = `card-${Date.now()}`;
        // Add a simple 1x1 block at the bottom
        const newLayoutItem = { i: newId, x: 0, y: Infinity, w: 1, h: 1 };
        setLayout(prev => [...prev, newLayoutItem]);
    };

    return (
        <div className="min-h-screen p-4 md:p-8 bg-[#F7F7F5]">
            <div className="max-w-[1200px] mx-auto">
                {/* Header / Nav */}
                <div className="flex justify-between items-center mb-8 px-2">
                    <h1 className="text-2xl font-bold">@{username}</h1>
                    <div className="flex gap-2">
                        {isOwner ? (
                            <>
                                <button
                                    onClick={addNewCard}
                                    className="bg-white hover:bg-gray-50 text-black px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors border border-gray-100"
                                >
                                    + Add Block
                                </button>
                                <button
                                    onClick={saveProfile}
                                    disabled={isSaving}
                                    className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                    onClick={() => logout()}
                                    className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-transform hover:scale-105">
                                Sign Up
                            </button>
                        )}
                    </div>
                </div>

                <BentoGrid
                    layout={layout}
                    isEditable={isOwner}
                    onLayoutChange={handleLayoutChange}
                >
                    <div key="profile">
                        <BentoCard title="Profile" className="bg-white justify-center items-center text-center">
                            <div className="p-6 flex flex-col items-center justify-center h-full">
                                <div className="w-32 h-32 bg-gray-200 rounded-full mb-6 overflow-hidden border-4 border-gray-50 flex items-center justify-center">
                                    {profileData?.photoURL ? <img src={profileData.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-4xl">👤</span>}
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
                            image="https://images.unsplash.com/photo-1481487484168-9b930d5b7960?q=80&w=2670&auto=format&fit=crop"
                        />
                    </div>
                    <div key="blog">
                        <LinkCard
                            title="Read my Blog"
                            subtitle="Thoughts on React, Design Systems, and Bento Grids."
                            url="https://example.com/blog"
                            image="https://images.unsplash.com/photo-1499750310159-5b5f096fd26b?q=80&w=2670&auto=format&fit=crop"
                            className="text-white"
                        />
                    </div>

                    {/* Dynamically added cards would need a render map or mapping from 'layout' ids to components */}
                    {layout.filter(l => l.i.startsWith('card-')).map(l => (
                        <div key={l.i}>
                            <BentoCard title="New Block" className="bg-white flex items-center justify-center">
                                <p className="text-gray-400">Empty Content</p>
                            </BentoCard>
                        </div>
                    ))}

                </BentoGrid>
            </div>
        </div>
    )
}
