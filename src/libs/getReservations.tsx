import { API_BASE_URL } from "./config";

export default async function getReservations(token?: string) {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/ticketing`, {
            method: 'GET',
            headers,
            cache: 'no-store',
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch reservations:', response.status, errorText);
            throw new Error(`Failed to fetch reservations: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching reservations:', error);
        console.error('API_BASE_URL:', API_BASE_URL);
        throw error;
    }
}

