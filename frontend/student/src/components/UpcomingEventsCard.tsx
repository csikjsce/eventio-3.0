import {Calendar, Location} from 'iconsax-react';
import React from 'react';
import {colors} from '../colors';

// import {Image} from 'react-native-paper/lib/typescript/components/Avatar/Avatar';

interface UpcomingEventsCardProps {
    eventPic: any;
    councilImg: any;
    eventName: string;
    councilName: string;
    eventDateAndTime: string;
    eventVenue: string;
    tags: string[];
    eid: string;
    isParent: boolean;
}

const UpcomingEventsCard: React.FC<UpcomingEventsCardProps> = props => {
    
    return (
        <button
            className="flex flex-row justify-center items-center h-36 w-full bg-card-light dark:bg-card-dark mb-2 py-5"
            style={{borderRadius: 10}}
            onClick={() => {
                console.log("is parent:",props);
                if (props.isParent) {
                    //@ts-ignore
                    navigation.navigate('ChildEvent', {
                        event_id: props.eid,
                        name: props.eventName,
                    });
                } else {
                    console.log("pressed");
                    //@ts-ignore
                    navigation.navigate('EventDetails', {
                        event_id: props.eid,
                    });
                }
                
               
                
            }}
            >
            <div className="flex-[0.32] h-full flex justify-center items-center">
                <img
                    src={props.eventPic}
                    className="w-24 h-full"
                    style={{
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: '#57585A',
                    }}></img>
            </div>
            <div className="flex items-start justify-between flex-[0.68] h-full">
                <div className="flex flex-row gap-x-1.5 items-center justify-start w-[80%]">
                    <img
                        src={props.councilImg}
                        className="h-7 w-7 rounded-full"
                    />

                    <div className="flex justify-center items-start ">
                        <p style={styles.boldText}>{props.eventName}</p>
                        <p
                            style={styles.lightText}
                            className="text-primary text-xs mt-[-5]">
                            By {props.councilName}
                        </p>
                    </div>
                </div>
                <div className="flex flex-row  items-start justify-center gap-x-2.5">
                    <div className="flex flex-row items-center">
                        <Calendar
                            color={colors.gray[1]}
                            size={20}
                            className="mr-1"
                        />
                        <p
                            style={styles.lightText}
                            className="text-xs text-gray">
                            {props.eventDateAndTime}
                        </p>
                    </div>
                    <div className="flex flex-row items-center">
                        <Location
                            color={colors.gray[1]}
                            size={20}
                            className="mr-1"
                        />
                        <p
                            style={styles.lightText}
                            className="text-xs  text-gray">
                            {props.eventVenue}
                        </p>
                    </div>
                </div>
                <div className="flex flex-row gap-x-2">
                    {props.tags.map((tag: string, index: number) => (
                        <div
                            key={index}
                            className="bg-darkorange rounded-md border border-orange px-2.5">
                            <p
                                className="text-xs text-orange"
                                style={styles.lightText}>
                                {tag}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </button>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      margin: 20,
    },
    boldText: {
      fontFamily: 'FiraSans-Bold',
      fontSize: 18,
      fontWeight: 'bold',
    },
    semiboldText: {
      fontFamily: 'FiraSans-Medium',
      fontSize: 20,
      marginTop: 20,
    },
    lightText: {
      fontFamily: 'FiraSans-SemiBold',
    },
    image: {
      height: 100,
      width: 'auto',
      overflow: 'hidden',
    },
  };

export default UpcomingEventsCard;