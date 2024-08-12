import PropTypes from "prop-types";
import React from "react";
import { Brodcast } from "iconsax-react";
import abhi from "../assets/abhi.png";
// interface Props {
//   property1: "upcoming" | "default";
//   className: any;
//   image: string;
//   imageClassName: any;
//   img: string;
//   icon: JSX.Element;
// }

export const Card = (): JSX.Element => {
const property1 = "";
  return (
    <div
      className={`w-[380px] flex flex-col items-start gap-2 shadow-[0px_2px_10px_2px_#0000001a] overflow-hidden rounded-lg bg-constants-cardcolor relative `}
      data-constants-mode="light-mode"
    >
      <img
        className="w-[380px] object-cover h-[164px] relative"
        alt="Image"
        src={abhi}
      />
      <div className="w-full flex self-stretch flex-col items-start gap-[9px] flex-[0_0_auto] pt-0 pb-2.5 px-3 relative">
        <div className="w-full flex self-stretch items-center flex-[0_0_auto] justify-between relative">
          <div className="inline-flex items-center gap-2 flex-[0_0_auto] relative">
            <img
              className={`w-[42px] ml-[-1.00px] object-cover h-[42px] relative`}
              alt="Image"
              src={abhi}
            />
            <div className="inline-flex flex-col items-start flex-[0_0_auto] justify-center relative">
              <div className="[font-family:'Fira_Sans-Bold',Helvetica] w-fit mt-[-1.00px] tracking-[0.20px] text-xl text-constants-foregroundcolor font-bold leading-[28.0px] whitespace-nowrap relative">
                Abhiyantriki ‘23
              </div>
              <p className="[font-family:'Fira_Sans-Medium',Helvetica] w-fit tracking-[0.14px] text-[10px] text-constants-graytext font-medium text-center whitespace-nowrap leading-[14.0px] relative">
                Annual Technical Fest of KJSCE
              </p>
            </div>
          </div>
          <div className="inline-flex flex-col items-center flex-[0_0_auto] justify-center relative">
           
             
                <div className="relative w-fit mt-[-1.00px] [font-family:'Arial-Regular',Helvetica] font-normal text-constants-graytext text-[10px] text-center tracking-[0.14px] leading-[14.0px] whitespace-nowrap">
                  Event is
                </div>
                <div className="flex items-center gap-[5px] relative self-stretch w-full flex-[0_0_auto] -mt-px">
                  <Brodcast style={{ color: "#FF0000" }}/>
                  <div className="relative w-fit [font-family:'Arial-Regular',Helvetica] font-normal text-constants-graytext text-[10px] text-center tracking-[0.14px] leading-[14.0px] whitespace-nowrap">
                    Live
                  </div>
                </div>
             
           

            
              {/* <div className="relative w-fit mt-[-1.00px] [font-family:'Arial-BoldItalic',Helvetica] font-bold italic text-constants-graytext text-[10px] text-center tracking-[0.14px] leading-[14.0px]">
                Coming <br />
                Soon
              </div> */}
           
          </div>
        </div>
      </div>
    </div>
  );
};

// UpcomingEventsCard.propTypes = {
//   property1: PropTypes.oneOf(["upcoming", "default"]),
//   image: PropTypes.string,
//   img: PropTypes.string,
// };

export default Card;
