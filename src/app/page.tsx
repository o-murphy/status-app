'use client';

import { useState, useEffect, JSX } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import appConfig from '@/config/sites.json'; // Adjust the path if your 'config' folder is in a different location


interface Site {
  name: string;
  url: string;
  isMirror?: boolean;
  group: string;
}

interface SiteStatusProps extends Site { }

function SiteStatus({ url, name, isMirror }: SiteStatusProps) {
  const [status, setStatus] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
        console.log(response);
        setStatus(response.status);
        setIsOnline(response.ok);
        setError(null);
      } catch (err: any) {
        setStatus(null);
        setIsOnline(false);
        setError(err.message || 'Error');
      }
    };

    checkStatus();
    const intervalId = setInterval(checkStatus, 10000);
    return () => clearInterval(intervalId);
  }, [url]);

  const getStatusDisplay = (): JSX.Element | string => {
    const baseChipClasses = 'inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold';

    if (status === null) return <span className={`${baseChipClasses} bg-yellow-200 text-yellow-800`}>Checking...</span>;
    if (status === 301) return <span className={`${baseChipClasses} bg-orange-200 text-orange-800`}>Moved</span>;
    if (isOnline) return <span className={`${baseChipClasses} bg-green-200 text-green-800`}>Online</span>;
    return <span className={`${baseChipClasses} bg-red-200 text-red-800`}>Offline ({status || 'ERR'})</span>;
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`rounded-md shadow-md hover:bg-zinc-700 transition duration-200 ${isMirror ? 'bg-zinc-700 p-3 flex items-center gap-2' : 'block bg-zinc-800 p-4 flex justify-between'
        } ${isMirror ? 'flex-grow mr-2 mb-2' : 'mb-2'}`}
    >
      <div className="flex items-center gap-2"> {/* Container for name and icon in main site */}
        <h4 className={`${isMirror ? 'text-sm text-gray-500 italic' : 'text-lg font-semibold text-white'}`}>{name}</h4>
        <FiExternalLink className="text-gray-400 text-sm" />
      </div>
      <p className="text-gray-400 text-sm ml-auto">
        {getStatusDisplay()}
      </p>
      {error && <p className="text-red-500 text-sm mt-1">Error: {error}</p>}
    </a>
  );
}

interface SiteGroup {
  title: string;
  subtitle?: string;
  mainSite: Site;
  mirrors: Site[];
}

function SiteGroupStatus({ title, subtitle, mainSite, mirrors }: { title: string; subtitle?: string; mainSite: Site; mirrors: Site[] }) {
  return (
    <div className="bg-zinc-800 rounded-md p-4 shadow-md mb-6">
      <h2 className="text-xl font-semibold text-white mb-1">{title}</h2>
      {subtitle && <h3 className="text-sm text-gray-400 mb-2">{subtitle}</h3>}
      <SiteStatus key={mainSite.url} {...mainSite} isMirror={false} /> {/* Changed this line */}
      {mirrors.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {mirrors.map((mirror) => (
            <div key={mirror.url} className="flex-grow">
              <SiteStatus url={mirror.url} name={mirror.name} isMirror={true} group={mirror.group} /> {/* Ensure group is passed for mirrors too */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export default function App() {
  const { sites: sitesToCheck, groupDescriptions } = appConfig as {
    sites: Site[];
    groupDescriptions: { [key: string]: string };
  };

  // Group sites by group title
  const groupedSites: { [key: string]: Site[] } = sitesToCheck.reduce((acc: { [key: string]: Site[] }, site) => { // Explicitly type 'acc'
    if (!acc[site.group]) {
      acc[site.group] = [];
    }
    acc[site.group].push(site);
    return acc;
  }, {}); // The initial value remains an empty object, but TypeScript now knows its intended structure

  const siteGroups: SiteGroup[] = Object.entries(groupedSites).map(([title, sites]) => {
    // If you can ensure 'title' is always one of the keys of groupDescriptions:
    const mainSite = sites.find((site) => !site.isMirror);
    const mirrors = sites.filter((site) => site.isMirror);
    return {
      title,
      subtitle: groupDescriptions[title as keyof typeof groupDescriptions],
      mainSite: mainSite!,
      mirrors,
    };
  });

  return (
    <div className="bg-zinc-900 min-h-screen py-12">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white text-center mb-6">o-murphy's apps status</h1>
        <div className="space-y-6">
          {siteGroups.map((group) => (
            <SiteGroupStatus key={group.title} title={group.title} subtitle={group.subtitle} mainSite={group.mainSite} mirrors={group.mirrors} />
          ))}
        </div>
      </div>
    </div>
  );
}
