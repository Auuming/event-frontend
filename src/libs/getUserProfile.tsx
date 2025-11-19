import { API_BASE_URL } from "./config";

export default async function getUserProfile(token: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-store',
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch user profile:', response.status, errorText);
            throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching user profile:', error);
        console.error('API_BASE_URL:', API_BASE_URL);
        throw error;
    }
}