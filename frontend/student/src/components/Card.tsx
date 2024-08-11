
import {Brodcast} from 'iconsax-react';
import React, {useEffect, useRef} from 'react';

import {colors} from '../colors';

import abhi from '../assets/abhi.png';

const Card = ({
    title,
    description,
    image,
    councilImage,
    showFull,
    eid,
}: any) => {
    const scale = useRef(1);
    useEffect(() => {
        const animation = () => {
          scale.current = 0;
          setTimeout(() => {
            scale.current = 1;
          }, 1000);
        };
        animation();
        const interval = setInterval(animation, 1000);
        return () => clearInterval(interval);
      }, []);
    
    

    return (
        <button
            className={`flex items-start justify-start blur-xl shadow-2xl rounded-lg mr-3 ${
                showFull ? 'w-[90vw]' : 'w-[85vw]'
            } h-[60vh]`}
            onClick={() => {
                // @ts-ignore
                navigation.navigate('EventDetails', {
                    event_id: eid,
                });
            }}>
            <div className="h-[100%] w-[100%]">
                <div className=" w-[100%] rounded-tr-lg rounded-tl-lg overflow-hidden ">
                    <img className='h-150 w-auto overflow-hidden' src={abhi}></img>
                </div>
                <div className="px-3 py-2 w-[100%] rounded-br-lg rounded-bl-lg shadow-lg bg-card-light dark:bg-card-dark h-auto ">
                    <div className="flex space-x-2 flex-row items-start justify-start">
                        <div className="flex space-x-1 flex-row items-start justify-start flex-1">
                            <img
                                
                                className="rounded-full overflow-hidden mr-2 h-12 w-12"
                                src={abhi}></img>
                            <div className="flex justify-between h-12">
                                <p className="text-xl font-bold">
                                    {title}
                                </p>
                                <p className="font-bold text-xs text-mute-text-light dark:text-mute-text-dark">
                                    {description}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-center h-12 items-center">
                            <p className="text-xs">EVENT IS</p>
                            <div
                                className="flex flex-row justify-center items-center "
                                style={{opacity: scale.current}}>
                                <Brodcast
                                    color={colors.primary}
                                    variant="Bold"
                                />
                                <p className="ml-1 text-xs">LIVE</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </button>
    );
};


export default Card;
