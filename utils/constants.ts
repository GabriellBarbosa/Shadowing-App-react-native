import Constants from "expo-constants";

const HOST = 
    Constants.expoConfig?.hostUri?.split(':').shift() ??
    '192.168.18.6';
const SERVER_HOST = `http://${HOST}:5000`

export {
    SERVER_HOST,
}