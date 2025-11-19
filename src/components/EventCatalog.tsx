import Card from "./Card";
import Link from "next/link";

export default async function EventCatalog({eventsJson, session}:{eventsJson:Promise<EventJson>, session:any}) {
    const eventJsonReady = await eventsJson
    
    return (
        <div>
            <div className="text-black text-center">Explore {eventJsonReady.count} events in our catalog</div>
            <div className="m-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {eventJsonReady.data.length === 0 ? (
                    <div className="text-black text-center w-full flex justify-center items-center py-8 col-span-full">No events found</div>
                ) : (
                    eventJsonReady.data.map( (eventItem:EventItem) => {
                        const eventId = eventItem.id || eventItem._id;
                        // Ensure posterPicture is a valid string, use fallback if not
                        const posterPicture = eventItem.posterPicture 
                            ? (typeof eventItem.posterPicture === 'string' ? eventItem.posterPicture : '/img/cover.jpg')
                            : '/img/cover.jpg';
                        
                        return (
                            <div key={eventId || `event-${eventItem._id}`} className="w-full">
                                <Link href={`/events/${eventId}`}>
                                    <Card 
                                        eventName={eventItem.name} 
                                        imgSrc={posterPicture}
                                        description={eventItem.description}
                                        eventDate={eventItem.eventDate}
                                        availableTicket={eventItem.availableTicket}
                                    />
                                </Link>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    )
}