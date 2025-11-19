import Card from "./Card";
import Link from "next/link";

export default async function EventCatalog({eventsJson, session}:{eventsJson:Promise<EventJson>, session:any}) {
    const eventJsonReady = await eventsJson
    
    return (
        <div>
            <div>Explore {eventJsonReady.count} events in our catalog</div>
            <div style={{margin:"20px", display:"flex", flexDirection:"row", flexWrap:"wrap", justifyContent:"space-around", alignContent:"space-around"}}>
                {
                    eventJsonReady.data.map( (eventItem:EventItem) => {
                        const eventId = eventItem.id || eventItem._id;
                        // Ensure posterPicture is a valid string, use fallback if not
                        const posterPicture = eventItem.posterPicture 
                            ? (typeof eventItem.posterPicture === 'string' ? eventItem.posterPicture : '/img/cover.jpg')
                            : '/img/cover.jpg';
                        return (
                            <div key={eventId || `event-${eventItem._id}`} className="w-1/5 mb-4">
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
                }
            </div>
        </div>
    )
}