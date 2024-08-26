import { ArrowLeft } from 'iconsax-react';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserDataContext } from '../../contexts/userContext';
import { axiosCall } from '../../utils/api';

export default function Ticket() {
  const navigate = useNavigate();
  const userContext = useContext(UserDataContext);
  const userData = userContext?.userData;
  const [eventData, setEventData] = useState<EventData>();

  const handleClose = () => {
    navigate('/');
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosCall('POST', '/event/p/get', true);
        console.log(response);
        if (response.events) {
          console.log(response.events.TICKET_OPEN);
          setEventData(response.events.TICKET_OPEN[0]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-center bg-cover h-screen relative">
      <div className="absolute top-6 left-5 z-20  ">
        <button
          onClick={handleClose}
          className="text-gray-700 text-xl font-bold rounded-full p-2"
        >
          <ArrowLeft size={24} color="white" />
        </button>
      </div>
      <div className="max-w-md w-full mx-auto z-10 bg-white h-screen relative">
        <div className="flex flex-col">
          <div className="bg-gray-200 relative drop-shadow-2xl p-4">
            <div className="flex-none sm:flex">
              <div className="flex-auto justify-evenly">
                <div className="flex items-center justify-between">
                  <div className="flex items-center my-1">
                    <img
                      src={eventData?.banner_url}
                      alt="User"
                      className="h-96 w-full object-cover rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex flex-col py-2">
                  <span className="text-2xl font-bold">{eventData?.name}</span>
                  <div className="">{eventData?.description}</div>
                  <div className="font-semibold">By CSI KJSCE</div>
                </div>
                <div className="border-dashed border-gray-500 border-b-2 my-5 pt-5">
                  <div className="absolute rounded-full w-6 h-6 bg-white -mt-2 -left-2"></div>
                  <div className="absolute rounded-full w-6 h-6 bg-white -mt-2 -right-2"></div>
                </div>
                <div className="flex items-center mb-5 p-2 text-sm">
                  <div className="flex flex-col">
                    <span className="text-sm">Name</span>
                    <div className="font-semibold">
                      {userData?.name || 'Unknown'}
                    </div>
                    <span className="text-sm mt-2">College</span>
                    <div className="font-semibold">
                      {userData?.college || 'Unknown College'}
                    </div>
                  </div>
                </div>

                <div className="border-dashed border-gray-500 border-b-2 my-5 pt-5">
                  <div className="absolute rounded-full w-6 h-6 bg-white -mt-2 -left-2"></div>
                  <div className="absolute rounded-full w-6 h-6 bg-white -mt-2 -right-2"></div>
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
