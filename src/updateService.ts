import { APP_VERSION, GITHUB_REPO } from "./version";

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
  | { status: "offline"; currentVersion: string };

type GitHubRelease = {
  tag_name: string;
  html_url: string;
  body?: string;
  assets?: Array<{ name: string; browser_download_url: string }>;
};

const normalize = (version: string) => version.replace(/^v/i, "").trim();

const compareVersions = (a: string, b: string) => {
  const left = normalize(a).split(".").map(Number);
  const right = normalize(b).split(".").map(Number);
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    const diff = (left[index] || 0) - (right[index] || 0);
    if (diff !== 0) return diff;
  }

  return 0;
};

export const checkForUpdate = async (): Promise<UpdateInfo> => {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" }
    });

    if (!response.ok) {
      return { status: "offline", currentVersion: APP_VERSION };
    }

    const release = (await response.json()) as GitHubRelease;
    const latestVersion = normalize(release.tag_name);
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
    return { status: "offline", currentVersion: APP_VERSION };
  }
};
