import axios from 'axios';



async function refreshToken() {
  try {
    const response = await axios.request({
      baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
      url: '/api/v1/auth/refresh-token',
      method: 'POST',
      data: {refreshToken: localStorage.getItem('refreshToken')},
    });
    localStorage.setItem('accessToken', response.data.accessToken);
  } catch (err) {
    throw err;
  }
}

export const axiosCall = (
  method: 'GET' | 'POST',
  path: string,
  sendToken: boolean,
  data?: object | null,
): Promise<UserResponse> => {
  return new Promise<UserResponse>((resolve, reject) => {
    axios
      .request({
        baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
        url: '/api/v1' + path,
        method: method,
        headers: sendToken
          ? {
              Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
            }
          : {},
        data: data,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        console.debug(err);
        if (
          err.response &&
          err.response.status === 401
        ) {
          console.log('Access token expired');
          refreshToken().then(() => {
            axiosCall(method, path, sendToken, data)
              .then((response) => {
                resolve(response);
              })
              .catch((err) => {
                reject(err);
              });
          }).catch((err) => {
            reject(err);
          });
        }
        if (err.response && err.response.data) {
          reject(err.response.data as UserResponse);
        }
        reject(err);
      });
  });
};
