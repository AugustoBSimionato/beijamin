import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

console.log("AuthContext.jsx loaded");

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            // Check if user exists in Firestore, if not create user doc
            const userRef = doc(db, 'users', result.user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    username: result.user.email.split('@')[0], // Temporary username
                    displayName: result.user.displayName,
                    photoURL: result.user.photoURL,
                    email: result.user.email,
                    createdAt: new Date(),
                    layout: [] // Empty layout initially
                });
            }
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        user,
        loginWithGoogle,
        logout,
        loading
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
                <div className="text-xl font-bold animate-pulse">Loading Bento...</div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
