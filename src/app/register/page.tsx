'use client'

import { useState } from "react";
import { TextField, Select, MenuItem, Button, Alert } from "@mui/material";
import { useRouter } from "next/navigation";
import userRegister from "@/libs/userRegister";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [tel, setTel] = useState<string>("");
    const [role, setRole] = useState<string>("member");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleRegister = async () => {
        if (!name || !email || !tel || !password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await userRegister(name, email, tel, role, password);
            router.push("/api/auth/signin");
        } catch (err: any) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="w-[100%] flex flex-col items-center space-y-4 p-8">
            <h1 className="text-black text-2xl font-medium">User Registration</h1>
            <div className="bg-slate-100 rounded-lg px-10 py-8 flex flex-col justify-center items-center gap-5 w-full max-w-[400px]">
                {error && <Alert severity="error" className="w-full">{error}</Alert>}
                
                <TextField 
                    variant="standard" 
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                />

                <TextField 
                    variant="standard" 
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                />

                <TextField 
                    variant="standard" 
                    label="Tel"
                    value={tel}
                    onChange={(e) => setTel(e.target.value)}
                    fullWidth
                />

                <Select 
                    variant="standard" 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    fullWidth
                >
                    <MenuItem value="member">Member</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                </Select>

                <TextField 
                    variant="standard" 
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                />

                <Button 
                    variant="contained" 
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-full bg-sky-600 hover:bg-indigo-600"
                >
                    {loading ? "Registering..." : "Register"}
                </Button>
            </div>
        </main>
    );
}

