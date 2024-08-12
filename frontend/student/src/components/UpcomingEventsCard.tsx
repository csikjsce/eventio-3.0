import React from "react";
import { Calendar } from "iconsax-react";
import { Location } from "iconsax-react";
import abhi from "../assets/abhi.png";
export const UpcomingEventsCard = (): JSX.Element => {
  return (
    <div className="flex w-[380px] items-center gap-2.5 px-2.5 py-0 relative bg-constants-cardcolor rounded-lg overflow-hidden">
      <div className="inline-flex items-start gap-2.5 px-0 py-2.5 relative flex-[0_0_auto]">
        <img className="w-[114px] h-[114px] relative object-cover" alt="Image" src={abhi} />
      </div>
      <div className="flex flex-col items-start gap-2.5 relative flex-1 grow">
        <div className="inline-flex items-center gap-[9px] relative flex-[0_0_auto]">
          <img className="w-7 h-7 relative object-cover" alt="Image" src={abhi} />
          <div className="inline-flex flex-col items-start gap-2.5 relative flex-[0_0_auto]">
            <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
              <div className="relative w-fit mt-[-1.00px] font-marcellus font-bold text-constants-foregroundcolor text-lg tracking-[0.20px] leading-[25.2px] whitespace-nowrap">
                Naari ‘23 Celebration
              </div>
              
            </div>
          </div>
        </div>
        <div className="inline-flex items-start gap-2.5 relative flex-[0_0_auto]">
          <div className="inline-flex items-center gap-[5px] relative flex-[0_0_auto]">
            <Calendar className="!relative !w-5 !h-5" />
            <div className="relative w-fit [font-family:'Fira_Sans-Regular',Helvetica] font-normal text-constants-graytext text-xs tracking-[0] leading-[normal] whitespace-nowrap">
              Oct 24th, 11:00 AM
            </div>
          </div>
          <div className="inline-flex items-center gap-[5px] relative flex-[0_0_auto]">
            <Location className="!relative !w-5 !h-5" color="#57585A" />
            <div className="relative w-fit [font-family:'Fira_Sans-Regular',Helvetica] font-normal text-constants-graytext text-xs tracking-[0] leading-[normal] whitespace-nowrap">
              Auditorium
            </div>
          </div>
        </div>
        <div className="inline-flex h-5 items-center justify-center gap-2.5 p-2.5 relative bg-[#f582201a] rounded-md border border-solid border-constants-constants-orange shadow-[0px_2px_5px_#e91b1b26]">
          <div className="relative w-fit mt-[-9.50px] mb-[-7.50px] [font-family:'Fira_Sans-Regular',Helvetica] font-normal text-constants-constants-orange text-xs tracking-[0.20px] leading-[16.8px] whitespace-nowrap">
            Cultural &amp; Fun
          </div>
        </div>
      </div>
    </div>
  );
};
export default UpcomingEventsCard;