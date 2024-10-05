import {
    Description,
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import { useState } from "react";

export default function EventDialog({
    isOpen,
    setIsOpen,
    approval,
    reject,
    action,
}) {
    return (
        <>
            <Dialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4 transition duration-200 ease-out data-[closed]:opacity-0"
            >
                {/* The backdrop, rendered as a fixed sibling to the panel container */}
                <DialogBackdrop className="fixed inset-0 bg-black/50" />

                {/* Full-screen container to center the panel */}
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                    {/* The actual dialog panel  */}
                    <DialogPanel className="max-w-lg space-y-4 bg-card p-12 rounded-lg">
                        <DialogTitle className="font-bold text-2xl text-white">
                            {action === "approved" ? "Approve" : "Reject"}
                        </DialogTitle>
                        <Description className="text-white">
                            {action === "approved"
                                ? "Are you sure you want to Approve?"
                                : "Are you sure you want to Deny?"}
                        </Description>
                        {action === "reject" && (
                            <input
                                type="text"
                                placeholder="Reason for rejection"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        )}
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 border border-white-4 text-white rounded-full"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (action === "approved") {
                                        approval();
                                    } else if (action === "rejected") {
                                        reject();
                                    }
                                    setIsOpen(false);
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-full"
                            >
                                Yes
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    );
}
