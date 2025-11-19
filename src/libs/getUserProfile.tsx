import { API_BASE_URL } from "./config";

export default async function getUserProfile(token: string) {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch user profile');
    }

    return await response.json();
}