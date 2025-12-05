export interface ProviderMetadata {
  id: string;
  name: string;
  type?: string;
  mediaTypes?: string[];
}

const cachedMetadata: ProviderMetadata[] = [];

export function getCachedMetadata(): ProviderMetadata[] {
  return cachedMetadata;
}

export function addCachedMetadata(metadata: ProviderMetadata): void {
  if (!cachedMetadata.find(m => m.id === metadata.id)) {
    cachedMetadata.push(metadata);
  }
}

export function getApiToken(): string | null {
  return null;
}

export function setApiToken(token: string): void {}
