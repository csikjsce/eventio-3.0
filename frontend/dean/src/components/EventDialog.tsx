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
    isRejected,
    showPrincipalOption = true,
}: {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    approval: (sendToPrincipal?: boolean) => void;
    reject: (comment: string) => void;
    isRejected: boolean;
    showPrincipalOption?: boolean;
}) {
    const [sendToPrincipal, setSendToPrincipal] = useState(false);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isRejected === false) {
            approval(sendToPrincipal);
            setIsOpen(false);
        } else {
            const comment = (e.target as HTMLFormElement).comment.value;
            reject(comment);
            setIsOpen(false);
        }
    };

    return (
        <>
            <Dialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4 transition duration-200 ease-out data-[closed]:opacity-0"
            >
                <DialogBackdrop className="fixed inset-0 bg-black/50" />

                <form
                    onSubmit={onSubmit}
                    className="fixed inset-0 flex w-screen items-center justify-center p-4"
                >
                    <DialogPanel className="max-w-lg space-y-4 bg-card p-8 rounded-lg">
                        <DialogTitle className="font-bold text-2xl text-foreground">
                            {!isRejected ? "Approve" : "Reject"}
                        </DialogTitle>
                        <Description className="text-foreground">
                            {!isRejected
                                ? "Are you sure you want to approve this event?"
                                : "Are you sure you want to reject this event?"}
                        </Description>
                        {!isRejected && showPrincipalOption && (
                            <label className="flex items-center gap-2 text-foreground">
                                <input
                                    type="checkbox"
                                    checked={sendToPrincipal}
                                    onChange={e => setSendToPrincipal(e.target.checked)}
                                    className="accent-primary"
                                />
                                Send it to the principal for approval
                            </label>
                        )}
                        {isRejected && (
                            <textarea
                                name="comment"
                                required
                                placeholder="Reason for rejection"
                                className="w-96 p-2 border border-gray-300 rounded-lg"
                            />
                        )}
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 w-24 border border-foreground rounded-full text-foreground"
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 w-24 bg-red-600 text-white rounded-full"
                            >
                                Yes
                            </button>
                        </div>
                    </DialogPanel>
                </form>
            </Dialog>
        </>
    );
}