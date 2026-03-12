import { HttpAgent } from "@icp-sdk/core/agent";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

interface StorageHook {
  uploadBlob: (
    file: File,
    onProgress?: (pct: number) => void,
  ) => Promise<string>;
  getBlobUrl: (blobId: string) => string;
  ready: boolean;
}

let sharedClient: StorageClient | null = null;
let sharedBaseUrl = "";

export function useStorage(): StorageHook {
  const { identity } = useInternetIdentity();
  const [ready, setReady] = useState(!!sharedClient);
  const clientRef = useRef<StorageClient | null>(sharedClient);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const config = await loadConfig();
        const agent = new HttpAgent({
          identity: identity || undefined,
          host: config.backend_host,
        });
        if (config.backend_host?.includes("localhost")) {
          await agent.fetchRootKey().catch(() => {});
        }
        if (cancelled) return;
        const sc = new StorageClient(
          config.bucket_name,
          config.storage_gateway_url,
          config.backend_canister_id,
          config.project_id,
          agent,
        );
        sharedClient = sc;
        clientRef.current = sc;
        sharedBaseUrl = `${config.storage_gateway_url}/v1/blob/?owner_id=${encodeURIComponent(config.backend_canister_id)}&project_id=${encodeURIComponent(config.project_id)}`;
        setReady(true);
      } catch (e) {
        console.error("Failed to init storage client", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [identity]);

  const uploadBlob = useCallback(
    async (file: File, onProgress?: (pct: number) => void): Promise<string> => {
      const client = clientRef.current;
      if (!client) throw new Error("Storage not initialized");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await client.putFile(bytes, onProgress);
      return client.getDirectURL(hash);
    },
    [],
  );

  const getBlobUrl = useCallback((blobId: string): string => {
    if (!blobId) return "";
    // If it's already a URL, return it directly
    if (blobId.startsWith("http")) return blobId;
    // If it's a hash, construct the URL
    if (blobId.startsWith("sha256:") && sharedBaseUrl) {
      return `${sharedBaseUrl}&blob_hash=${encodeURIComponent(blobId)}`;
    }
    return blobId;
  }, []);

  return { uploadBlob, getBlobUrl, ready };
}
