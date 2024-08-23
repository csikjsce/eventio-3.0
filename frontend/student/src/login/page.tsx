import { Button } from '@material-tailwind/react';
import { useEffect } from 'react';
import EventioLogo from '../assets/EventioLogo.svg';

export default function Login() {
  // Function to initiate the Google login process
  const login = () => {
    window.open(
      import.meta.env.VITE_APP_SERVER_ADDRESS + '/api/v1/auth/google',
      '_self',
    );
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessTokenParam = urlParams.get('accessToken');
    const refreshTokenParam = urlParams.get('refreshToken');

    if (accessTokenParam && refreshTokenParam) {
      localStorage.setItem('accessToken', accessTokenParam);
      localStorage.setItem('refreshToken', refreshTokenParam);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-16 p-4 dark:bg-background-dark">
      <div className="flex flex-col w-full h-44 items-center align-middle justify-end">
        <img src={EventioLogo} alt="Eventio" className="h-20 w-20" />
      </div>
      <div className="fiex justify-center items-center text-center">
        <p className="font-marcellus text-primary text-3xl">Eventio</p>
        <p className="text-sm text-foreground-light dark:text-foreground-dark">
          By CSI-KJSCE
        </p>
      </div>
      <Button
        onClick={login}
        size="lg"
        variant="outlined"
        color="light-blue"
        className="flex items-center gap-3"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        <img
          src="https://docs.material-tailwind.com/icons/google.svg"
          alt="metamask"
          className="h-6 w-6"
        />
        Continue with Google
      </Button>
    </div>
  );
}
