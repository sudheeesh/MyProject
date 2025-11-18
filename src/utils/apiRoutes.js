import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_URL = "https://whitecel.com";

const base = (resource) => `${API_URL}/test/${resource}`;

export const apiRoutes = {
  async dynamic(resourceKey = null) {
    const resource = resourceKey || (await AsyncStorage.getItem("resource")) || "csp-test";
    return {
      resources: `${base(resource)}/resources`,
      dropdownValues: `${base(resource)}/dropdowns`,
      domainconfs: `${base(resource)}/domainconfs`,
      driveConfig: `${base(resource)}/driveconfigs`,
      botConfigs: `${base(resource)}/botconfigs`,
      login: `${base(resource)}/users/token`,
      users: `${base(resource)}/users`,
      createUser: `${base(resource)}/users/create`,
      chatConfigs: `${base(resource)}/chatconfigs`,
      qnaQuery: `${base(resource)}/qna_query`,
      integrations: `${base(resource)}/integrations`,
    };
  },
};