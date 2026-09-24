import { getPublicAssetsManifest } from "./public-assets-manifest";
import type { Project } from "../types/public-assets";

export type { Project } from "../types/public-assets";

export const loadProjects = (): Project[] => getPublicAssetsManifest().projects;
