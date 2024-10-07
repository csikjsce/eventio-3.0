// import { SearchNormal1 } from 'iconsax-react';
import CouncilCard from '../../components/CouncilCard';
// import SearchBar from '../../components/SearchBar';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Councils() {
  const [councils, setCouncils] = useState<User[]>([]);

  useEffect(() => {
    const fetchCouncils = async () => {
      try {
        const response = await axios.request({
          baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
          url: '/api/v1' + '/council/p/get',
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
          },
        });
        console.log(response);
        if (response.data.error) {
          throw new Error('error fetching');
        }
        if (response && response.data && response.data.councils) {
          setCouncils(response.data.councils);
        } else {
          setCouncils([]);
        }
      } catch (err) {
        console.error(err);
        throw err;
      }
    };
    fetchCouncils();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {/* <SearchBar Icon={SearchNormal1} className="mt-6" /> */}

      <div className="flex flex-col gap-4 z-10">
        <p className="text-lg font-medium font-fira text-left text-foreground ">
          Councils
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 overflow-x-auto mb-12">
          {councils.map((council) => (
            <CouncilCard key={council.id} council={council} />
          ))}
        </div>
      </div>
    </div>
  );
}
