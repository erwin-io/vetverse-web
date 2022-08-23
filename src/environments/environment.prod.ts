export const environment = {
  production: true,
  apiBaseUrl: "https://vetverse-api.herokuapp.com/api/v1/",
  apiEndPoints: {
    auth: {
      login: "auth/login",
      logout: "auth/logout",
      register: {
        client: "auth/register/client",
        staff: "auth/register/staff"
      },
      findByUsername: "auth/findByUsername/",
      refreshToken: "auth/refresh-token",
    },
    user: {
      get: "users?userTypeId=",
      getById: "users/",
      createStaff: "users/staff",
      udpdateClient: "users/client",
      udpdateStaff: "users/staff",
      toggleEnable: "users/toggleEnable"
    },
    role: "roles/"
  }
};
