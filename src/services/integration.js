import http from "./http";
import { apiRoutes } from "../utils/apiRoutes";

export async function getIntegrations() {
  const { data } = await http.get(apiRoutes.integration);
  return data;
}

export async function getDriveConfigs() {
  const { data } = await http.get(apiRoutes.driveConfig);
  return data;
}

export async function pollOAuth(hash) {
  const { data } = await http.post(`/test/hash/users_cloud/token`, {
    username: hash,
    resource: "hash",
  });
  return data;
}