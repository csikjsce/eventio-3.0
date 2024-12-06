import {
  ArrowRight2,
  CallCalling,
  Clock,
  Icon as Icontype,
  LogoutCurve,
  // UserEdit,
} from 'iconsax-react';
import { Link } from 'react-router-dom';
// import FooterNav from '../../components/FooterNav';

import { UserDataContext } from '../../contexts/userContext';

import { useEffect, useState, useContext } from 'react';

import Loader from '../../components/Loader';

function ProfileItem({
  Icon,
  title,
  to,
}: {
  Icon: Icontype;
  title: string;
  to: string;
}) {
  return (
    <Link to={to} className="flex flex-row items-center justify-between">
      <div className="flex flex-row items-center gap-2">
        <Icon size="24" className="stroke-current text-foreground " />
        <p className="font-fira text-lg text-foreground ">{title}</p>
      </div>
      <ArrowRight2 size="24" className="stroke-current text-foreground " />
    </Link>
  );
}

export default function Profile() {
  const { userData } = useContext(UserDataContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      setLoading(false);
    }
  }, [userData]);
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex flex-col gap-8 items-center p-4  min-h-screen">
            <p className="font-fira font-semibold text-lg text-foreground ">
              My Profile
            </p>
            <div className="flex flex-col gap-3 items-center">
              <img
                src={userData?.photo_url}
                alt="profile"
                className="w-28 h-28 object-cover rounded-full"
              />
              <p className="font-marcellus text-2xl text-foreground ">
                {userData?.name}
              </p>
            </div>
            <hr className="w-full border-1 border-gray-700" />
            <div className="flex flex-col gap-8 w-full">
              {/* <ProfileItem
                Icon={UserEdit}
                title="Edit Profile"
                to="/profile/edit"
              /> */}
              <ProfileItem
                Icon={Clock}
                title="My Events"
                to="/profile/myevents"
              />
              <ProfileItem
                Icon={CallCalling}
                title="Contact Us"
                to="tel:+918657432101"
              />
              <ProfileItem Icon={LogoutCurve} title="Logout" to="/logout" />
            </div>
          </div>
          {/* <FooterNav /> */}
        </>
      )}
    </>
  );
}
