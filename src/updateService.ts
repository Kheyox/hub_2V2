import { APP_VERSION, GITHUB_REPO, UPDATE_MANIFEST_URL } from "./version";
import { compareVersions, normalizeVersion } from "./gameEngines";

export type UpdateInfo =
  | {
      status: "available";
      currentVersion: string;
      latestVersion: string;
      releaseUrl: string;
      apkUrl?: string;
      notes: string;
    }
  | { status: "current"; currentVersion: string; latestVersion: string }
  | { status: "blocked"; currentVersion: string; reason: string; releaseUrl: string }
  | { status: "offline"; currentVersion: string; reason: string };

type GitHubRelease = {
  tag_name: string;
  html_url: string;
  body?: string;
  assets?: Array<{ name: string; browser_download_url: string }>;
};
type UpdateManifest = {
  version: string;
  releaseUrl: string;
  apkUrl?: string;
  notes?: string;
};

export const checkForUpdate = async (): Promise<UpdateInfo> => {
  const releaseUrl = `https://github.com/${GITHUB_REPO}/releases/latest`;

  try {
    const response = await fetch(`${UPDATE_MANIFEST_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (response.ok) {
      const manifest = (await response.json()) as UpdateManifest;
      const latestVersion = normalizeVersion(manifest.version);
      if (compareVersions(latestVersion, APP_VERSION) > 0) {
        return {
          status: "available",
          currentVersion: APP_VERSION,
          latestVersion,
          releaseUrl: manifest.releaseUrl,
          apkUrl: manifest.apkUrl,
          notes: manifest.notes || ""
        };
      }
      return { status: "current", currentVersion: APP_VERSION, latestVersion };
    }
  } catch {
    // GitHub API fallback below keeps update checks useful while Pages is not ready.
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" }
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403 || response.status === 404) {
        return {
          status: "blocked",
          currentVersion: APP_VERSION,
          reason: "Le manifeste public n'est pas encore disponible et GitHub bloque les releases privees.",
          releaseUrl
        };
      }

      return { status: "offline", currentVersion: APP_VERSION, reason: "Verification GitHub indisponible pour le moment." };
    }

    const release = (await response.json()) as GitHubRelease;
    const latestVersion = normalizeVersion(release.tag_name);
    const apk = release.assets?.find((asset) => asset.name.toLowerCase().endsWith(".apk"));

    if (compareVersions(latestVersion, APP_VERSION) > 0) {
      return {
        status: "available",
        currentVersion: APP_VERSION,
        latestVersion,
        releaseUrl: release.html_url,
        apkUrl: apk?.browser_download_url,
        notes: release.body || ""
      };
    }

    return { status: "current", currentVersion: APP_VERSION, latestVersion };
  } catch {
    return { status: "offline", currentVersion: APP_VERSION, reason: "Pas de connexion ou verification bloquee." };
  }
};
