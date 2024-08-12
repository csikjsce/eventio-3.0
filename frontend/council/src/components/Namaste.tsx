import icons from "../assets/namaste/icons.svg";

type GreetingSectionProps = {
  userName: string;
};

function GreetingSection({ userName }: GreetingSectionProps) {
  return (
    <div className="w-auto bg-card bg-[#f3f3f3] rounded-3xl p-2 flex gap-2">
      <div>
        <div>
          <div className="font-poppins text-3xl font-medium text-black">
            Namaste! {userName}
          </div>
          <p className="font-poppins text-gray mt-2 text-base leading-6">
            How are you feeling today?
          </p>
        </div>
      </div>
      <div className="flex-1">
        <img loading="lazy" src={icons} alt="People greeting each other" />
        <img loading="lazy" src={icons} alt="People greeting each other" />
      </div>
    </div>
  );
}
export default GreetingSection;
