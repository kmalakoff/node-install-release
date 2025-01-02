export type InstallPaths = {
  cachePath: string;
  buildPath: string;
  installPath: string;
};

export type InstallResult = {
  version: string;
  installPath: string;
  execPath: string;
};

export interface InstallOptions {
  addVersion?: boolean;
}

export type InstallCallback = (err?: Error, result?: InstallResult) => void;
