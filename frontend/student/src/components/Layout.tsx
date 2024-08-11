import React from 'react';
import { useMediaQuery, MediaQueryAllQueryable } from 'react-responsive';

import { Fragment } from 'react';

import Navbar from './Navbar';

// Use this component as a starter components of every page It contains childrens of the page and Navbar.
// It is a standard layout for every page.

const Layout = (props: any) => {
    // const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    return (
        <>
            <div className=" bg-background-light dark:bg-background-dark flex  items-center justify-center h-[100vh] w-[100vw] overflow-hidden ">
                {/* <ScrollView> */}
                    <div className="w-[100vw] h-fit bg-background-light dark:bg-background-dark flex items-center justify-center">
                        {props.children}
                    </div>
                {/* </ScrollView> */}
                {
                    !props.noNavbar ? <div className="w-full absolute overflow-hidden flex items-center justify-center bottom-0 bg-background-light dark:bg-background-dark ">
                    <Navbar />
                </div> : '' 
                }
                
            </div>
        </>
    );
};

export default Layout;