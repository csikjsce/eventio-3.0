"use client";

import { useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash, Copy } from "iconsax-react";
import { UserDataContext } from "@/contexts/userContext";
import Loader from "@/components/Loader";
import Spinner from "@/components/Spinner";
import { getEventById } from "@/lib/dummy-data";
import type { EventData } from "@/types/eventio";

function ConfirmationModal({
  message,
  onConfirm,
  onCancel,
  showModal,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  showModal: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => setIsVisible(showModal), 50);
  });
  const cancel = () => {
    setIsVisible(false);
    setTimeout(() => onCancel(), 50);
  };
  const confirm = () => {
    setIsVisible(false);
    setTimeout(() => onConfirm(), 50);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-background/90 z-50 ${isVisible ? "opacity-100" : "opacity-0"} transition-all duration-300`}
    >
      <div
        className={`bg-card p-6 rounded-lg shadow-lg w-80 text-center ${isVisible ? "scale-100" : "scale-95"} transition-transform duration-300`}
      >
        <p className="mb-4">{message}</p>
        <div className="flex justify-between">
          <button
            className="bg-mute text-white px-4 py-2 rounded-lg hover:bg-mute/90 active:bg-mute/70"
            onClick={cancel}
          >
            Cancel
          </button>
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 active:bg-primary/70"
            onClick={confirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeamDetailsScreen() {
  const params = useParams();
  const id = params.id as string;
  const { userData } = useContext(UserDataContext);
  const [event, setEvent] = useState<EventData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const eventData = getEventById(Number(id));
    if (eventData) {
      setEvent(eventData);
    }
  }, [id]);

  const deleteTeam = async () => {
    setShowModal(false);
    setDeleteLoading(true);
    setTimeout(() => {
      setDeleteLoading(false);
      router.push(`/team-register/${id}`);
    }, 800);
  };

  const copy = () => {
    if (!event || event.Participant === false || !event.Participant.team) {
      return;
    }
    navigator.clipboard.writeText(event.Participant.team.invite_code);
  };

  if (!event || !userData) {
    return <Loader />;
  }

  if (event.ma_ppt === 1) {
    router.push(`/event-details/${id}`);
    return null;
  }

  if (!event.Participant || !event.Participant.team) {
    router.push(`/team-register/${id}`);
    return null;
  }

  const team = event.Participant.team;

  return (
    <div className="p-4 text-foreground font-fira mb-20">
      <div className="flex justify-between items-center">
        <div className="font-marcellus">
          <p className="text-2xl">{event.name}</p>
          <p className="text-md text-mute">{event.description}</p>
        </div>
        <img
          src={event.event_page_image_url}
          alt={event.name}
          className="w-20 h-20 rounded-lg object-cover outline outline-1 outline-mute"
        />
      </div>
      <p className="mt-6 text-xl text-center font-poppins mb-2">
        {team.name}
      </p>
      <p className="flex justify-center items-center gap-2 text-sm text-center text-mute font-poppins mb-2">
        Invite Code - {team.invite_code}
        <Copy
          className="hover:cursor-pointer active:text-mute/70"
          onClick={() => copy()}
        />
      </p>
      {team.Participant.map((u) => (
        <div
          className="mt-2 flex gap-4 items-center bg-card rounded-lg p-2"
          key={u.user.id}
        >
          <img
            src={u.user.photo_url}
            alt={u.user.name}
            className="w-10 h-10 rounded-full"
          />
          <p className="text-lg flex-1">
            {u.user.name}{" "}
            {u.user.id === team.leader_id && "(Leader)"}
          </p>
        </div>
      ))}
      {userData.id === team.leader_id && (
        <div className="fixed bottom-0 left-0 w-screen p-4">
          <button
            className="w-full flex justify-center items-center gap-2 h-12 bg-primary text-white rounded-full hover:cursor-pointer active:bg-primary/70"
            disabled={deleteLoading}
            onClick={() => setShowModal(true)}
          >
            Delete Team {deleteLoading && <Spinner />}
          </button>
        </div>
      )}
      {showModal && (
        <ConfirmationModal
          message="Are you sure you want to delete the team?"
          onConfirm={deleteTeam}
          onCancel={() => setShowModal(false)}
          showModal={showModal}
        />
      )}
    </div>
  );
}
