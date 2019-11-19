import { Disklet, DiskletListing } from '../index';
/**
 * Recursively lists a folder.
 */
export declare function deepList(disklet: Disklet, path?: string): Promise<DiskletListing>;
