import {
    Description,
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import { useState } from "react";

export default function EventDialog() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button onClick={() => setIsOpen(true)}>Open dialog</button>
            <Dialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4 transition duration-200 ease-out data-[closed]:opacity-0"
                transition
            >
                {/* The backdrop, rendered as a fixed sibling to the panel container */}
                <DialogBackdrop className="fixed inset-0 bg-black/50" />

                {/* Full-screen container to center the panel */}
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                    {/* The actual dialog panel  */}
                    <DialogPanel className="max-w-lg space-y-4 bg-white p-12">
                        <DialogTitle className="font-bold">
                            Deactivate account
                        </DialogTitle>
                        <Description>
                            This will permanently deactivate your account
                        </Description>
                        <p>
                            Are you sure you want to deactivate your account?
                            All of your data will be permanently removed.
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => setIsOpen(false)}>
                                Cancel
                            </button>
                            <button onClick={() => setIsOpen(false)}>
                                Deactivate
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    );
}
