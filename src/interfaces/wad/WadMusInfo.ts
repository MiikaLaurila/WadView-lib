export interface WadMusInfo {
	mapToMusic: Record<string, { music: string[] }>;
	musicToMap: Record<string, string[]>;
}
