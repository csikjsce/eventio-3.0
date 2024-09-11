import React from "react";
import EventHead from "../../components/EventHeader";
import Cards from "../../components/Cards";

const event = () => {
    return (
        <div className="pl-60">
            <div>
                <EventHead />
                <Cards />
            </div>
        </div>
    );
};

export default event;
