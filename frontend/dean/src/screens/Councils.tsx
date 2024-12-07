import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface CouncilUser {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  photo_url: string | null;
  organizer_id: string;
}

const Councils = () => {
  const [councils, setCouncils] = useState<CouncilUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCouncils = async () => {
      try {
        const response = await axios.request({
          baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
          url: '/api/v1/council/p/get',
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
          },
        });

        if (response.data.error) {
          throw new Error('Error fetching councils');
        }

        if (response && response.data && response.data.councils) {
          setCouncils(response.data.councils);
        } else {
          setCouncils([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCouncils();
  }, []);

  const handleCouncilClick = (organizerId: string) => {
    navigate(`/statistics/${organizerId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl text-foreground font-bold mb-8">Council</h1>

      {councils.length === 0 ? (
        <div className="text-center text-foreground">No council found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {councils.map((council) => (
            <div
              key={council.id}
              onClick={() => handleCouncilClick(council.organizer_id)}
              className="bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer p-6"
            >
              <div className="flex items-center space-x-4">
                {council.photo_url ? (
                  <img
                    src={council.photo_url}
                    alt={council.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200" />
                )}
                <div className="flex-1">
                  <h2 className="text-xl text-foreground font-semibold mb-2">{council.name}</h2>
                  <p className="text-sm text-foreground mb-1">{council.email}</p>
                  <p className="text-sm text-foreground">{council.phone_number}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Councils;
