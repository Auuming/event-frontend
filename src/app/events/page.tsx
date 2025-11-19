import getEvents from "@/libs/getEvents";
import EventCatalog from "@/components/EventCatalog";
import { Suspense } from "react"
import { LinearProgress } from "@mui/material"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export default async function Events() {
  const events = getEvents()
  const session = await getServerSession(authOptions);

  return (
    <div>
      <Suspense fallback={ 
        <div className="w-full p-8">
          <div className="text-center mb-4">
            <p className="text-lg font-medium text-gray-700 mb-2 text-black">Loading events...</p>
            <p className="text-sm text-gray-500 text-black">Please wait while we fetch events</p>
          </div>
          <LinearProgress />
        </div>
      }>
        <EventCatalog eventsJson={events} session={session}/>
      </Suspense>
    </div>
  );
}