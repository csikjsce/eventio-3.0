
import React from "react";
import icons from "../assets/namaste/icons.svg";

function GreetingSection({userName}) {
  return (
    <div className="w-auto bg-card bg-[#f3f3f3] rounded-3xl">
      <header className="bg-card flex h-32 w-auto flex-row justify-between rounded-2xl px-6 py-2">
        <div className="my-auto">
          <GreetingMessage name={userName} />
        </div>
        <div className="my-auto w-56">
          <GreetingImage />
          <GreetingImage />
        </div>
      </header>
    </div>
  );
}

function GreetingMessage({name}) {
  return (
    <div>
      <div className="font-poppins text-3xl font-medium text-black">
        Namaste! {name}
      </div>
      <p className="font-poppins text-gray mt-2 text-base leading-6">
        How are you feeling today?
      </p>
    </div>
  );
}

function GreetingImage() {
  return (
    <img
      loading="lazy"
      src={icons}
      alt="People greeting each other"
      className="m-1 max-h-14"
    />
  );
}

export default GreetingSection;
