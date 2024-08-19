import { Button } from '@material-tailwind/react';
import { useEffect } from 'react';

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
    <div className="flex justify-center items-center h-screen">
      <Button
        fullWidth
        onClick={login}
        className="max-w-xs bg-blue-500 text-white"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        Login with Google
      </Button>
    </div>
  );
}
