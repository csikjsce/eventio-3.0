import axios from 'axios';

export const axiosCall = <T extends BaseResponse>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  sendToken: boolean = true,
  data?: object,
): Promise<T> => {
  return axios
    .request<T>({
      baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
      url: '/api/v1' + endpoint,
      method: method,
      headers: sendToken
        ? {
            Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
          }
        : {},
      data: data,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error('Axios call failed:', error.response);
      if (error.response.data.message) {
        throw Error(error.response?.data?.message);
      } else {
        throw error;
      }
    });
};

export const fetchUser = async (): Promise<UserResponse> => {
  try {
    const data = await axiosCall<UserResponse>('/user');
    if (data.error) {
      throw new Error(data.message);
    }
    return data;
  } catch (err) {
    console.error(err);
    return { error: true, message: 'Error fetching user' };
  }
};

const refeshToken = async () => {};
