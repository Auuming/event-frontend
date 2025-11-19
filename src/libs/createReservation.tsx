import { API_BASE_URL } from "./config";

export default async function createReservation(token: string, event: string, ticketAmount: number) {
    const response = await fetch(`${API_BASE_URL}/ticketing`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            event,
            ticketAmount
        }),
    });
    if (!response.ok) {
        // For 400 Bad Request, try to parse the error message from response
        if (response.status === 400) {
            try {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Failed to create reservation';
                throw new Error(errorMessage);
            } catch (parseError) {
                // If it's already an Error we threw, re-throw it
                if (parseError instanceof Error) {
                    throw parseError;
                }
                // If parsing fails, throw generic error
                throw new Error('Failed to create reservation');
            }
        }
        // For other errors, throw generic error
        throw new Error('Failed to create reservation');
    }

    return await response.json();
}

