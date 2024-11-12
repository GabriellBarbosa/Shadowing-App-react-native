import Constants from "expo-constants";

const api = 
    Constants.expoConfig?.hostUri?.split(':').shift()?.concat(':5000') ??
    'http://192.168.18.6:5000';

export {
    api,
}