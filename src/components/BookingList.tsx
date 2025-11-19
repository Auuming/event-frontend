'use client'
import { useAppSelector, AppDispatch } from "@/redux/store"
import { useDispatch } from "react-redux"
import { removeReservation } from "@/redux/features/bookSlice"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import getReservations from "@/libs/getReservations"
import deleteReservation from "@/libs/deleteReservation"
import getUserProfile from "@/libs/getUserProfile"
import getEvent from "@/libs/getEvent"
import Link from "next/link"
import { TextField, Select, MenuItem, FormControl, InputLabel, Button } from "@mui/material"
import jsPDF from 'jspdf'

export default function ReservationList() {
    const { data: session } = useSession()
    const dispatch = useDispatch<AppDispatch>()
    const [reservations, setReservations] = useState<ReservationItem[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [searchType, setSearchType] = useState<string>('event')
    
    useEffect(() => {
        const fetchReservations = async () => {
            if (session?.user?.token) {
                try {
                    const data = await getReservations(session.user.token as string)
                    setReservations(data.data || [])
                } catch (err) {
                    console.error('Failed to fetch reservations:', err)
                } finally {
                    setLoading(false)
                }
            } else {
                setLoading(false)
            }
        }
        fetchReservations()
    }, [session])
    
    const handleDelete = async (reservation: ReservationItem) => {
        if (!session?.user?.token || !reservation._id) return
        
        try {
            await deleteReservation(session.user.token as string, reservation._id)
            setReservations(reservations.filter(r => r._id !== reservation._id))
            dispatch(removeReservation(reservation))
        } catch (err) {
            console.error('Failed to delete reservation:', err)
            alert('Failed to delete reservation')
        }
    }
    
    const handleExportToPDF = async (reservation: ReservationItem) => {
        // Extract reservation data
        const eventName = reservation.eventName || 
            (typeof reservation.event === 'string' ? reservation.event : 
            (reservation.event as any)?.name || 'Unknown Event');
        
        const eventDateObj = typeof reservation.event === 'object' && reservation.event?.eventDate
            ? new Date(reservation.event.eventDate)
            : null;
        const eventDate = eventDateObj ? eventDateObj.toLocaleDateString() : 'N/A';
        const eventStatus = getEventStatus(eventDateObj);
        
        // Get user data - from reservation for admin, or from GET /auth/me for members
        let userName = typeof reservation.user === 'object' && reservation.user?.name
            ? reservation.user.name
            : (typeof reservation.user === 'string' ? reservation.user : 'N/A');
        
        let userEmail = typeof reservation.user === 'object' && reservation.user?.email
            ? reservation.user.email
            : 'N/A';
        
        let userTel = typeof reservation.user === 'object' && reservation.user?.tel
            ? reservation.user.tel
            : 'N/A';
        
        // For members, fetch user data from GET /auth/me if not available in reservation
        if (session?.user?.role === 'member' && (!userName || userName === 'N/A' || !userEmail || userEmail === 'N/A' || !userTel || userTel === 'N/A')) {
            try {
                if (session.user.token) {
                    const userData = await getUserProfile(session.user.token as string);
                    if (userData.data) {
                        userName = userData.data.name || userName;
                        userEmail = userData.data.email || userEmail;
                        userTel = userData.data.tel || userTel;
                    }
                }
            } catch (err) {
                console.error('Failed to fetch user profile:', err);
            }
        }
        
        let venue = typeof reservation.event === 'object' && reservation.event?.venue
            ? reservation.event.venue
            : 'N/A';
        
        let organizer = typeof reservation.event === 'object' && reservation.event?.organizer
            ? reservation.event.organizer
            : 'N/A';
        
        // If organizer or venue is missing, fetch full event details
        const eventId = typeof reservation.event === 'object' && reservation.event?._id
            ? reservation.event._id
            : (typeof reservation.event === 'string' ? reservation.event : null);
        
        if (eventId && (!organizer || organizer === 'N/A' || !venue || venue === 'N/A')) {
            try {
                const eventData = await getEvent(eventId);
                if (eventData.data) {
                    if (!organizer || organizer === 'N/A') {
                        organizer = eventData.data.organizer || 'N/A';
                    }
                    if (!venue || venue === 'N/A') {
                        venue = eventData.data.venue || 'N/A';
                    }
                }
            } catch (err) {
                console.error('Failed to fetch event details:', err);
            }
        }

        // Create PDF
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(18);
        doc.text('Reservation Details', 20, 20);
        
        // Line separator
        doc.setLineWidth(0.5);
        doc.line(20, 25, 190, 25);
        
        // Reservation details
        let yPos = 35;
        doc.setFontSize(12);
        
        const addPDFLine = (label: string, value: string) => {
            doc.setFont('helvetica', 'bold');
            doc.text(label, 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(value || 'N/A', 80, yPos);
            yPos += 10;
        };
        
        // Top section: Reservation ID and Ticket Amount
        addPDFLine('Reservation ID:', reservation._id || 'N/A');
        addPDFLine('Ticket Amount:', reservation.ticketAmount.toString());
        
        // Event Details section
        yPos += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('Event Details:', 20, yPos);
        yPos += 10;
        addPDFLine('Event Name:', eventName);
        addPDFLine('Event Date:', eventDate);
        addPDFLine('Status:', eventStatus ? eventStatus.charAt(0).toUpperCase() + eventStatus.slice(1) : 'N/A');
        addPDFLine('Venue:', venue);
        addPDFLine('Organizer:', organizer);
        
        // User Details section
        yPos += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('User Details:', 20, yPos);
        yPos += 10;
        addPDFLine('User Name:', userName);
        addPDFLine('User Email:', userEmail);
        addPDFLine('User Tel:', userTel);
        
        // Footer
        yPos += 10;
        doc.setLineWidth(0.5);
        doc.line(20, yPos, 190, yPos);
        yPos += 10;
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPos);
        
        // Save PDF
        const fileName = `Reservation_${reservation._id || 'unknown'}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    }
    
    // Calculate status helper function
    const getEventStatus = (date: Date | null): string => {
        if (!date) return '';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDateOnly = new Date(date);
        eventDateOnly.setHours(0, 0, 0, 0);
        return eventDateOnly < today ? 'end' : 'upcoming';
    };

    // Filter reservations based on status and search
    const filteredReservations = reservations.filter((reservation) => {
        // Status filter
        const eventDateObj = typeof reservation.event === 'object' && reservation.event?.eventDate
            ? new Date(reservation.event.eventDate)
            : null;
        const eventStatus = getEventStatus(eventDateObj);
        if (statusFilter !== 'all' && eventStatus !== statusFilter) {
            return false;
        }

        // Search filter
        if (searchQuery.trim() !== '') {
            const eventName = reservation.eventName || 
                (typeof reservation.event === 'string' ? reservation.event : 
                (reservation.event as any)?.name || '');
            
            if (session?.user?.role === 'admin') {
                // Admin can search by event or user name
                const userName = typeof reservation.user === 'object' && reservation.user?.name
                    ? reservation.user.name
                    : '';
                
                if (searchType === 'event') {
                    if (!eventName.toLowerCase().includes(searchQuery.toLowerCase())) {
                        return false;
                    }
                } else if (searchType === 'user') {
                    if (!userName.toLowerCase().includes(searchQuery.toLowerCase())) {
                        return false;
                    }
                }
            } else {
                // Member can only search by event name
                if (!eventName.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return false;
                }
            }
        }

        return true;
    });

    if (loading) return <div className="text-black">Loading...</div>
    if (!session) return <div className="text-black">Please sign in to view your reservations</div>
    
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 text-black">
                {session.user?.role === 'admin' ? 'All Reservations' : 'My Reservations'}
            </h1>
            
            {/* Filters and Search */}
            <div className="mb-4 flex flex-col gap-4 md:flex-row">
                {/* Status Filter */}
                <FormControl variant="standard" className="min-w-[200px]">
                    <InputLabel className="text-black">Filter by Status</InputLabel>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="Filter by Status"
                        className="text-black"
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="upcoming">Upcoming</MenuItem>
                        <MenuItem value="end">End</MenuItem>
                    </Select>
                </FormControl>

                {/* Search */}
                {session.user?.role === 'admin' ? (
                    <div className="flex gap-2 flex-1">
                        <FormControl variant="standard" className="min-w-[120px]">
                            <InputLabel className="text-black">Search By</InputLabel>
                            <Select
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                                label="Search By"
                                className="text-black"
                            >
                                <MenuItem value="event">Event Name</MenuItem>
                                <MenuItem value="user">User Name</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            variant="standard"
                            placeholder={`Search by ${searchType === 'event' ? 'event name' : 'user name'}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1"
                            InputProps={{
                                className: "text-black"
                            }}
                        />
                    </div>
                ) : (
                    <TextField
                        variant="standard"
                        placeholder="Search by event name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                        InputProps={{
                            className: "text-black"
                        }}
                    />
                )}
            </div>

            {filteredReservations.length === 0 ? (
                <div className="text-black text-center w-full flex justify-center items-center py-8">No reservations found</div>
            ) : (
                filteredReservations.map((reservation) => {
                    // Handle event as either string or object
                    const eventName = reservation.eventName || 
                        (typeof reservation.event === 'string' ? reservation.event : 
                        (reservation.event as any)?.name || 'Unknown Event');
                    
                    // Handle eventDate from event object
                    const eventDateObj = typeof reservation.event === 'object' && reservation.event?.eventDate
                        ? new Date(reservation.event.eventDate)
                        : null;
                    const eventDate = eventDateObj ? eventDateObj.toLocaleDateString() : null;
                    
                    const eventStatus = getEventStatus(eventDateObj);
                    
                    // Handle user as either string or object (for admin view)
                    const userName = typeof reservation.user === 'object' && reservation.user?.name
                        ? reservation.user.name
                        : null;
                    
                    return (
                    <div className="bg-slate-200 rounded px-5 py-2 my-2 text-black" key={reservation._id}>
                        <div className="text-xl">Event: {eventName}</div>
                        {eventDate && (
                            <div className="text-sm">Event Date: {eventDate}</div>
                        )}
                        {eventStatus && (
                            <div className="text-sm">Status: <span className="font-semibold capitalize">{eventStatus}</span></div>
                        )}
                        {session.user?.role === 'admin' && userName && (
                            <div className="text-sm text-black mb-1">User: <span className="font-semibold">{userName}</span></div>
                        )}
                        <div className="text-sm">Tickets: {reservation.ticketAmount}</div>
                        <div className="mt-2 flex gap-2">
                            <Button
                                variant="contained"
                                onClick={() => handleExportToPDF(reservation)}
                                className="bg-purple-600 hover:bg-purple-700"
                                size="small"
                            >
                                Export PDF
                            </Button>
                            <Link 
                                href={`/reservations/${reservation._id}/edit`}
                                className="block rounded-md bg-blue-600 hover:bg-blue-700 px-3 py-2 text-white shadow-sm"
                            >
                                Edit
                            </Link>
                            <button 
                                className="block rounded-md bg-red-600 hover:bg-red-700 px-3 py-2 text-white shadow-sm"
                                onClick={() => handleDelete(reservation)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                    );
                })
            )}
        </div>
    )
}