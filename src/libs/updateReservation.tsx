import { API_BASE_URL } from "./config";

export default async function updateReservation(token: string, rid: string, ticketAmount: number) {
    const response = await fetch(`${API_BASE_URL}/ticketing/${rid}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            ticketAmount
        }),
    });
    if (!response.ok) {
        // For 400 Bad Request, try to parse the error message from response
        if (response.status === 400) {
            try {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Failed to update reservation';
                throw new Error(errorMessage);
            } catch (parseError) {
                // If it's already an Error we threw, re-throw it
                if (parseError instanceof Error) {
                    throw parseError;
                }
                // If parsing fails, throw generic error
                throw new Error('Failed to update reservation');
            }
        }
        // For other errors, throw generic error
        throw new Error('Failed to update reservation');
    }

    return await response.json();
}

