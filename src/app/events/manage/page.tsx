'use client'

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Alert } from "@mui/material";
import getEvents from "@/libs/getEvents";
import deleteEvent from "@/libs/deleteEvent";

export default function ManageEventsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getEvents();
                setEvents(data.data || []);
            } catch (err) {
                setError("Failed to fetch events");
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleDelete = async (eid: string) => {
        if (!session?.user?.token) return;
        if (!confirm("Are you sure you want to delete this event?")) return;

        try {
            await deleteEvent(session.user.token as string, eid);
            setEvents(events.filter(e => e.id !== eid));
        } catch (err) {
            alert("Failed to delete event");
        }
    };

    if (!session) {
        return (
            <main className="w-[100%] flex flex-col items-center space-y-4 p-8">
                <Alert severity="warning">Please sign in</Alert>
            </main>
        );
    }

    if (session.user?.role !== 'admin') {
        return (
            <main className="w-[100%] flex flex-col items-center space-y-4 p-8">
                <Alert severity="error">Only admins can manage events</Alert>
            </main>
        );
    }

    if (loading) return <div>Loading...</div>;

    return (
        <main className="w-[100%] flex flex-col items-center space-y-4 p-8">
            <h1 className="text-black text-2xl font-medium">Manage Events</h1>
            {error && <Alert severity="error">{error}</Alert>}
            <Link href="/events/create">
                <Button variant="contained" className="bg-green-600 hover:bg-green-700 mb-4">
                    Create New Event
                </Button>
            </Link>
            <div className="w-full max-w-4xl">
                {events.length === 0 ? (
                    <div>No events found</div>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className="bg-slate-200 rounded px-5 py-2 my-2 text-black">
                            <div className="text-xl font-bold">{event.name}</div>
                            <div className="text-sm">Date: {new Date(event.eventDate).toLocaleDateString()}</div>
                            <div className="text-sm">Venue: {event.venue}</div>
                            <div className="text-sm">Organizer: {event.organizer}</div>
                            <div className="text-sm">Available Tickets: {event.availableTicket}</div>
                            <div className="mt-2 flex gap-2">
                                <Link href={`/events/${event.id}/edit`}>
                                    <Button variant="contained" className="bg-blue-600 hover:bg-blue-700">
                                        Edit
                                    </Button>
                                </Link>
                                <Button 
                                    variant="contained" 
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleDelete(event.id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}

