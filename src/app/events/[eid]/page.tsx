import Image from "next/image";
import getEvent from "@/libs/getEvent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import Link from "next/link";
import { Suspense } from "react";
import { LinearProgress } from "@mui/material";

async function EventDetailContent({eid, session}: {eid: string, session: any}) {
    const eventDetail = await getEvent(eid);

    return (
            <div className="flex flex-row my-5">
            <Image src = { eventDetail.data.posterPicture }
                    alt = 'Event Image'
                    width={0} height={0} sizes="100vw"
                    className="rounded-lg w-[30%]"
                />
                <div className="text-md mx-5 text-left">
                    <div className="text-xl font-bold mb-2">Name: { eventDetail.data.name }</div>
                    <div className="text-md mx-5 mb-2">Description: { eventDetail.data.description }</div>
                    <div className="text-md mx-5 mb-2">Event Date: { new Date(eventDetail.data.eventDate).toLocaleDateString() }</div>
                <div className="text-md mx-5 mb-2">Venue: { eventDetail.data.venue }</div>
                <div className="text-md mx-5 mb-2">Organizer: { eventDetail.data.organizer }</div>
                <div className="text-md mx-5 mb-2">Available Tickets: { eventDetail.data.availableTicket }</div>
                <div className="mt-4 flex gap-2">
                    {session?.user?.role === 'member' ? (
                        <Link href={`/reservations/create?eventId=${eid}`} className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer no-underline">
                            Reserve
                            </Link>
                    ) : !session ? (
                        <Link href="/api/auth/signin" className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer no-underline">
                            Sign In to Reserve
                            </Link>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default async function EventDetailPage( {params} : { params: Promise<{eid:string}>} ) {
    const {eid} = await params;
    const session = await getServerSession(authOptions);

    return (
        <main className="text-center p-5 text-black">
            <Suspense fallback={ 
                <div className="w-full p-8">
                    <div className="text-center mb-4">
                        <p className="text-lg font-medium text-gray-700 mb-2">Loading event details...</p>
                        <p className="text-sm text-gray-500">Please wait while we fetch event information</p>
                    </div>
                    <LinearProgress />
                </div>
            }>
                <EventDetailContent eid={eid} session={session} />
            </Suspense>
        </main>
    )
}

// export async function generateStaticParams() {
//     return [
//         {vid: "001"},
//         {vid: "002"},
//         {vid: "003"},
//     ]
// }