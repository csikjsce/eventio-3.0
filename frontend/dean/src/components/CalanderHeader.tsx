import EventBg from "../assets/EventBg.svg";

const EventHeader = () => {
    return (
        <div className="w-3/4 ml-7">
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "start",
                    position: "relative",
                    height: "100%",
                }}
            >
                <img
                    src={EventBg}
                    alt="Event Background"
                    style={{
                        width: "100%",
                        position: "relative",
                        top: 0,
                        left: 0,
                    }}
                />
                <p
                    className="mb-4 ml-8"
                    style={{
                        position: "absolute",
                        color: "white",
                        fontSize: "40px", // Adjusted to make it a bit smaller
                        fontFamily: "serif",
                        fontWeight: "600",
                        zIndex: 1, // Ensure the text appears above the image
                    }}
                >
                    Calander
                </p>
            </div>
        </div>
    );
};

export default EventHeader;
