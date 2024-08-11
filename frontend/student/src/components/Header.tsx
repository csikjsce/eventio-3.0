import React from "react";
import { Notification } from "iconsax-react";
import { Setting2 } from "iconsax-react";
import abhi from "../assets/abhi.png";
export const Header = (): JSX.Element => {
  return (
    <div className="flex w-[380px] items-center justify-between relative">
      <div className="items-center gap-3 inline-flex relative flex-[0_0_auto]">
        <img className="relative w-[48.5px] h-[50.5px]" alt="Image" src={abhi} />
        <div className="flex-col h-[55px] items-start justify-center gap-1.5 inline-flex relative flex-[0_0_auto]">
          <div className="relative w-fit mt-[-1.50px] font-primary font- text-constants-constants-gray text-[length:var(--primary-font-size)] text-center tracking-[var(--primary-letter-spacing)] leading-[var(--primary-line-height)] [font-style:var(--primary-font-style)]">
            Namaste
          </div>
          <div className="relative w-fit font-primary font-[number:var(--primary-font-weight)] text-constants-foregroundcolor text-[length:var(--primary-font-size)] text-center tracking-[var(--primary-letter-spacing)] leading-[var(--primary-line-height)] [font-style:var(--primary-font-style)]">
            Kunal Chaturvedi
          </div>
        </div>
      </div>
      <div className="items-center gap-5 inline-flex relative flex-[0_0_auto]">
        <Notification className="!relative !w-6 !h-6" />
        <Setting2 className="!relative !w-6 !h-6" />
      </div>
    </div>
  );
};

export default Header;
