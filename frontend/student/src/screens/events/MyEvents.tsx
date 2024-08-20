// import Header from '../../components/Header';
// import EventCard from '../../components/EventCard';
// import { ArrowLeft } from 'iconsax-react';
// import FooterNav from '../../components/FooterNav';
// import abhi from '../../assets/abhi.jpeg';
// import man1 from '../../assets/man1.jpeg';
// const event: {
//   name: string;
//   council: string;
//   image: string;
//   councilImage: string;
//   date: Date;
//   location: string;
//   tags: string[];
//   shortDesc: string;
//   status: string;
// } = {
//   name: 'Road To Programming',
//   council: 'CSI KJSCE',
//   image: abhi,
//   councilImage: man1,
//   date: new Date(1724758200000),
//   location: 'KJSCE Auditorium',
//   tags: ['Tech', 'Registered'],
//   shortDesc: 'Short Description',
//   status: 'Live',
// };

export default function MyEvents() {
  return (
    <>
      <div className="flex flex-col p-4">
        {/* <div className="flex flex-col gap-8 ">
          <Header />
          <div className="flex flex-col gap-4 z-10">
            <p className="text-lg py-7 font-small font-fira text-left text-foreground-light dark:text-foreground-dark">
              <span className="inline-block align-middle">
                <ArrowLeft />
              </span>
              <span className="inline-block align-middle">My Events</span>
            </p>
            <p className="text-lg py-2 font-small font-fira text-left text-foreground-light dark:text-foreground-dark">
              Upcoming Events
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 overflow-x-auto mb-12 overflow-y">
              <EventCard event={event} />
              <EventCard event={event} />
            </div>
            <p className="text-lg font-small font-fira text-left text-foreground-light dark:text-foreground-dark">
              Previous Events
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 overflow-x-auto mb-12 overflow-y">
              <EventCard event={event} />
            </div>
          </div>
        </div>
        <FooterNav /> */}
      </div>
    </>
  );
}
