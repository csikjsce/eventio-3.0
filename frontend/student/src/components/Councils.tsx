import abhi from '../assets/abhi.png';
import { Call } from 'iconsax-react';
const Councils = () => {


  return (
    <div className="w-[380px] rounded-lg bg-cardcolor overflow-hidden flex flex-row items-center justify-start py-0 px-2.5 box-border gap-2.5">
              <div className="flex flex-row items-start justify-start py-2.5 px-0">
                <img
                  className="w-[114px] relative rounded-8xs h-[114px] object-cover"
                  alt=""
                  src={abhi}
                />
              </div>
              <div className="w-[236px] flex flex-col items-start justify-start gap-[5px]">
                <div className="self-stretch flex flex-col items-start justify-start gap-px">
                  <b className="w-[226px] relative tracking-[0.2px] leading-[140%] flex items-center">
                    KJSCE Student Council
                  </b>
                  <div className="w-[142px] relative text-3xs tracking-[0.2px] leading-[140%] font-medium text-constants-powerred flex items-center">
                    We Develop To Create
                  </div>
                </div>
                <div className="flex flex-col items-start justify-start gap-[7px] text-xs text-constants-gray">
                  <div className="flex flex-row items-center justify-start gap-[5px]">
                    {/* <img
                      
                      alt=""
                      src="/solidcommunicationphone.svg"
                    /> */}
                    <Call className="w-5 relative h-5"/>
                    <div className="relative">+91-8356876018</div>
                  </div>
                  <div className="flex flex-row items-center justify-start text-constants-brownlight">
                    <div className="shadow-[0px_2px_5px_rgba(162,_87,_35,_0.15)] rounded-md bg-gold border-constants-brownlight border-[1px] border-solid box-border h-5 flex flex-row items-center justify-center p-2.5">
                      <div className="relative tracking-[0.2px] leading-[140%]">
                        Student Council
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  );
};

export default Councils;
