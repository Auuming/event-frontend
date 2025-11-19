import { API_BASE_URL } from "./config";

export default async function userLogIn(userEmail: string, userPassword: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: userEmail,
            password: userPassword
        }),
    });
    if (!response.ok) {
        throw new Error('Failed to login');
    }

    return await response.json();

}