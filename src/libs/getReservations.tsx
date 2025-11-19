import { API_BASE_URL } from "./config";

export default async function getReservations(token?: string) {
    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/ticketing`, {
        method: 'GET',
        headers
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch reservations');
    }

    return await response.json();
}

