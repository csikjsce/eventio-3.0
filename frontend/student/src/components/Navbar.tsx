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
    <div className="w-[428px] h-[107px] px-2.5 pt-[15px] pb-2.5 bg-white shadow backdrop-blur-[50px] flex-col justify-start items-center gap-[35px] inline-flex">
        <div className="w-[345px] justify-between items-start inline-flex">
        <div className="shadow flex-col justify-start items-center gap-[3px] inline-flex">
        <div className="w-[26px] h-[26px] justify-center items-center inline-flex">
            <div className="w-[26px] h-[26px] relative">
            </div>
        </div>
        <Home/>
        <div className="text-center text-[#b61f2d] text-[10px] font-normal font-['Marcellus']">Home</div>
        </div>
        <div className="flex-col justify-start items-center gap-[3px] inline-flex">
        <div className="w-[26px] h-[26px] justify-center items-center inline-flex">
            <div className="w-[26px] h-[26px] relative">
            </div>
        </div>
        <Calendar/>
        <div className="text-center text-[#57585a] text-[10px] font-normal font-['Marcellus']">Calendar</div>
        </div>
        <div className="flex-col justify-start items-center gap-[3px] inline-flex">
        <div className="w-[26px] h-[26px] relative">
            <div className="w-[7.19px] h-[13.57px] left-[16.61px] top-[2.17px] absolute">
            </div>
            <div className="w-[7.19px] h-[13.57px] left-[2.17px] top-[2.17px] absolute">
            </div>
            <div className="w-[8.60px] h-[13.58px] left-[8.70px] top-[10.26px] absolute">
            </div>
        </div>
        <People/>
        <div className="text-center text-[#57585a] text-[10px] font-normal font-['Marcellus']">Councils</div>
        </div>
        <div className="flex-col justify-start items-center gap-[3px] inline-flex">
        <div className="w-[26px] h-[26px] relative" />
        <ProfileCircle/>
        <div className="text-center text-[#57585a] text-[10px] font-normal font-['Marcellus']">My Profile</div>
        </div>
    </div>
    
    </div>
    );
};

export default Navbar;