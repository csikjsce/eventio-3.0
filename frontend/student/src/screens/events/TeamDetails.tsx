import axios from 'axios';
import { useContext, useState, useEffect } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { Trash, Copy } from 'iconsax-react';
import { UserDataContext } from '../../contexts/userContext';
import Loader from '../../components/Loader';
import Spinner from '../../components/Spinner';

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
      className={`fixed inset-0 flex items-center justify-center bg-background/90 z-50 ${isVisible ? 'opacity-100' : 'opacity-0'} transition-all duration-300`}
    >
      <div
        className={`bg-card p-6 rounded-lg shadow-lg w-80 text-center ${isVisible ? 'scale-100' : 'scale-95'} transition-transform duration-300`}
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

function RemoveMemberButton({
  teamId,
  userId,
  fetchEvent,
}: {
  teamId: number;
  userId: number;
  fetchEvent: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const removeMember = async () => {
    setShowModal(false);
    setLoading(true);
    await axios.request({
      baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
      url: '/api/v1' + `/event/p/remove-from-team/`,
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
      },
      data: {
        team_id: teamId,
        user_id: userId,
      },
    });
    setLoading(false);
    fetchEvent();
  };

  return (
    <>
      {loading ? (
        <Spinner className="ml-auto" />
      ) : (
        <Trash
          className="text-primary ml-auto hover:cursor-pointer active:text-primary/70"
          onClick={() => setShowModal(true)}
        />
      )}
      {showModal && (
        <ConfirmationModal
          message="Are you sure you want to remove this member?"
          onConfirm={removeMember}
          onCancel={() => setShowModal(false)}
          showModal={showModal}
        />
      )}
    </>
  );
}

export default function TeamDetails() {
  const { id } = useParams();
  const { userData } = useContext(UserDataContext);
  const [event, setEvent] = useState<EventData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchEvent = async () => {
    const response = await axios.request({
      baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
      url: '/api/v1' + `/event/p/get/${id}`,
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
      },
    });
    setEvent(response.data.event);
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const deleteTeam = async () => {
    if (!event || event.Participant === false || !event.Participant.team) {
      return;
    }
    setShowModal(false);
    setDeleteLoading(true);
    await axios.request({
      baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
      url: '/api/v1' + `/event/p/delete-team/`,
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
      },
      data: {
        event_id: id,
        team_id: event.Participant.team.id,
      },
    });
    setDeleteLoading(false);
    navigate(`/team-register/${id}/`);
  };

  const copy = () => {
    if (!event || event.Participant === false || !event.Participant.team) {
      return;
    }
    navigator.clipboard.writeText(event?.Participant.team.invite_code);
  };

  if (!event || !userData) {
    return <Loader />;
  }

  if (event.ma_ppt === 1) {
    return <Navigate to={`/event-details/${id}/`} />;
  }

  if (!event.Participant || !event.Participant.team) {
    return <Navigate to={`/team-register/${id}/`} />;
  }

  return (
    <div className="p-4 text-foreground font-fira">
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
        {event.Participant.team.name}
      </p>
      <p className="flex justify-center items-center gap-2 text-sm text-center text-mute font-poppins mb-2">
        Invite Code - {event.Participant.team.invite_code}
        <Copy
          className="hover:cursor-pointer active:text-mute/70"
          onClick={() => copy()}
        />
      </p>
      {event.Participant.team.Participant.map((u) => (
        <div
          className="mt-2 flex gap-4 items-center bg-card rounded-lg p-2"
          key={u.user.id}
        >
          <img src={u.user.photo_url} className="w-10 h-10 rounded-full" />
          <p className="text-lg">
            {u.user.name}{' '}
            {/* @ts-expect-error event.Participant will never be false here */}
            {u.user.id === event.Participant.team.leader_id && '(Leader)'}
          </p>
          {(userData.id === u.user.id ||
            // @ts-expect-error event.Participant will never be false here
            userData.id === event.Participant.team.leader_id) &&
            // @ts-expect-error event.Participant will never be false here
            u.user.id !== event.Participant.team.leader_id && (
              <RemoveMemberButton
                /*
                // @ts-expect-error event.Participant will never be false here */
                teamId={event.Participant.team.id}
                userId={u.user.id}
                fetchEvent={fetchEvent}
              />
            )}
        </div>
      ))}
      {userData.id === event.Participant.team.leader_id && (
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
