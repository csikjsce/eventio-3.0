import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { NewEventSchema, newEventSchema } from "../utils/validation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import { useNavigate } from "react-router-dom";

export default function NewEvent() {

    const navigate = useNavigate();

    const methods = useForm<NewEventSchema>({
        resolver: yupResolver(newEventSchema),
        defaultValues: {
            fee: 0,
            is_ticket_feature_enabled: false,
        },
    });

    const { register, handleSubmit, setValue, watch, formState: { errors } } = methods;

    // States for date inputs
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    const [loading , setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [success, setSuccess] = useState(false);


    function getDates(start: Date | null, end: Date | null) {
        const dateArray: Date[] = [];
        if (start === null || end === null) {
            return dateArray;
        }
        const currentDate = start;
        while (currentDate <= end) {
            dateArray.push(new Date (currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dateArray;
    }


    const onSubmit = async (data: NewEventSchema) => {
        data.banner_url = data.event_page_image_url;
        data.logo_image_url = data.event_page_image_url;
        console.log(data);
        try {
            setLoading(true);
            const response = await axios.post("http://localhost:8000/api/v1/event/p/create", data, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            setLoading(false);
            console.log(response.data);
            setSuccess(true);
            setShowAlert(true);
            setTimeout(() => {
                setShowAlert(false);
                navigate("/");
            }, 2000);
        } catch (error) {
            console.error(error);
        }
    };

    const eventType = watch("event_type");

    // const dates = watch("dates");

    // function getStartDate() {
    //     const dates = getValues("dates");
    //     if (!dates || dates.length === 0) {
    //         return undefined;
    //     }
    //     return dates[0];
    // }

    // function getEndDate() {
    //     const dates = getValues("dates");
    //     if (!dates || dates.length === 0) {
    //         return undefined;
    //     }
    //     return dates[dates.length - 1];
    // }

    // useEffect(() => {
    //     console.log(dates);
    // }, [dates]);
    // useEffect(() => {console.log(startDate, endDate)}, [startDate, endDate]);

    return (
        <FormProvider {...methods}>
            <div className="p-8 w-full relative">
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
                        <label className="block text-foreground">
                            Tagline
                        </label>
                        <input
                            className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
                            {...register("tag_line")}
                            placeholder="Some Catchy Phrase"
                        />
                        <p className="text-red-500">{errors.tag_line?.message}</p>
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
                        <p className="text-red-500">{errors.description?.message}</p>
                    </div>

                    {/* Long Description */}
                    <div>
                        <label className="block text-foreground">
                            Long Description
                        </label>
                        <textarea
                            className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
                            {...register("long_description")}
                            placeholder="Long description"
                        />
                        <p className="text-red-500">{errors.long_description?.message}</p>
                    </div>

                    <div>
                        <label className="block text-foreground">Event Dates</label>
                        <DatePicker
                        // selected={startDate}
                        onChange={(date) => {
                            if (Array.isArray(date)) {
                            const [start, end] = date;
                            console.log(start, end);
                            setStartDate(start || undefined);
                            setEndDate(end || undefined);
                            const dates = getDates(start, end);
                            setValue("dates", dates); // Set both start and end dates in form
                            // setStartDate(dates[0]);
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
                                    : "venue"
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
                            Image URL
                        </label>
                        <input
                            className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
                            {...register("event_page_image_url")}
                            placeholder="Enter image URL"
                        />
                        <p className="text-red-500">
                            {errors.event_page_image_url?.message}
                        </p>
                    </div>

                    {/* Fee */}
                    <div>
                        <label className="block text-foreground">
                            Fee
                        </label>
                        <input
                            className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
                            {...register("fee")}
                            placeholder="Enter event fee"
                        />
                        <p className="text-red-500">
                            {errors.fee?.message}
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`text-white px-4 py-2 rounded-md col-span-2 flex items-center justify-center ${loading ? "bg-primary/50 disabled:" : "bg-primary"}`}
                    >
                        {loading ? <Spinner /> : "Create Event"}
                    </button>

                </form>
                {showAlert && (
                    <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 translate-y-5 w-96 p-2 rounded-md text-center ${success ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}>
                        {success ? "Event created successfully!" : "Failed to create event!"}
                    </div>
                )}
            </div>
        </FormProvider>
    );
}
