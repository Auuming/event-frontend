import { API_BASE_URL } from "./config";

export default async function getEvents() {
    const response = await fetch(`${API_BASE_URL}/events`)
    if (!response.ok) {
        throw new Error("Failed to fetch events")
    }
    return await response.json()
}