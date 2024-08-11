import React, {useState} from 'react';
import { colors } from '../colors';
import { Notification, Setting } from 'iconsax-react';

const Header = (props: any) => {
    
    return (
        <div className="w-full h-12 flex flex-row justify-between items-center">
            <div className="flex flex-row items-center w-56 h-11 gap-3">
                <div className="w-12 h-12" style={{borderRadius: 100}}>
                    {props.profileImg && (
                        <img
                            className="w-full h-full"
                            src={undefined}
                            style={{borderRadius: 100, width: 48, height: 48}}
                        />
                    )}
                </div>
                <div className="flex justify-between">
                    <div>
                        <p
                            className="text-gray text-xl font"
                            style={{fontFamily: 'Marcellus-Regular'}}>
                            Namaste
                        </p>
                    </div>
                    <div>
                        <p
                            className="text-xl text-black dark:text-white capitalize"
                            style={{fontFamily: 'Marcellus-Regular'}}>
                            {props.name}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-row gap-6">
                <button onClick={undefined}>
                    <Notification color={colors.gray[1]} size={24} />
                </button>

                <button onClick={undefined}>
                    <Setting color={colors.gray[1]} size={24} />
                </button>
            </div>
        </div>
    );
};

export default Header;