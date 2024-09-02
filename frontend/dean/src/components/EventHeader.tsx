import React from 'react'
import EventBg from "../assets/EventBg.svg"

const EventHeader = () => {
    return (
        <div className='w-full'>
            <div style={{ position: "relative" }}>
                <img
                    src={EventBg}
                    alt="Event Background"
                    style={{ width: "100%" }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: "45%",
                        left: "18%",
                        transform: "translate(-50%, -50%)",
                        color: "white",
                        fontSize: "50px",
                        fontFamily: "serif",
                        fontWeight: "600",
                    }}
                >
                    Event List
                </div>
            </div>
            
        </div>
    );     
};

export default EventHeader