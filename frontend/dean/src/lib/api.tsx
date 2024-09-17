import axios from "axios";

export const axiosCall = (
    method: "GET" | "POST",
    path: string,
    sendToken: boolean,
    data?: object | null,
): Promise<UserResponse> => {
    return new Promise<UserResponse>((resolve, reject) => {
        axios
            .request({
                baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
                url: "/api/v1" + path,
                method: method,
                headers: sendToken
                    ? {
                          Authorization:
                              "Bearer " + localStorage.getItem("accessToken"),
                      }
                    : {},
                data: data,
            })
            .then((response) => {
                resolve(response.data);
            })
            .catch((err) => {
                // redirect to login if token is invalid
                if (err.response && err.response.status === 401) {
                    reject({ status: 401, error: "Invalid Token" });
                }
                if (err.response && err.response.data) {
                    reject(err.response.data as UserResponse);
                }
                reject(err);
            });
    });
};
