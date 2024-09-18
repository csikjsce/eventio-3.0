import { ArrowRight } from 'iconsax-react';
import { Dayjs } from 'dayjs';
import { Link } from 'react-router-dom';

type Props = {
  council: string;
  date: Dayjs;
  title: string;
  image: string;
  startTime: string;
  id: number;
};

const Event = (props: Props) => {
  function getOrdinalSuffix(number: number) {
    const remainderOf100 = number % 100;
    if (remainderOf100 >= 11 && remainderOf100 <= 13) {
      return 'th';
    }

    switch (number % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  return (
    <div className="flex min-w-full my-2">
      <div className="bg-vitality w-[20%] rounded-l-[6px] flex items-center justify-center p-1">
        <h2 className="font-fira font-normal not-italic text-foreground ">
          {props.date.date() + getOrdinalSuffix(props.date.date())}
        </h2>
      </div>
      <div className="bg-card  w-[13%] flex items-center ml-1">
        <img
          src={props.image}
          alt="council image"
          className="w-full aspect-square object-cover rounded-full p-1"
        />
      </div>

      <div className="bg-card flex flex-1 flex-col justify-center items-start p-1 pl-2">
        <h2 className="font-marcellus text-left text-foreground ">
          {props?.title}
        </h2>
        <h3 className="text-mute dark:text-gray-400 font-fira">
          {props?.startTime}
        </h3>
      </div>

      <Link
        to={`/event-details/${props.id}`}
        className="bg-card  w-[10%] flex justify-center items-center rounded-r-[6px] p-1"
      >
        <ArrowRight className="h-[20px] w-[20px]" color="#FF8A65" />
      </Link>
    </div>
  );
};

export default Event;
