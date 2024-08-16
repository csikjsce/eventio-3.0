import React from "react";
import { Link } from "react-router-dom";

export default function Search() {
  return (
    <div className="flex flex-row h-16  items-center justify-between pb-5">
      <div className="bg-card my-auto flex items-start justify-center gap-2 rounded-2xl px-5 py-2.5 border-4 border-red">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/10d3650769b131e1cf8a1b8110608e470e0a8460b4dbf5abac91eaaf5b7a3f8c?apiKey=7986bfb78dfc489cb3aeef0f2179bbd2&"
          alt="Decorative"
          className="aspect-[0.95] w-5"
        />
        <input
          type="text"
          placeholder="Search"
          className="max-w-1/2 border-gray my-auto h-full bg-transparent text-sm font-semibold leading-5 tracking-wide text-black caret-black focus:outline-none"
        />
      </div>
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/82de6dd7c6d42f38748c99ce84d762d5228e4a2924362879c6c15719cd083c6b?apiKey=7986bfb78dfc489cb3aeef0f2179bbd2&"
        alt="Decorative"
        className="my-auto aspect-[0.78] hover:cursor-pointer hover:drop-shadow-lg"
      />
      <Link
        to="/login"
        className="my-auto aspect-[1.37] h-full hover:drop-shadow-lg "
      >
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/baabb546e9f8244f9b9dbc07669355deb626906c24df8b81da8beaa3e31ebf53?apiKey=7986bfb78dfc489cb3aeef0f2179bbd2"
          alt="Decorative"
        />
      </Link>
    </div>
  );
}
