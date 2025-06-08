export interface WadDirectoryEntry {
	lumpLocation: number;
	lumpSize: number;
	lumpName: string;
	lumpIdx: number;
}
export type WadDirectory = WadDirectoryEntry[];
