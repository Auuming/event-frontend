'use client'

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TextField, Button, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import getUserProfile from "@/libs/getUserProfile";
import updateUser from "@/libs/updateUser";
import deleteUser from "@/libs/deleteUser";
import { signOut } from "next-auth/react";

export default function UserPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [user, setUser] = useState<UserItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState("");
    const [tel, setTel] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            if (!session?.user?.token) {
                setError("Please sign in");
                setLoading(false);
                return;
            }

            try {
                const data = await getUserProfile(session.user.token as string);
                setUser(data.data);
                setName(data.data.name);
                setTel(data.data.tel);
            } catch (err) {
                setError("Failed to load user profile");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [session]);

    const validatePhoneNumber = (phone: string): boolean => {
        // Valid phone number: 10 digits, can have dashes, spaces, or parentheses
        // Examples: 1234567890, 123-456-7890, (123) 456-7890, 123 456 7890
        const phoneRegex = /^[\d\s\-\(\)]{10,}$/;
        const digitsOnly = phone.replace(/\D/g, '');
        return phoneRegex.test(phone) && digitsOnly.length >= 10 && digitsOnly.length <= 15;
    };

    const handleUpdate = async () => {
        if (!name || !tel) {
            setError("Name and phone number are required");
            return;
        }

        if (!validatePhoneNumber(tel)) {
            setError("Please enter a valid phone number (10-15 digits)");
            return;
        }

        if (!session?.user?.token) {
            setError("Please sign in to update profile");
            return;
        }

        setUpdateLoading(true);
        setError("");

        try {
            await updateUser(session.user.token as string, name, tel);
            // Refresh user data
            const data = await getUserProfile(session.user.token as string);
            setUser(data.data);
            setEditMode(false);
        } catch (err: any) {
            setError(err.message || "Failed to update profile");
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!session?.user?.token) {
            setError("Please sign in to delete account");
            return;
        }

        setDeleteLoading(true);
        setError("");

        try {
            await deleteUser(session.user.token as string);
            // Sign out and redirect to home
            await signOut({ callbackUrl: '/' });
        } catch (err: any) {
            setError(err.message || "Failed to delete account");
            setDeleteLoading(false);
        }
    };

    if (!session) {
        return (
            <main className="w-[100%] flex flex-col items-center space-y-4 p-8 mt-16">
                <Alert severity="warning">Please sign in to view your profile</Alert>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="w-[100%] flex flex-col items-center space-y-4 p-8 mt-16">
                <div className="text-black">Loading...</div>
            </main>
        );
    }

    return (
        <main className="w-[100%] flex flex-col items-center space-y-4 p-8 mt-16">
            <h1 className="text-black text-2xl font-medium">User Profile</h1>
            <div className="bg-slate-100 rounded-lg px-10 py-8 flex flex-col justify-center items-center gap-5 w-full max-w-[400px]">
                {error && <Alert severity="error" className="w-full">{error}</Alert>}
                
                {!editMode ? (
                    <>
                        <div className="w-full">
                            <div className="text-sm text-gray-600 mb-1 text-black">Name</div>
                            <div className="text-lg font-semibold text-black">{user?.name}</div>
                        </div>
                        <div className="w-full">
                            <div className="text-sm text-gray-600 mb-1 text-black">Email</div>
                            <div className="text-lg font-semibold text-black">{user?.email}</div>
                        </div>
                        <div className="w-full">
                            <div className="text-sm text-gray-600 mb-1 text-black">Phone Number</div>
                            <div className="text-lg font-semibold text-black">{user?.tel}</div>
                        </div>
                        <div className="w-full">
                            <div className="text-sm text-gray-600 mb-1 text-black">Role</div>
                            <div className="text-lg font-semibold capitalize text-black">{user?.role}</div>
                        </div>
                        <div className="w-full flex gap-2 mt-4">
                            <Button 
                                variant="contained" 
                                onClick={() => setEditMode(true)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                Edit Personal Info
                            </Button>
                            <Button 
                                variant="contained" 
                                onClick={() => setDeleteDialogOpen(true)}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                            >
                                Delete User
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <TextField 
                            variant="standard" 
                            label="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                            required
                        />
                        <TextField 
                            variant="standard" 
                            label="Phone Number"
                            value={tel}
                            onChange={(e) => setTel(e.target.value)}
                            fullWidth
                            required
                            helperText="Enter a valid phone number (10-15 digits)"
                        />
                        <div className="w-full flex gap-2 mt-4">
                            <Button 
                                variant="contained" 
                                onClick={handleUpdate}
                                disabled={updateLoading}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                {updateLoading ? "Updating..." : "Save Changes"}
                            </Button>
                            <Button 
                                variant="outlined" 
                                onClick={() => {
                                    setEditMode(false);
                                    setName(user?.name || "");
                                    setTel(user?.tel || "");
                                    setError("");
                                }}
                                disabled={updateLoading}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle className="text-black">Delete Account</DialogTitle>
                <DialogContent>
                    <p className="text-black">Are you sure you want to delete your account? This action cannot be undone.</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDelete} 
                        color="error" 
                        variant="contained"
                        disabled={deleteLoading}
                    >
                        {deleteLoading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </main>
    );
}

