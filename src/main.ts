import "./style.css";
import appConfig from "./config/sites.json";

interface Site {
  name: string;
  url: string;
  isMirror?: boolean;
  group: string;
}

interface SiteGroup {
  title: string;
  subtitle?: string;
  mainSite: Site;
  mirrors: Site[];
}

const EXTERNAL_LINK_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
  <polyline points="15 3 21 3 21 9"></polyline>
  <line x1="10" y1="14" x2="21" y2="3"></line>
</svg>`.trim();

const STATUS_CHIP_BASE = "inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold";

function updateStatusChip(chip: HTMLSpanElement, status: number | null, isOnline: boolean | null) {
  if (status === null) {
    chip.className = `${STATUS_CHIP_BASE} bg-yellow-200 text-yellow-800`;
    chip.textContent = "Checking...";
  } else if (status === 301) {
    chip.className = `${STATUS_CHIP_BASE} bg-orange-200 text-orange-800`;
    chip.textContent = "Moved";
  } else if (isOnline) {
    chip.className = `${STATUS_CHIP_BASE} bg-green-200 text-green-800`;
    chip.textContent = "Online";
  } else {
    chip.className = `${STATUS_CHIP_BASE} bg-red-200 text-red-800`;
    chip.textContent = `Offline (${status ?? "ERR"})`;
  }
}

function createSiteStatusElement(site: Site): HTMLAnchorElement {
  const { url, name, isMirror } = site;

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.className = isMirror
    ? "rounded-md shadow-md hover:bg-zinc-700 transition duration-200 bg-zinc-700 p-3 flex items-center gap-2 flex-grow mr-2 mb-2"
    : "rounded-md shadow-md hover:bg-zinc-700 transition duration-200 block bg-zinc-800 p-4 flex justify-between mb-2";

  const nameContainer = document.createElement("div");
  nameContainer.className = "flex items-center gap-2";

  const heading = document.createElement("h4");
  heading.className = isMirror ? "text-sm text-gray-500 italic" : "text-lg font-semibold text-white";
  heading.textContent = name;

  const icon = document.createElement("span");
  icon.className = "text-gray-400 text-sm";
  icon.innerHTML = EXTERNAL_LINK_ICON;

  nameContainer.append(heading, icon);

  const chip = document.createElement("span");
  updateStatusChip(chip, null, null);

  const statusContainer = document.createElement("p");
  statusContainer.className = "text-gray-400 text-sm ml-auto";
  statusContainer.append(chip);

  const errorText = document.createElement("p");
  errorText.className = "text-red-500 text-sm mt-1 hidden basis-full";

  link.append(nameContainer, statusContainer, errorText);

  const checkStatus = async () => {
    try {
      const response = await fetch(url, { method: "HEAD", redirect: "follow" });
      updateStatusChip(chip, response.status, response.ok);
      errorText.textContent = "";
      errorText.classList.add("hidden");
    } catch (err) {
      updateStatusChip(chip, null, false);
      const message = err instanceof Error ? err.message : "Error";
      errorText.textContent = `Error: ${message}`;
      errorText.classList.remove("hidden");
    }
  };

  void checkStatus();
  setInterval(checkStatus, 10000);

  return link;
}

function createSiteGroupElement(group: SiteGroup): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "bg-zinc-800 rounded-md p-4 shadow-md mb-6";

  const title = document.createElement("h2");
  title.className = "text-xl font-semibold text-white mb-1";
  title.textContent = group.title;
  container.append(title);

  if (group.subtitle) {
    const subtitle = document.createElement("h3");
    subtitle.className = "text-sm text-gray-400 mb-2";
    subtitle.textContent = group.subtitle;
    container.append(subtitle);
  }

  container.append(createSiteStatusElement(group.mainSite));

  if (group.mirrors.length > 0) {
    const mirrorsContainer = document.createElement("div");
    mirrorsContainer.className = "mt-2 flex flex-wrap gap-2";
    for (const mirror of group.mirrors) {
      const wrapper = document.createElement("div");
      wrapper.className = "flex-grow";
      wrapper.append(createSiteStatusElement(mirror));
      mirrorsContainer.append(wrapper);
    }
    container.append(mirrorsContainer);
  }

  return container;
}

function groupSites(sites: Site[]): SiteGroup[] {
  const grouped: Record<string, Site[]> = {};
  for (const site of sites) {
    (grouped[site.group] ??= []).push(site);
  }

  const { groupDescriptions } = appConfig as { groupDescriptions: Record<string, string> };

  return Object.entries(grouped).map(([title, groupedSites]) => {
    const mainSite = groupedSites.find((site) => !site.isMirror);
    if (!mainSite) {
      throw new Error(`Group "${title}" has no main site`);
    }
    const mirrors = groupedSites.filter((site) => site.isMirror);
    return { title, subtitle: groupDescriptions[title], mainSite, mirrors };
  });
}

function renderApp(root: HTMLDivElement) {
  const { sites } = appConfig as { sites: Site[] };
  const siteGroups = groupSites(sites);

  root.className = "bg-zinc-900 min-h-screen py-12";

  const container = document.createElement("div");
  container.className = "container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8";

  const heading = document.createElement("h1");
  heading.className = "text-3xl font-bold text-white text-center mb-6";
  heading.textContent = "o-murphy's apps status";

  const groupsContainer = document.createElement("div");
  groupsContainer.className = "space-y-6";
  for (const group of siteGroups) {
    groupsContainer.append(createSiteGroupElement(group));
  }

  container.append(heading, groupsContainer);
  root.append(container);
}

const appRoot = document.querySelector<HTMLDivElement>("#app");
if (appRoot) {
  renderApp(appRoot);
}
