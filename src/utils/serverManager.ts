import { servers } from "@/server";

export interface ServerStatus {
  name: string;
  status: 'checking' | 'online' | 'failed';
  responseTime?: number;
}

/**
 * Just return the first server index by default
 * No health checking - we'll rely on video error handling
 */
export async function findWorkingServer(): Promise<number> {
  // Simply return 0 (first server)
  // The player will handle errors if it doesn't work
  return 0;
}
