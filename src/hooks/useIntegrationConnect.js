import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { pollOAuth } from "../services/integrations";

export async function connectIntegration(openPopupUrl, hash) {
  const redirectUri = Linking.createURL("redirect");
  const result = await WebBrowser.openAuthSessionAsync(
    `${openPopupUrl}&redirect_uri=${encodeURIComponent(redirectUri)}`,
    redirectUri
  );

  if (result.type === "success") {
    const start = Date.now();
    const timeoutMs = 120000;
    while (Date.now() - start < timeoutMs) {
      try {
        const res = await pollOAuth(hash);
        if (res && res.status === "success") return true;
      } catch (_) {}
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return false;
}