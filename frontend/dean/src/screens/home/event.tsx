import EventHead from "../../components/EventHeader";
import Table from "../../components/table";
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
