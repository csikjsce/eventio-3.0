import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Spinner from './Spinner';
import EventsDataContext from '../contexts/EventsDataContext';

interface GeoTagModalProps {
  eventId: number;
  onClose: () => void;
}

export default function GeoTagModal({ eventId, onClose }: GeoTagModalProps) {
  const [picturesUrl, setpicturesUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [fetchingEvent, setFetchingEvent] = useState(true);

  const { refreshEventsData } = useContext(EventsDataContext);

  useEffect(() => {
    const getEventData = async () => {
      try {
        setFetchingEvent(true);
        const response = await axios.request({
          baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
          url: '/api/v1' + `/event/p/get/${eventId}`,
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
          },
        });

        setEventData(response.data.event);
      } catch (error) {
        console.error('Error fetching event data:', error);
        setError('Could not load event data. Please try again.');
      } finally {
        setFetchingEvent(false);
      }
    };

    getEventData();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!picturesUrl.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    if (!eventData) {
      setError('Could not load event data');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const updatedEventData = {
        urls: { ...eventData.urls, geotagged_pictures: picturesUrl },
        logo_image_url: eventData.event_page_image_url,
        state: eventData.state,
      };

      // console.log('Submitting data:', updatedEventData);

      const response = await axios.post(
        `${import.meta.env.VITE_APP_SERVER_ADDRESS}/api/v1/event/p/update/${eventId}`,
        updatedEventData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        },
      );

      console.log('submitted:', response.data);
      setSuccess(true);

      refreshEventsData();

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error uploading report:', error);
      setError('Failed to upload report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-foreground">
          Upload Event Geotagged pictures
        </h2>

        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Pictures uploaded successfully!
          </div>
        ) : fetchingEvent ? (
          <div className="flex justify-center items-center p-4">
            <Spinner />
            <span className="ml-2 text-foreground">Loading event data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-foreground mb-2">
                GeoTag pictures Google drive URL{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={picturesUrl}
                onChange={(e) => setpicturesUrl(e.target.value)}
                className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
                placeholder="Enter your report URL here"
                required
              />
              {error && <p className="text-red-500 mt-1 text-sm">{error}</p>}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-mute text-foreground rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !eventData}
                className={`text-white px-4 py-2 rounded-md flex items-center justify-center ${
                  loading || !eventData ? 'bg-vitality/50' : 'bg-vitality'
                }`}
              >
                {loading ? <Spinner /> : 'Upload pictures'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
