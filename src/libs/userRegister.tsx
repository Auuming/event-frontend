import { API_BASE_URL } from "./config";

export default async function userRegister(name: string, email: string, tel: string, role: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            email,
            tel,
            role,
            password
        }),
    });
    if (!response.ok) {
        throw new Error('Failed to register');
    }

    return await response.json();
}

