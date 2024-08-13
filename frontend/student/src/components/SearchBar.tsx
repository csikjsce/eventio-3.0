import { Input } from "@material-tailwind/react"
import { Icon as IconType, Setting4 } from "iconsax-react"

export default function SearchBar({Icon, text} : {Icon: IconType, text: string}) {
  return (
    <div className="flex flex-row gap-4 px-4 py-1 rounded-xl items-center outline outline-gray-300 focus-within:outline-blue-500">
        <Icon />
        <Input
              variant="standard"
              label="Search"
              placeholder={text}
              color="blue"
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              
        />
        <Setting4 />
    </div>
  )
}
