import axios, { AxiosError } from 'axios';
import { useState, useEffect, FormEvent } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import Spinner from '../../components/Spinner';

interface FormData {
  linkedin: string;
  github: string;
  techStack: string;
  whyHackathon: string;
}

export default function TeamRegister() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventData | null>(null);
  const [choice, setChoice] = useState<'create' | 'join' | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [formData, setFormData] = useState<FormData>({
    linkedin: '',
    github: '',
    techStack: '',
    whyHackathon: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  useEffect(() => {
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
      if (response.data.event.Participant) {
        if (response.data.event.Participant.team) {
          navigate(`/team-details/${id}/`);
        } else {
          navigate(`/event-details/${id}/`);
        }
      }
    };
    fetchEvent();
  }, [id]);

  const createTeam = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const teamName = (event.target as HTMLFormElement).team_name.value;
    try {
      await axios.request({
        baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
        url: '/api/v1' + `/event/p/create-team/`,
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
        },
        data: {
          event_id: id,
          team_name: teamName,
          more_details: formData,
        },
      });
    } catch (error) {
      console.error(error);
      if (error instanceof AxiosError) {
        if (error.response?.data.error) {
          setSnackbarMessage(error.response.data.message);
          setSnackbarVisible(true);
          setLoading(false);
          setTimeout(() => setSnackbarVisible(false), 3000);
          return;
        }
      }
    }
    navigate(`/team-details/${id}/`);
  };

  const joinTeam = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const inviteCode = (event.target as HTMLFormElement).invite_code.value;
    try {
      await axios.request({
        baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
        url: '/api/v1' + `/event/p/join-team/`,
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
        },
        data: {
          event_id: id,
          invite_code: inviteCode,
          more_details: formData,
        },
      });
    } catch (error) {
      console.error(error);
      if (error instanceof AxiosError) {
        if (error.response?.data.error) {
          setSnackbarMessage(error.response.data.message);
          setSnackbarVisible(true);
          setLoading(false);
          setTimeout(() => setSnackbarVisible(false), 3000);
          return;
        }
      }
    }
    navigate(`/team-details/${id}/`);
  };

  if (!event) {
    return <Loader />;
  }

  if (event.ma_ppt === 1) {
    return <Navigate to={`/event-details/${id}/`} />;
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
          className="w-20 h-20 rounded-lg object-cover"
        />
      </div>

      {event.more_details_enabled && (
        <form onSubmit={handleSubmit} className="space-y-4 mt-5 mb-6">
          <div>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="LinkedIn Profile URL"
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] text-white placeholder-gray-400 border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <input
              type="url"
              name="github"
              value={formData.github}
              onChange={handleChange}
              placeholder="GitHub Profile URL"
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] text-white placeholder-gray-400 border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <input
              type="text"
              name="techStack"
              value={formData.techStack}
              onChange={handleChange}
              placeholder="Tech Stack (e.g., React, Node.js, Python)"
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] text-white placeholder-gray-400 border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <textarea
              name="whyHackathon"
              value={formData.whyHackathon}
              onChange={handleChange}
              placeholder="Why do you want to participate in this hackathon?"
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] text-white placeholder-gray-400 border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none resize-none"
              required
            />
          </div>
          {/* <button type="submit">Submit</button> */}
        </form>
      )}

      <div
        className="mt-6 flex justify-center items-center h-12 bg-primary text-white rounded-full hover:cursor-pointer active:bg-primary/70"
        onClick={() => setChoice('create')}
      >
        Create Team
      </div>
      <div
        className="mt-4 flex justify-center items-center h-12 bg-card rounded-full hover:cursor-pointer active:bg-card/70"
        onClick={() => setChoice('join')}
      >
        Join Team
      </div>
      {choice === 'join' && (
        <form onSubmit={joinTeam}>
          <input
            type="text"
            name="invite_code"
            placeholder="Enter invite code"
            required
            minLength={5}
            maxLength={5}
            className="mt-6 flex w-full h-12 bg-transparent border-b border-mute focus:outline-none p-4"
          />
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-card/90 p-2 rounded-full text-sm"
              disabled={loading}
            >
              {loading ? <Spinner /> : 'Submit'}
            </button>
          </div>
        </form>
      )}
      {choice === 'create' && (
        <form onSubmit={createTeam}>
          <input
            type="text"
            name="team_name"
            placeholder="Enter team name"
            required
            className="mt-6 flex w-full h-12 bg-transparent border-b border-mute focus:outline-none p-4"
            minLength={3}
          />
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-card/90 p-2 rounded-full text-sm"
              disabled={loading}
            >
              {loading ? <Spinner /> : 'Submit'}
            </button>
          </div>
        </form>
      )}
      <div
        className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 w-64 bg-primary text-center text-white p-4 rounded-md z-40
                    transition-all duration-500 ease-in-out
                    ${snackbarVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      >
        {snackbarMessage}
      </div>
    </div>
  );
}
