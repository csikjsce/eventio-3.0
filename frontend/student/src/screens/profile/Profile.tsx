import man1 from '../../assets/man1.jpeg';
import FooterNav from '../../components/FooterNav';
import { Link } from 'react-router-dom';
import {
  Icon as Icontype,
  ArrowRight2,
  UserEdit,
  Calendar,
  Key,
  CallCalling,
  LogoutCurve,
} from 'iconsax-react';

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
        <Icon size="24" color='#231F20'/>
        <p className="font-fira text-lg text-foreground-light dark:text-foreground-dark">{title}</p>
      </div>
      <ArrowRight2 size="24" color='#231F20'/>
    </Link>
  );
}

export default function Profile() {
  return (
    <>
      <div className="flex flex-col gap-8 items-center">
        <p className="font-fira font-semibold text-lg text-foreground-light dark:text-foreground-dark">My Profile</p>
        <div className="flex flex-col gap-3 items-center">
          <img
            src={man1}
            alt="profile"
            className="w-28 h-28 object-cover rounded-full"
          />
          <p className="font-marcellus text-2xl text-foreground-light dark:text-foreground-dark">Kunal Chaturvedi</p>
        </div>
        <hr className="w-full border-1 border-gray-700" />
        <div className="flex flex-col gap-8 w-full">
          <ProfileItem
            Icon={UserEdit}
            title="Edit Profile"
            to="/profile/edit"
          />
          <ProfileItem
            Icon={Calendar}
            title="My Appointments"
            to="/profile/appointments"
          />
          <ProfileItem
            Icon={Key}
            title="Change Password"
            to="/profile/password"
          />
          <ProfileItem
            Icon={CallCalling}
            title="Contact Us"
            to="/profile/contact"
          />
          <ProfileItem Icon={LogoutCurve} title="Logout" to="/logout" />
        </div>
      </div>
      <FooterNav />
    </>
  );
}
