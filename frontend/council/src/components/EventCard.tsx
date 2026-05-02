import { Calendar, Location } from 'iconsax-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ReportModal from './ReportModal';
import GeoTagModal from './GeoTagModal';

const STATE_STYLES: Record<string, string> = {
  DRAFT:               'bg-zinc-800 text-zinc-400 border-zinc-700',
  APPLIED_FOR_APPROVAL:'bg-amber-500/10 text-amber-400 border-amber-600/30',
  UPCOMING:            'bg-blue-500/10 text-blue-400 border-blue-600/30',
  REGISTRATION_OPEN:   'bg-green-500/10 text-green-400 border-green-600/30',
  REGISTRATION_CLOSED: 'bg-orange-500/10 text-orange-400 border-orange-600/30',
  TICKET_OPEN:         'bg-purple-500/10 text-purple-400 border-purple-600/30',
  TICKET_CLOSED:       'bg-rose-500/10 text-rose-400 border-rose-600/30',
  ONGOING:             'bg-yellow-500/10 text-yellow-400 border-yellow-600/30',
  COMPLETED:           'bg-zinc-700/30 text-zinc-500 border-zinc-700',
  PRIVATE:             'bg-red-500/10 text-red-400 border-red-600/30',
};

const STATE_LABEL: Record<string, string> = {
  DRAFT: 'Draft',
  APPLIED_FOR_APPROVAL: 'Pending Approval',
  UPCOMING: 'Upcoming',
  REGISTRATION_OPEN: 'Registration Open',
  REGISTRATION_CLOSED: 'Registration Closed',
  TICKET_OPEN: 'Ticket Open',
  TICKET_CLOSED: 'Ticket Closed',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  PRIVATE: 'Private',
};

export default function EventCard({ event }: { event: EventData }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showgeotagModal, setShowgeotagModal] = useState(false);

  const handleReportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowReportModal(true);
  };
  const handleGeoTagClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowgeotagModal(true);
  };

  const stateClass = STATE_STYLES[event.state] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700';

  return (
    <>
      <Link
        className="group flex items-center gap-4 bg-[#111] border border-white/5 hover:border-red-600/25 rounded-xl p-4 transition-all duration-150"
        to={'/event-details/' + event.id}
      >
        {/* Thumbnail */}
        <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-zinc-900 border border-white/5">
          {event.logo_image__url ? (
            <img
              src={event.logo_image__url}
              alt={event.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-red-600/60">
              {event.name?.[0]}
            </div>
          )}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-fira font-semibold text-sm text-white truncate">{event.name}</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500 font-fira">
            <span className="flex items-center gap-1">
              <Calendar size="12" color="currentColor" />
              {event.dates[0] ? new Date(event.dates[0]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              {event.dates.length > 1 && ` +${event.dates.length - 1}d`}
            </span>
            {event.venue && (
              <span className="flex items-center gap-1 truncate max-w-56">
                <Location size="12" color="currentColor" />
                {event.venue}
              </span>
            )}
          </div>
          {/* Tags */}
          {event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {event.tags.map((tag, i) => (
                <span key={i} className="text-[10px] font-fira px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/5">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right side: state + actions */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          <span className={`text-[10px] font-fira font-semibold px-2 py-0.5 rounded-full border ${stateClass}`}>
            {STATE_LABEL[event.state] ?? event.state}
          </span>
          {event.state === 'COMPLETED' && (
            <div className="flex flex-col items-end gap-1" onClick={(e) => e.preventDefault()}>
              {event.report_url ? (
                <span className="text-[10px] text-green-500 font-fira">✓ Report uploaded</span>
              ) : (
                <button
                  onClick={handleReportClick}
                  className="text-[10px] px-2 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/25 rounded font-fira transition-colors"
                >
                  Upload Report
                </button>
              )}
              {event?.urls?.geotagged_pictures ? (
                <span className="text-[10px] text-green-500 font-fira">✓ Geo-tagged</span>
              ) : (
                <button
                  onClick={handleGeoTagClick}
                  className="text-[10px] px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-white/5 rounded font-fira transition-colors"
                >
                  Geo-tag Photos
                </button>
              )}
            </div>
          )}
        </div>
      </Link>

      {showReportModal && (
        <ReportModal eventId={event.id} onClose={() => setShowReportModal(false)} />
      )}
      {showgeotagModal && (
        <GeoTagModal eventId={event.id} onClose={() => setShowgeotagModal(false)} />
      )}
    </>
  );
}
