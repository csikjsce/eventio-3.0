import { ArrowLeft } from 'iconsax-react';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserDataContext } from '../../contexts/userContext';
import axios from 'axios';

export default function Ticket() {
  const navigate = useNavigate();
  const { id } = useParams();
  const userContext = useContext(UserDataContext);
  const userData = userContext?.userData;
  const [eventData, setEventData] = useState<EventData>();

  const handleClose = () => {
    navigate('/event-details/' + id);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.request({
          baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
          url: '/api/v1' + `/event/p/get/${id}`,
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
          },
        });
        if (response.data && response.data.event) {
          setEventData(response.data.event);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-center bg-cover text-foreground p-4">
      <div className="max-w-md w-full mx-auto z-10 bg-background relative">
        <div className="flex flex-col">
          <div className="bg-card relative p-4 rounded-xl">
            <div className="flex-none sm:flex">
              <div className="flex-auto justify-evenly">
                <div className="flex items-center justify-between">
                  <div className="flex items-center my-1">
                    <img
                      src={eventData?.event_page_image_url}
                      alt="User"
                      className="aspect-square w-screen object-cover rounded-lg"
                    />
                    <div className="absolute top-7 left-6 z-20  ">
                      <button
                        onClick={handleClose}
                        className="text-xl font-bold rounded-full p-2 text-foreground bg-card"
                      >
                        <ArrowLeft size={24} color="currentColor" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col py-2">
                  <span className="text-2xl font-bold">{eventData?.name}</span>
                  <div className="text-mute">{eventData?.description}</div>
                  <div className="font-semibold">
                    By {eventData?.organizer.name}
                  </div>
                </div>
                <div className="border-dashed border-mute border-b-2 my-5 pt-5">
                  <div className="absolute rounded-full w-6 h-6 bg-background -mt-2.5 -left-2"></div>
                  <div className="absolute rounded-full w-6 h-6 bg-background -mt-2.5 -right-2"></div>
                </div>

                <div className="grid grid-cols-2">
                  <div>
                    <div className="text-sm text-mute">Name</div>
                    <div className="font-semibold">
                      {userData?.name || 'Unknown'}
                    </div>
                    <div className="text-sm mt-2 text-mute">College</div>
                    <div className="font-semibold">
                      {userData?.college || 'Unknown College'}
                    </div>
                  </div>
                  {eventData &&
                    eventData.Participant &&
                    eventData.Participant.team && (
                      <div>
                        <div className="text-sm text-mute">Team</div>
                        <div className="font-semibold">
                          {eventData?.Participant.team?.name || 'Unknown'}
                        </div>
                      </div>
                    )}
                </div>

                <div className="border-dashed border-mute border-b-2 my-5 pt-5">
                  <div className="absolute rounded-full w-6 h-6 bg-background -mt-2.5 -left-2"></div>
                  <div className="absolute rounded-full w-6 h-6 bg-background -mt-2.5 -right-2"></div>
                </div>

                <img
                  src="https://www.shutterstock.com/image-vector/long-bar-code-600nw-1043015362.jpg"
                  alt="Barcode"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
