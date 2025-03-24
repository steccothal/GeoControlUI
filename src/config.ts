const SERVER_V1_BASE_URL = "/api/v1";
const URL_AUTH = "/auth";
const URL_USERS = "/users";
const URL_NETWORKS = "/networks";
const URL_GATEWAYS = "/:networkCode/gateways";
const URL_SENSORS = "/:gatewayMac/sensors";
const URL_MEASUREMENTS = "/:sensorMac/measurements";

export const GLOBAL_LOADING = "global";

export const CONFIG = {
  APP_PORT: import.meta.env.VITE_APP_PORT || 5173,
  SERVER_PORT: import.meta.env.VITE_SERVER_PORT || 5000,
  SERVER_HOST: import.meta.env.VITE_SERVER_HOST || "localhost",

  ROUTES: {
    V1_AUTH: URL_AUTH,
    V1_USERS: URL_USERS,
    V1_NETWORKS: URL_NETWORKS,
    V1_GATEWAYS: URL_NETWORKS + URL_GATEWAYS,
    V1_SENSORS: URL_NETWORKS + URL_GATEWAYS + URL_SENSORS,
    V1_MEASUREMENTS:
      URL_NETWORKS + URL_GATEWAYS + URL_SENSORS + URL_MEASUREMENTS
  }
};

export const SERVER_BASE_URL = `http://${CONFIG.SERVER_HOST}:${CONFIG.SERVER_PORT}${SERVER_V1_BASE_URL}`;
