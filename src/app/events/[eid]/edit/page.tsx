'use client'

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { TextField, Button, Alert } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import updateEvent from "@/libs/updateEvent";
import getEvent from "@/libs/getEvent";

export default function EditEventPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const eid = params.eid as string;
    
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [eventDate, setEventDate] = useState<Dayjs | null>(null);
    const [venue, setVenue] = useState<string>("");
    const [organizer, setOrganizer] = useState<string>("");
    const [availableTicket, setAvailableTicket] = useState<number>(0);
    const [posterPicture, setPosterPicture] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const data = await getEvent(eid);
                const event = data.data;
                setName(event.name);
                setDescription(event.description);
                setEventDate(dayjs(event.eventDate));
                setVenue(event.venue);
                setOrganizer(event.organizer);
                setAvailableTicket(event.availableTicket);
                setPosterPicture(event.posterPicture);
            } catch (err) {
                setError("Failed to load event");
            } finally {
                setLoadingData(false);
            }
        };
        fetchEvent();
    }, [eid]);

    const handleUpdate = async () => {
        if (!name || !description || !eventDate || !venue || !organizer || availableTicket <= 0) {
            setError("Please fill in all required fields");
            return;
        }

        if (eventDate.isBefore(dayjs(), 'day')) {
            setError("Event date must not be prior to current date");
            return;
        }

        if (!session?.user?.token) {
            setError("Please sign in to update an event");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await updateEvent(
                session.user.token as string,
                eid,
                name,
                description,
                eventDate.toISOString(),
                venue,
                organizer,
                availableTicket,
                posterPicture || "/img/cover.jpg"
            );
            router.push("/events/manage");
        } catch (err: any) {
            setError(err.message || "Failed to update event");
        } finally {
            setLoading(false);
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
                <Alert severity="error">Only admins can edit events</Alert>
            </main>
        );
    }

    if (loadingData) {
        return <div>Loading...</div>;
    }

    return (
        <main className="w-[100%] flex flex-col items-center space-y-4 p-8">
            <h1 className="text-black text-2xl font-medium">Edit Event</h1>
            <div className="bg-slate-100 rounded-lg px-10 py-8 flex flex-col justify-center items-center gap-5 w-full max-w-[400px]">
                {error && <Alert severity="error" className="w-full">{error}</Alert>}
                
                <TextField 
                    variant="standard" 
                    label="Event Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                />

                <TextField 
                    variant="standard" 
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                />

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Event Date"
                        value={eventDate}
                        onChange={(value: Dayjs | null) => setEventDate(value)}
                        minDate={dayjs()}
                        className="w-full"
                    />
                </LocalizationProvider>

                <TextField 
                    variant="standard" 
                    label="Venue"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    fullWidth
                />

                <TextField 
                    variant="standard" 
                    label="Organizer"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    fullWidth
                />

                <TextField 
                    variant="standard" 
                    label="Available Tickets"
                    type="number"
                    value={availableTicket}
                    onChange={(e) => setAvailableTicket(parseInt(e.target.value) || 0)}
                    inputProps={{ min: 1 }}
                    fullWidth
                />

                <TextField 
                    variant="standard" 
                    label="Poster Picture URL (optional)"
                    value={posterPicture}
                    onChange={(e) => setPosterPicture(e.target.value)}
                    fullWidth
                />

                <Button 
                    variant="contained" 
                    onClick={handleUpdate}
                    disabled={loading}
                    className="w-full bg-sky-600 hover:bg-indigo-600"
                >
                    {loading ? "Updating..." : "Update Event"}
                </Button>
            </div>
        </main>
    );
}

