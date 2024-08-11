import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import Search, { searchType } from '../../components/Search';
import Card from '../../components/Card';
import Layout from '../../components/Layout';
import UpcomingEventsCard from '../../components/UpcomingEventsCard';
import { colors } from '../../colors';

const Home = () => {
  const [userData, setUserData] = React.useState<any>(null);
  const [events, setEvents] = React.useState<any>();
  const [refreshing, setRefreshing] = React.useState(false);

  //dummy search results function
  const GetSearchResults = ({search}: {search: string}): string => {
    return search;
  }
  const [showEventsFromChip, setShowEventsFromChip] = React.useState([
    { name: 'All', selected: true },
    { name: 'Upcoming', selected: false },
    { name: 'Registration Open', selected: false },
    { name: 'Registration Closed', selected: false },
  ]);
//   let user = useSelector((state: UserState) => state);
//   let dispatch = useDispatch();
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // GetEvents().then((res) => {
    //   setEvents(res.events);
    // });
    setRefreshing(false);
  }, []);
  useEffect(() => {
    // GetUser(user, dispatch).then((res) => {
    //   setUserData(res);
    // });
    // GetEvents().then((res) => {
    //   setEvents(res.events);
    // });
  }, []);
  let month = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const nthNumber = (number: any) => {
    if (number > 3 && number < 21) return 'th';
    switch (number % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };
  let [search, setSearch] = React.useState('');
  let [searchResults, setSearchResults] = React.useState<null | Array<Object>>(null);
  useEffect(() => {
    if (search !== '') {
      
    } else {
      setSearchResults(null);
    }
  }, [search]);

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      margin: 20,
    },
    boldText: {
      fontFamily: 'FiraSans-Bold',
      fontSize: 20,
      fontWeight: 'bold',
    },
    semiboldText: {
      fontFamily: 'FiraSans-Medium',
      fontSize: 20,
      marginTop: 20,
    },
    lightText: {
      fontFamily: 'Firasans-Light',
    },
    image: {
      height: 100,
      width: 'auto',
      overflow: 'hidden',
    },
  };

  return (
    <Layout>
      <div className="w-[100vw] h-[100vh] space-y-5 flex flex-col items-center justify-top">
        <div className="px-5 pt-5">
          {userData == null ? (
            <p>Loading...</p>
          ) : (
            <Header />
          )}
        </div>
        <div className="px-5">
          <Search
            search={search}
            setSearch={setSearch}
            type={searchType.EVENT}
          />
        </div>
        <div className="px-5 flex-1">
          <div className="h-14 mb-4">
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 10,
              }}
            >
              {showEventsFromChip.map((chip, index) => {
                return (
                  <div
                    key={index}
                  style={{
                    backgroundColor: chip.selected ? colors.primary : colors.gray[20],
                    padding: 3,
                  }}
                >
                  {chip.name}
                </div>
              )})}
            </div>
          </div>
          {searchResults === null ? (
            <>
              {showEventsFromChip[0].selected && events && events.ongoing && (
                <>
                  <div className="w-[100%] flex items-start justify-start mb-3">
                    <p style={styles.boldText}>Ongoing Events</p>
                  </div>
                  <div className="h-[215px] flex items-start justify-start space-x-3 mb-4">
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        overflow: 'visible',
                        height: '100%',
                      }}
                    >
                      <div className="flex flex-row items-start justify-start h-full">
                        {events.ongoing &&
                          events.ongoing.map((event: any, index: any) => {
                            return (
                              <Card
                                key={index}
                                eid={event._id}
                                title={event.name}
                                councilImage={event.organizer.photo_url}
                                image={event.banner_url}
                                description={event.tagline}
                                showFull={events.ongoing.length === 1}
                              />
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </>
              )}
              {events && (events.upcoming || events.registration_closed || events.registration_open) ? (
                <>
                  <div className="w-[100%] flex items-start justify-start mb-3">
                    <p style={styles.boldText}>Upcoming Events</p>
                  </div>
                  <div className="flex items-start justify-start space-x-3 pb-24">
                    {(showEventsFromChip[2].selected || showEventsFromChip[0].selected) &&
                    events.registration_open
                      ? events.registration_open.map((event: any, index: any) => {
                          return (
                            <UpcomingEventsCard
                              key={index}
                              eid={event._id}
                              eventPic={event.logo_image_url}
                              councilImg={event.organizer.photo_url}
                              eventName={event.name}
                              councilName={event.organizer.name}
                              eventDateAndTime={
                                new Date(event.dates[0][0]).getDate() +
                                nthNumber(new Date(event.dates[0][0]).getDate()) +
                                ' ' +
                                month[new Date(event.dates[0][0]).getMonth()] +
                                ', ' +
                                new Date(event.dates[0][0]).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              }
                              eventVenue={event.venue}
                              tags={[event.state, event.eventType]}
                              isParent={event.is_parent}
                            />
                          );
                        })
                      : showEventsFromChip[2].selected && (
                          <p className="w-full text-center mt-2">
                            No events found
                          </p>
                        )}
                    {(showEventsFromChip[1].selected || showEventsFromChip[0].selected) &&
                    events.upcoming
                      ? events.upcoming.map((event: any, index: any) => {
                          return (
                            <UpcomingEventsCard
                              key={index}
                              eid={event._id}
                              eventPic={event.logo_image_url}
                              councilImg={event.organizer.photo_url}
                              eventName={event.name}
                              councilName={event.organizer.name}
                              eventDateAndTime={
                                new Date(event.dates[0][0]).getDate() +
                                nthNumber(new Date(event.dates[0][0]).getDate()) +
                                ' ' +
                                month[new Date(event.dates[0][0]).getMonth()] +
                                ', ' +
                                new Date(event.dates[0][0]).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              }
                              eventVenue={event.venue}
                              isParent={event.is_parent}
                              tags={[event.state, event.eventType]}
                            />
                          );
                        })
                      : showEventsFromChip[1].selected && (
                          <p className="w-full text-center mt-2">
                            No upcoming events found
                          </p>
                        )}
                    {(showEventsFromChip[3].selected || showEventsFromChip[0].selected) &&
                    events.registration_closed
                      ? events.registration_closed.map((event: any, index: any) => {
                          return (
                            <UpcomingEventsCard
                              key={index}
                              eid={event._id}
                              eventPic={event.logo_image_url}
                              councilImg={event.organizer.photo_url}
                              eventName={event.name}
                              councilName={event.organizer.name}
                              eventDateAndTime={
                                new Date(event.dates[0][0]).getDate() +
                                nthNumber(new Date(event.dates[0][0]).getDate()) +
                                ' ' +
                                month[new Date(event.dates[0][0]).getMonth()] +
                                ', ' +
                                new Date(event.dates[0][0]).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              }
                              eventVenue={event.venue}
                              isParent={event.is_parent}
                              tags={[event.state, event.eventType]}
                            />
                          );
                        })
                      : showEventsFromChip[3].selected && (
                          <p className="w-full text-center mt-2">
                            No registration closed events found
                          </p>
                        )}
                  </div>
                </>
              ) : (
                <p className="w-full text-center mt-2">No events found</p>
              )}
            </>
          ) : (
            searchResults &&
            searchResults.map((event: any, index: any) => {
              return (
                <UpcomingEventsCard
                  key={index}
                  eid={event._id}
                  eventPic={event.logo_image_url}
                  councilImg={event.organizer.photo_url}
                  eventName={event.name}
                  councilName={event.organizer.name}
                  eventDateAndTime={
                    new Date(event.dates[0][0]).getDate() +
                    nthNumber(new Date(event.dates[0][0]).getDate()) +
                    ' ' +
                    month[new Date(event.dates[0][0]).getMonth()] +
                    ', ' +
                    new Date(event.dates[0][0]).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  }
                  eventVenue={event.venue}
                  isParent={event.is_parent}
                  tags={[event.state, event.eventType]}
                />
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;