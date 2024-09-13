import React from "react";
import EventHead from "../../components/EventHeader";
import Cards from "../../components/Cards";
import Table from "../../components/table";
import { TabPanel } from "@material-tailwind/react";
const event = () => {
    return (
        <div className="pl-60">
            <div>
                <EventHead />
                <Table />
            </div>
        </div>
    );
};

export default event;
