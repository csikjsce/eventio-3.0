import {SearchNormal1, Setting4} from 'iconsax-react';
import React from 'react';
import {colors} from '../colors';

export enum searchType {
    COUNCIL,
    EVENT,
}

type SearchBarProps = {
    search: string;
    setSearch: (search: string) => void;
    type: searchType;
};

const Search = (props: SearchBarProps) => {
    return (
        <div className="h-14 w-[100%] items-center border-gray dark:border-gray-1 border-[0.25px] justify-start rounded-2xl flex-row  ">
            <div className="  overflow-hidden flex items-start flex-row space-x-4 justify-center w-[8%] ml-[3%]">
                <SearchNormal1 color={colors.gray[1]} size={20} />
            </div>
            <div className="overflow-hidden h-full flex items-start flex-row space-x-4 justify-center w-[85%] mx-[2%]">
                <input 
                type='text'
                    className="w-full h-full p-2"
                    placeholder={"Search by" + (props.type === searchType.COUNCIL ? " council" : " event") + " name"}
                    value={props.search}
                    onChange={undefined}></input>
            </div>
            {/* <div className="overflow-hidden w-[8%] mr-[3%]">
                <Setting4
                    color={colors.gray[1]}
                    size={24}
                />
            </div> */}
        </div>
    );
};

export default Search;