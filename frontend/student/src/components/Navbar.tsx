import {
    Calendar,
    Home,
    Home2,
    People,
    ProfileCircle,
} from 'iconsax-react';
import React from 'react';

import {colors} from '../colors';


const Navbar = () => {
    const press = () => {
        console.log('pressed');
    };
    
    
    // let navigation = useNavigation();
    // let route = useRoute();
    return (
        <div className="flex flex-row items-center justify-center">
            <button
                
                style={{borderRadius: 15}}
                className="flex-[0.25] h-full flex justify-center items-center py-5"
                onClick={() => undefined}>
                <div className="flex flex-row items-center justify-center mb-1">
                    <Home2
                        color={
                            location.pathname === 'home' || location.pathname === 'ChildEvent'
                                ? colors.primary
                                : colors.gray[1]
                        }
                        variant={
                            location.pathname === 'home' || location.pathname === 'ChildEvent'
                                ? 'Bold'
                                : 'Linear'
                        }
                        size={24}
                    />
                </div>
                <div className="flex flex-row items-center justify-center">
                    <p
                        className={` text-xs ${
                            location.pathname === 'home' || location.pathname === 'ChildEvent'
                                ? 'text-primary'
                                : 'text-gray-1'
                        }`}>
                        Home
                    </p>
                </div>
            </button>
            <button
                // android_ripple={{
                //     color: '#B61F2D20',
                //     borderless: true,
                //     radius: 50,
                // }}
                onClick={() => undefined}
                className="flex-[0.25] h-full flex justify-center items-center py-5">
                <div className="flex flex-row items-center justify-center mb-1">
                    <Calendar
                        color={
                            location.pathname === 'calendarScreen'
                                ? colors.primary
                                : colors.gray[1]
                        }
                        variant={
                            location.pathname === 'calendarScreen' ? 'Bold' : 'Linear'
                        }
                        size={24}
                    />
                </div>
                <div className="flex flex-row items-center justify-center">
                    <p
                        className={` text-xs ${
                            location.pathname === 'calendarScreen'
                                ? 'text-primary'
                                : 'text-gray-1'
                        }`}>
                        Calendar
                    </p>
                </div>
            </button>
            <button
                
                className="flex-[0.25] h-full flex justify-center items-center py-5"
                onClick={() => undefined}>
                <div className="flex flex-row items-center justify-center mb-1">
                    <People
                        color={
                            location.pathname === 'council'
                                ? colors.primary
                                : colors.gray[1]
                        }
                        variant={location.pathname === 'council' ? 'Bold' : 'Linear'}
                        size={24}
                    />
                </div>
                <div className="flex flex-row items-center justify-center">
                    <p
                        className={` text-xs ${
                            location.pathname === 'council'
                                ? 'text-primary'
                                : 'text-gray-1'
                        }`}>
                        Councils
                    </p>
                </div>
            </button>
            <button
                // android_ripple={{
                //     color: '#B61F2D20',
                //     borderless: true,
                //     radius: 50,
                // }}
                className="flex-[0.25] h-full flex justify-center items-center py-5"
                onClick={undefined  }>
                <div className="flex flex-row items-center justify-center mb-1">
                    <ProfileCircle
                        color={
                            location.pathname === 'profile'
                                ? colors.primary
                                : colors.gray[1]
                        }
                        variant={location.pathname === 'profile' ? 'Bold' : 'Linear'}
                        size={24}
                    />
                </div>
                <div className="flex flex-row items-center justify-center">
                    <p
                        className={` text-xs ${
                            location.pathname === 'profile'
                                ? 'text-primary'
                                : 'text-gray-1'
                        }`}>
                        Profile
                    </p>
                </div>
            </button>
        </div>
    );
};

export default Navbar;