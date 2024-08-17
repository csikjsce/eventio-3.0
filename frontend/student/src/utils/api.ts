import axios from 'axios';

export const axiosCall = (
  method: 'GET' | 'POST',
  path: string,
  sendToken: true,
): Promise<UserResponse> => {
  return new Promise<UserResponse>((resolve, reject) => {
    axios
      .request({
        baseURL: 'http://localhost:8000',
        url: '/api/v1' + path,
        method: method,
        headers: sendToken
          ? {
              Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
            }
          : {},
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        if (err.response && err.response.data) {
          reject(err.response.data as UserResponse);
        }
        reject(err);
      });
  });
};
