var APP_MODE = 'Online'; 
// Offline = localhost
//Online = web phps

export const BASE_URL =
  APP_MODE === 'Offline'
    ? "http://192.168.1.100:8080/chef/server/api/"
    : "https://thechefday.com/server/chef/api/";


