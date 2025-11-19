import { API_BASE_URL } from "./config";

export default async function getEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch events:', response.status, errorText);
            throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching events:', error);
        console.error('API_BASE_URL:', API_BASE_URL);
        throw error;
    }
}