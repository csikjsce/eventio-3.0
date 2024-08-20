import {
  Popover,
  PopoverHandler,
  PopoverContent,
  Button,
} from "@material-tailwind/react";

type PopupState = "pending" | "accepted" | "rejected";

const eventData = {
  name: "Sample Event",
  state: "pending" as PopupState, 
};

export default function PopoverCustomAnimation() {

  const getButtonStyle = () => {
    switch (popupState) {
      case "accepted":
        return "bg-green-500 hover:bg-green-600";
      case "rejected":
        return "bg-red-500 hover:bg-red-600";
      case "pending":
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getButtonText = () => {
    switch (popupState) {
      case "accepted":
        return "Accepted";
      case "rejected":
        return "Rejected";
      case "pending":
      default:
        return "Pending";
    }
  };

  const getPopupMessage = () => {
    switch (popupState) {
      case "accepted":
        return `Your request for ${eventData.name} has been accepted`;
      case "rejected":
        return `Your request for ${eventData.name} has been rejected`;
      case "pending":
      default:
        return `Your request for ${eventData.name} is pending`;
    }
  };

  return (
    <Popover
      animate={{
        mount: { scale: 1, y: 0 },
        unmount: { scale: 0, y: 25 },
      }}
      placement="right"
    >
      <PopoverHandler>
        <Button className={getButtonStyle()}>{getButtonText()}</Button>
      </PopoverHandler>
      <PopoverContent>
        {getPopupMessage()}
      </PopoverContent>
    </Popover>
  );
}
