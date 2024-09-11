import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { NewEventSchema, newEventSchema } from "../utils/validation";
import DatePicker from "react-datepicker"; // Make sure to install 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";

export default function NewEvent() {
    const methods = useForm<NewEventSchema>({
        resolver: yupResolver(newEventSchema),
        defaultValues: {
            fee: 0, // Fee is defaulted to 0
            is_ticket_feature_enabled: true, // Default to true
        },
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = methods;

    // For date range picker
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    const onSubmit = (data: NewEventSchema) => {
        console.log(data);
    };

    // Watch event type to toggle venue/online link
    const eventType = watch("event_type");

    return (
        <FormProvider {...methods}>
            <div className="p-8 w-full">
                <p className="text-2xl font-fira text-foreground mb-4">
                    New Event
                </p>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="grid grid-cols-2 gap-6"
                >
                    {/* Name */}
                    <div>
                        <label className="block text-foreground">
                            Event Name
                        </label>
                        <input
                            className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
                            {...register("name")}
                            placeholder="Enter event name"
                        />
                        <p className="text-red-500">{errors.name?.message}</p>
                    </div>

                    {/* Tagline */}
                    <div>
                        <label className="block text-foreground">Tagline</label>
                        <input
                            className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
                            {...register("tag_line")}
                            placeholder="Enter event tagline"
                        />
                        <p className="text-red-500">
                            {errors.tag_line?.message}
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-foreground">
                            Description
                        </label>
                        <textarea
                            className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
                            {...register("description")}
                            placeholder="Enter event description"
                        />
                        <p className="text-red-500">
                            {errors.description?.message}
                        </p>
                    </div>

                    {/* Long Description */}
                    <div>
                        <label className="block text-foreground">
                            Long Description
                        </label>
                        <textarea
                            className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
                            {...register("long_description")}
                            placeholder="Enter long description"
                        />
                        <p className="text-red-500">
                            {errors.long_description?.message}
                        </p>
                    </div>

                    {/* Date Picker (Range) */}
                    <div>
                        <label className="block text-foreground">
                            Event Dates
                        </label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => {
                                if (Array.isArray(date)) {
                                    const [start, end] = date;
                                    setStartDate(start as Date);
                                    setEndDate(end as Date);
                                    setValue("dates", [start!, end!]); // Set both start and end dates in form
                                }
                            }}
                            startDate={startDate}
                            endDate={endDate}
                            selectsRange
                            className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
                            placeholderText="Select event date range"
                        />
                        <p className="text-red-500">{errors.dates?.message}</p>
                    </div>

                    {/* Event Type */}
                    <div>
                        <label className="block text-foreground">
                            Event Type
                        </label>
                        <select
                            className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
                            {...register("event_type")}
                        >
                            <option value="COMPETETION">Competition</option>
                            <option value="WORKSHOP">Workshop</option>
                            <option value="SPEAKER_SESSION">
                                Speaker Session
                            </option>
                            <option value="ONLINE">Online</option>
                            <option value="FEST">Fest</option>
                        </select>
                        <p className="text-red-500">
                            {errors.event_type?.message}
                        </p>
                    </div>

                    {/* Venue/Online Link */}
                    <div>
                        <label className="block text-foreground">
                            {eventType === "ONLINE"
                                ? "Online Event Link"
                                : "Venue"}
                        </label>
                        <input
                            className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
                            {...register(
                                eventType === "ONLINE"
                                    ? "online_event_link"
                                    : "venue",
                            )}
                            placeholder={
                                eventType === "ONLINE"
                                    ? "Enter online event link"
                                    : "Enter event venue"
                            }
                        />
                        <p className="text-red-500">
                            {eventType === "ONLINE"
                                ? errors.online_event_link?.message
                                : errors.venue?.message}
                        </p>
                    </div>

                    {/* Event Page Image URL */}
                    <div>
                        <label className="block text-foreground">
                            Event Page Image URL
                        </label>
                        <input
                            className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
                            {...register("event_page_image_url")}
                            placeholder="Enter event page image URL"
                        />
                        <p className="text-red-500">
                            {errors.event_page_image_url?.message}
                        </p>
                    </div>

                    {/* Ticket Feature */}
                    <div>
                        <label className="block text-foreground">
                            <input
                                type="checkbox"
                                {...register("is_ticket_feature_enabled")}
                            />
                            Ticket Feature Enabled
                        </label>
                        <p className="text-red-500">
                            {errors.is_ticket_feature_enabled?.message}
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    >
                        Create Event
                    </button>
                </form>
            </div>
        </FormProvider>
    );
}
