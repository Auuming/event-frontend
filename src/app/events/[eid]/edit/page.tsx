import EditEventForm from "@/components/EditEventForm";

export default async function EditEventPage({ params }: { params: Promise<{ eid: string }> }) {
    const { eid } = await params;
    return <EditEventForm eid={eid} />;
}
