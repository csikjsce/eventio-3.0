import React from "react";
import { SearchNormal } from "iconsax-react";
function Search() {
return (
  <div className="flex gap-3 items-center px-5 text-sm tracking-wide leading-snug bg-white rounded-2xl border-zinc-600 text-zinc-600">
    <SearchNormal/>
    <div className="flex-1 shrink self-stretch my-auto basis-0">
      Search using council name...
    </div>
    <img
      loading="lazy"
      src="https://cdn.builder.io/api/v1/image/assets/TEMP/02dac47a5987710096c50b0f080166bbf8c129e5470d5de0fef654ecefc94cbd?placeholderIfAbsent=true&apiKey=36b4dbb77aaa44d78df4a57e9c5ce86f"
      className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
    />
  </div>
);
}
export default Search;