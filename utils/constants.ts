import Constants from "expo-constants";

const HOST = 
    Constants.expoConfig?.hostUri?.split(':').shift() ??
    '192.168.18.6';
const HOST_WITH_PORT = `http://${HOST}:5000`

export {
    HOST_WITH_PORT,
}