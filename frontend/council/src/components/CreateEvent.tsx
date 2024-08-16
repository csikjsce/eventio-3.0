import React from 'react';
import { Button } from '@material-tailwind/react';

export default function CreateEvent() {
    return (
        <div className="flex items-center justify-between bg-gradient-to-r from-red-500 to-orange-500 p-4 rounded-lg shadow-lg">
            <div>
                <h3 className="text-white text-lg font-semibold">Create Event</h3>
                <p className="text-white text-sm">Create a new event proposal</p>
            </div>
            <Button
                color="white"
                className="flex items-center justify-center w-10 h-10 rounded-full"
            >
                <span className="text-red-500 text-xl">+</span>
            </Button>
        </div>
    );
}
