import { Calendar, Location } from "iconsax-react";

export default function EventMain({ event }: { event: EventData }) {
    return (
        <div className="w-full outline outline-1 outline-card rounded-lg">
            <div
            // style={{
            //     maskImage:
            //         "linear-gradient(to bottom, rgba(0, 0, 0, 1.0) 50%, transparent 100%)", // need to work on this
            // }}
            >
                <img
                    src={event.banner_url}
                    alt={event.name}
                    className="w-full rounded-t-lg max-h-48 object-cover"
                />
            </div>
            <div className="p-4 bg-card rounded-b-lg flex gap-2">
                <img
                    src={event.organizer.photo_url}
                    alt={event.name}
                    className="h-16 w-16 my-auto rounded-full"
                />
                <div className="my-auto flex-1">
                    <h1 className="text-mute">
                        <strong className="text-xl text-foreground font-marcellus tracking-wide">
                            {event.name}
                        </strong>{" "}
                        by {event.organizer.name}
                    </h1>
                    <div className="flex gap-3 text-foreground">
                        <div className="flex gap-1 items-center">
                            <Calendar
                                color="currentColor"
                                className="text-primary"
                                size="20"
                            />
                            <p>
                                {event.dates[0] &&
                                    new Date(event.dates[0]).toDateString()}
                            </p>
                        </div>
                        <div className="flex gap-1 items-center">
                            <Location
                                color="currentColor"
                                className="text-primary"
                                size="20"
                            />
                            <p>{event.venue}</p>
                        </div>
                    </div>
                    <p className="text-mute">{event.description}</p>
                </div>
                <div className="flex gap-2 justify-center items-center text-foreground">
                    <button
                        className="border border-green-600 w-16 h-8 p-1 rounded-full hover:bg-green-600 hover:text-white active:bg-green-700"
                        onClick={() => {}}
                    >
                        ✓
                    </button>
                    <button
                        className="border border-red-600 w-16 h-8 p-1 rounded-full hover:bg-red-600 hover:text-white active:bg-red-700"
                        onClick={() => {}}
                    >
                        X
                    </button>
                </div>
            </div>
        </div>
    );
}
