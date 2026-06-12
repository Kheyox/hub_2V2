import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.kheyox.hub2v2",
  appName: "Versus",
  webDir: "dist",
  server: {
    androidScheme: "https"
  }
};

export default config;
