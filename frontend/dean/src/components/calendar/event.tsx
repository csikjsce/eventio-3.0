const Event = ({ event }: { event: EventData }) => {
    return (
        <div className="min-w-full p-3 mt-2 bg-card rounded-lg">
            <div className="flex gap-2 text-foreground items-center">
                <img
                    src={event.organizer.photo_url}
                    className="rounded-full aspect-square max-h-10 border border-primary"
                />
                <div className="text-sm">
                    <p className="font-bold font-fira tracking-wider">
                        {event.organizer.name}
                    </p>
                    <p className="text-mute">{event.organizer.email}</p>
                </div>
            </div>
            <div className="mt-3 pl-1">
                <p className="text-xl font-marcellus text-foreground">
                    {event.name}
                </p>
                <p className="text-sm text-mute">
                    {/* {date.format("dddd, MMMM D, YYYY")} at {startTime} */}
                    {event.description}
                </p>
            </div>
        </div>
    );
};

export default Event;
