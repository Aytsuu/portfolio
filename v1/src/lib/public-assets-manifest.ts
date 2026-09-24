import manifest from "../generated/public-assets.json";
import type { PublicAssetsManifest } from "../types/public-assets";

const data = manifest as PublicAssetsManifest;

export const getPublicAssetsManifest = (): PublicAssetsManifest => data;
