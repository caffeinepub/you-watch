import { type HttpAgent, isV3ResponseBody } from "@icp-sdk/core/agent";
import { IDL } from "@icp-sdk/core/candid";

type Headers = Record<string, string>;

const MAXIMUM_CONCURRENT_UPLOADS = 4;
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;
const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB per chunk

const GATEWAY_VERSION = "v1";

const HASH_ALGORITHM = "SHA-256";
const SHA256_PREFIX = "sha256:";
const DOMAIN_SEPARATOR_FOR_CHUNKS = new TextEncoder().encode("icfs-chunk/");
const DOMAIN_SEPARATOR_FOR_METADATA = new TextEncoder().encode(
  "icfs-metadata/",
);
const DOMAIN_SEPARATOR_FOR_NODES = new TextEncoder().encode("ynode/");

// Utility function for exponential backoff retry logic - retries on network/server errors only
async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if this error should be retried
      const shouldRetry = isRetriableError(error);

      // On the final attempt or non-retriable error, throw the error
      if (attempt === MAX_RETRIES || !shouldRetry) {
        if (!shouldRetry && attempt < MAX_RETRIES) {
          console.warn(
            `Non-retriable error encountered: ${lastError.message}. Not retrying.`,
          );
        }
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        BASE_DELAY_MS * 2 ** attempt + Math.random() * 1000,
        MAX_DELAY_MS,
      );

      console.warn(
        `Request failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}): ${lastError.message}. Retrying in ${Math.round(delay)}ms...`,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("Unknown error occurred during retry attempts");
}

function isRetriableError(error: any): boolean {
  const errorMessage = error?.message?.toLowerCase() || "";

  if (error?.response?.status) {
    const status = error.response.status;
    if (status === 408 || status === 429) return true;
    if (status >= 400 && status < 500) return false;
    if (status >= 500) return true;
  }

  if (
    errorMessage.includes("ssl") ||
    errorMessage.includes("tls") ||
    errorMessage.includes("network error") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("fetch")
  ) {
    return true;
  }

  if (
    errorMessage.includes("validation") ||
    errorMessage.includes("invalid") ||
    errorMessage.includes("malformed") ||
    errorMessage.includes("unauthorized") ||
    errorMessage.includes("forbidden") ||
    errorMessage.includes("not found")
  ) {
    return false;
  }

  return true;
}

// Hash validation utility
function validateHashFormat(hash: string, context: string): void {
  if (!hash) {
    throw new Error(`${context}: Hash cannot be empty`);
  }

  if (!hash.startsWith(SHA256_PREFIX)) {
    throw new Error(
      `${context}: Invalid hash format. Expected format: ${SHA256_PREFIX}<64-char-hex>, got: ${hash}`,
    );
  }

  const hexPart = hash.substring(SHA256_PREFIX.length);
  if (hexPart.length !== 64) {
    throw new Error(
      `${context}: Invalid hash format. Expected 64 hex characters after ${SHA256_PREFIX}, got ${hexPart.length} characters: ${hash}`,
    );
  }

  if (!/^[0-9a-f]{64}$/i.test(hexPart)) {
    throw new Error(
      `${context}: Invalid hash format. Hash must contain only hex characters (0-9, a-f), got: ${hash}`,
    );
  }
}

class YHash {
  public readonly bytes: Uint8Array;

  constructor(bytes: Uint8Array) {
    if (bytes.length !== 32) {
      throw new Error(`YHash must be exactly 32 bytes, got ${bytes.length}`);
    }
    this.bytes = new Uint8Array(bytes);
  }

  static async fromNodes(
    left: YHash | null,
    right: YHash | null,
  ): Promise<YHash> {
    let leftBytes =
      left instanceof YHash
        ? left.bytes
        : new TextEncoder().encode("UNBALANCED");
    let rightBytes =
      right instanceof YHash
        ? right.bytes
        : new TextEncoder().encode("UNBALANCED");
    const combined = new Uint8Array(
      DOMAIN_SEPARATOR_FOR_NODES.length + leftBytes.length + rightBytes.length,
    );
    const arrays = [DOMAIN_SEPARATOR_FOR_NODES, leftBytes, rightBytes];
    let offset = 0;
    for (const data of arrays) {
      combined.set(data, offset);
      offset += data.length;
    }
    const hashBuffer = await crypto.subtle.digest(HASH_ALGORITHM, combined);
    return new YHash(new Uint8Array(hashBuffer));
  }

  static async fromChunk(data: Uint8Array): Promise<YHash> {
    return YHash.fromBytes(DOMAIN_SEPARATOR_FOR_CHUNKS, data);
  }

  static async fromHeaders(headers: Headers): Promise<YHash> {
    const headerLines: string[] = [];
    for (const [key, value] of Object.entries(headers)) {
      headerLines.push(`${key.trim()}: ${value.trim()}\n`);
    }
    headerLines.sort();
    const hash = await YHash.fromBytes(
      DOMAIN_SEPARATOR_FOR_METADATA,
      new TextEncoder().encode(headerLines.join("")),
    );
    return hash;
  }

  static async fromBytes(
    domainSeparator: Uint8Array,
    data: Uint8Array,
  ): Promise<YHash> {
    const combined = new Uint8Array(domainSeparator.length + data.length);
    combined.set(domainSeparator);
    combined.set(data, domainSeparator.length);
    const hashBuffer = await crypto.subtle.digest(HASH_ALGORITHM, combined);
    return new YHash(new Uint8Array(hashBuffer));
  }

  public static fromHex(hexString: string): YHash {
    const bytes = new Uint8Array(
      hexString.match(/.{1,2}/g)!.map((byte) => Number.parseInt(byte, 16)),
    );
    return new YHash(bytes);
  }

  public toShaString(): string {
    return `${SHA256_PREFIX}${this.toHex()}`;
  }

  public toString(): string {
    throw new Error("toString is not supported for YHash");
  }

  private toHex(): string {
    return Array.from(this.bytes)
      .map((b: number) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}

type TreeNode = {
  hash: YHash;
  left: TreeNode | null;
  right: TreeNode | null;
};

type TreeNodeJSON = {
  hash: string;
  left: TreeNodeJSON | null;
  right: TreeNodeJSON | null;
};

function nodeToJSON(node: TreeNode): TreeNodeJSON {
  return {
    hash: node.hash.toShaString(),
    left: node.left ? nodeToJSON(node.left) : null,
    right: node.right ? nodeToJSON(node.right) : null,
  };
}

type BlobHashTreeJSON = {
  tree_type: "DSBMTWH";
  chunk_hashes: string[];
  tree: TreeNodeJSON;
  headers: string[];
};

class BlobHashTree {
  public tree_type: "DSBMTWH";
  public chunk_hashes: YHash[];
  public tree: TreeNode;
  public headers: string[];

  constructor(
    chunk_hashes: YHash[],
    tree: TreeNode,
    headers: string[] | Headers | null = null,
  ) {
    this.tree_type = "DSBMTWH";
    this.chunk_hashes = chunk_hashes;
    this.tree = tree;

    if (headers == null) {
      this.headers = [];
    } else if (Array.isArray(headers)) {
      this.headers = headers;
    } else {
      this.headers = Object.entries(headers).map(
        ([key, value]) => `${key.trim()}: ${value.trim()}`,
      );
    }
    this.headers.sort();
  }

  public static async build(
    chunkHashes: YHash[],
    headers: Headers = {},
  ): Promise<BlobHashTree> {
    if (chunkHashes.length === 0) {
      const hex =
        "8b8e620f084e48da0be2287fd12c5aaa4dbe14b468fd2e360f48d741fe7628a0";
      const bytes = new TextEncoder().encode(hex);
      chunkHashes.push(new YHash(bytes));
    }

    let level: TreeNode[] = chunkHashes.map((hash) => ({
      hash,
      left: null,
      right: null,
    }));

    while (level.length > 1) {
      const nextLevel: TreeNode[] = [];
      for (let i = 0; i < level.length; i += 2) {
        const left = level[i];
        const right = level[i + 1] || null;
        const parentHash = await YHash.fromNodes(
          left.hash,
          right ? right.hash : null,
        );
        nextLevel.push({ hash: parentHash, left, right });
      }
      level = nextLevel;
    }

    const chunksRoot = level[0];

    if (headers && Object.keys(headers).length > 0) {
      const metadataRootHash = await YHash.fromHeaders(headers);
      const metadataRoot: TreeNode = {
        hash: metadataRootHash,
        left: null,
        right: null,
      };
      const combinedRootHash = await YHash.fromNodes(
        chunksRoot.hash,
        metadataRoot.hash,
      );
      const combinedRoot: TreeNode = {
        hash: combinedRootHash,
        left: chunksRoot,
        right: metadataRoot,
      };
      return new BlobHashTree(chunkHashes, combinedRoot, headers);
    }

    return new BlobHashTree(chunkHashes, chunksRoot, headers);
  }

  public toJSON(): BlobHashTreeJSON {
    return {
      tree_type: this.tree_type,
      chunk_hashes: this.chunk_hashes.map((h) => h.toShaString()),
      tree: nodeToJSON(this.tree),
      headers: this.headers,
    };
  }
}

interface UploadChunkParams {
  blobRootHash: YHash;
  chunkHash: YHash;
  chunkIndex: number;
  chunkData: Uint8Array;
  bucketName: string;
  owner: string;
  projectId: string;
  httpHeaders: Headers;
}

class StorageGatewayClient {
  constructor(private readonly storageGatewayUrl: string) {}

  public getStorageGatewayUrl(): string {
    return this.storageGatewayUrl;
  }

  public async uploadChunk(
    params: UploadChunkParams,
  ): Promise<{ isComplete: boolean }> {
    const blobHashString = params.blobRootHash.toShaString();
    const chunkHashString = params.chunkHash.toShaString();
    validateHashFormat(
      blobHashString,
      `uploadChunk[${params.chunkIndex}] blob_hash`,
    );
    validateHashFormat(
      chunkHashString,
      `uploadChunk[${params.chunkIndex}] chunk_hash`,
    );

    return await withRetry(async () => {
      const queryParams = new URLSearchParams({
        owner_id: params.owner,
        blob_hash: blobHashString,
        chunk_hash: chunkHashString,
        chunk_index: params.chunkIndex.toString(),
        bucket_name: params.bucketName,
        project_id: params.projectId,
      });
      const url = `${this.storageGatewayUrl}/${GATEWAY_VERSION}/chunk/?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
          "X-Caffeine-Project-ID": params.projectId,
        },
        body: params.chunkData as BodyInit,
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
          `Failed to upload chunk ${params.chunkIndex}: ${response.status} ${response.statusText} - ${errorText}`,
        );
        (error as any).response = { status: response.status };
        throw error;
      }

      const result = (await response.json()) as { status: string };
      return { isComplete: result.status === "blob_complete" };
    });
  }

  public async uploadBlobTree(
    blobHashTree: BlobHashTree,
    bucketName: string,
    numBlobBytes: number,
    owner: string,
    projectId: string,
    certificateBytes: Uint8Array,
  ): Promise<void> {
    const treeJSON = blobHashTree.toJSON();
    validateHashFormat(treeJSON.tree.hash, "uploadBlobTree root hash");
    treeJSON.chunk_hashes.forEach((hash, index) => {
      validateHashFormat(hash, `uploadBlobTree chunk_hash[${index}]`);
    });

    return await withRetry(async () => {
      const url = `${this.storageGatewayUrl}/${GATEWAY_VERSION}/blob-tree/`;
      const requestBody = {
        blob_tree: treeJSON,
        bucket_name: bucketName,
        num_blob_bytes: numBlobBytes,
        owner: owner,
        project_id: projectId,
        headers: blobHashTree.headers,
        auth: {
          OwnerEgressSignature: Array.from(certificateBytes),
        },
      };

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Caffeine-Project-ID": projectId,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
          `Failed to upload blob tree: ${response.status} ${response.statusText} - ${errorText}`,
        );
        (error as any).response = { status: response.status };
        throw error;
      }
    });
  }
}

export class StorageClient {
  private readonly storageGatewayClient: StorageGatewayClient;

  public constructor(
    private readonly bucket: string,
    storageGatewayUrl: string,
    private readonly backendCanisterId: string,
    private readonly projectId: string,
    private readonly agent: HttpAgent,
  ) {
    this.storageGatewayClient = new StorageGatewayClient(storageGatewayUrl);
  }

  private async getCertificate(hash: string): Promise<Uint8Array> {
    const args = IDL.encode([IDL.Text], [hash]);
    const result = await this.agent.call(this.backendCanisterId, {
      methodName: "_caffeineStorageCreateCertificate",
      arg: args,
    });
    const respone = result.response.body;
    if (isV3ResponseBody(respone)) {
      console.log("Certificate:", respone.certificate);
      return respone.certificate;
    }
    throw new Error("Expected v3 response body");
  }

  /**
   * putBlob — resumable, chunked upload for large files.
   * Never loads the full file into memory.
   * Skips chunks already in `resumedChunks` for resume support.
   * Calls `onChunkComplete(index)` after each chunk succeeds.
   */
  public async putBlob(
    file: File,
    onProgress?: (pct: number) => void,
    resumedChunks?: Set<number>,
    onChunkComplete?: (chunkIndex: number) => void,
  ): Promise<{ hash: string }> {
    const fileHeaders: Headers = {
      "Content-Type": file.type || "application/octet-stream",
      "Content-Length": file.size.toString(),
    };
    const httpHeaders: Headers = {
      "Content-Type": "application/json",
    };

    // Build chunk hashes without loading the whole file into memory
    const { chunks, chunkHashes, blobHashTree } =
      await this.processFileForUpload(file, fileHeaders);
    const blobRootHash = blobHashTree.tree.hash;
    const hashString = blobRootHash.toShaString();

    // Obtain a signed upload certificate from the backend
    const certificateBytes = await this.getCertificate(hashString);

    // Register the blob tree with the storage gateway
    await this.storageGatewayClient.uploadBlobTree(
      blobHashTree,
      this.bucket,
      file.size,
      this.backendCanisterId,
      this.projectId,
      certificateBytes,
    );

    // Upload only the pending (non-resumed) chunks
    await this.resumableChunkUpload(
      chunks,
      chunkHashes,
      blobRootHash,
      httpHeaders,
      onProgress,
      resumedChunks ?? new Set(),
      onChunkComplete,
    );

    return { hash: hashString };
  }

  public async putFile(
    blobBytes: Uint8Array,
    onProgress?: (pct: number) => void,
  ): Promise<{ hash: string }> {
    const httpHeaders: Headers = { "Content-Type": "application/json" };
    const file = new Blob([new Uint8Array(blobBytes)], {
      type: "application/octet-stream",
    });
    const fileHeaders: Headers = {
      "Content-Type": "application/octet-stream",
      "Content-Length": file.size.toString(),
    };

    const { chunks, chunkHashes, blobHashTree } =
      await this.processFileForUpload(file, fileHeaders);
    const blobRootHash = blobHashTree.tree.hash;
    const hashString = blobRootHash.toShaString();

    const certificateBytes = await this.getCertificate(hashString);

    await this.storageGatewayClient.uploadBlobTree(
      blobHashTree,
      this.bucket,
      file.size,
      this.backendCanisterId,
      this.projectId,
      certificateBytes,
    );
    await this.parallelUpload(
      chunks,
      chunkHashes,
      blobRootHash,
      httpHeaders,
      onProgress,
    );
    return { hash: hashString };
  }

  public async getDirectURL(hash: string): Promise<string> {
    if (!hash) throw new Error("Hash must not be empty");
    validateHashFormat(hash, `getDirectURL for path '${hash}'`);
    return `${this.storageGatewayClient.getStorageGatewayUrl()}/${GATEWAY_VERSION}/blob/?blob_hash=${encodeURIComponent(hash)}&owner_id=${encodeURIComponent(this.backendCanisterId)}&project_id=${encodeURIComponent(this.projectId)}`;
  }

  private async processFileForUpload(
    file: Blob,
    headers: Headers,
  ): Promise<{
    chunks: Blob[];
    chunkHashes: YHash[];
    blobHashTree: BlobHashTree;
  }> {
    const chunks = this.createFileChunks(file);
    const chunkHashes: YHash[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunkData = new Uint8Array(await chunks[i].arrayBuffer());
      const hash = await YHash.fromChunk(chunkData);
      chunkHashes.push(hash);
    }
    const blobHashTree = await BlobHashTree.build(chunkHashes, headers);
    return { chunks, chunkHashes, blobHashTree };
  }

  /**
   * Upload chunks that are NOT in `resumedChunks`, with concurrency limit.
   * Calls `onChunkComplete` after each successful chunk so the caller can
   * persist progress to IndexedDB for future resume.
   */
  private async resumableChunkUpload(
    chunks: Blob[],
    chunkHashes: YHash[],
    blobRootHash: YHash,
    httpHeaders: Headers,
    onProgress: ((pct: number) => void) | undefined,
    resumedChunks: Set<number>,
    onChunkComplete?: (chunkIndex: number) => void,
  ): Promise<void> {
    const totalChunks = chunks.length;
    if (totalChunks === 0) {
      onProgress?.(100);
      return;
    }

    let completedCount = resumedChunks.size;

    // Report initial progress for already-completed chunks
    if (onProgress && completedCount > 0) {
      onProgress(Math.round((completedCount / totalChunks) * 100));
    }

    // Build list of indices still needing upload
    const pending: number[] = [];
    for (let i = 0; i < totalChunks; i++) {
      if (!resumedChunks.has(i)) pending.push(i);
    }

    const uploadOne = async (index: number): Promise<void> => {
      const chunkData = new Uint8Array(await chunks[index].arrayBuffer());
      await this.storageGatewayClient.uploadChunk({
        blobRootHash,
        chunkHash: chunkHashes[index],
        chunkIndex: index,
        chunkData,
        bucketName: this.bucket,
        owner: this.backendCanisterId,
        projectId: this.projectId,
        httpHeaders,
      });
      completedCount++;
      onChunkComplete?.(index);
      onProgress?.(Math.round((completedCount / totalChunks) * 100));
    };

    // Fan out across workers, each processing a slice of the pending list
    const workers = Math.min(MAXIMUM_CONCURRENT_UPLOADS, pending.length);
    await Promise.all(
      Array.from({ length: workers }, async (_, w) => {
        for (let i = w; i < pending.length; i += workers) {
          await uploadOne(pending[i]);
        }
      }),
    );
  }

  private async parallelUpload(
    chunks: Blob[],
    chunkHashes: YHash[],
    blobRootHash: YHash,
    httpHeaders: Headers,
    onProgress: ((percentage: number) => void) | undefined,
  ): Promise<void> {
    let completedChunks = 0;
    const uploadSingleChunk = async (index: number): Promise<void> => {
      const chunkData = new Uint8Array(await chunks[index].arrayBuffer());
      const chunkHash = chunkHashes[index];
      await this.storageGatewayClient.uploadChunk({
        blobRootHash,
        chunkHash,
        chunkIndex: index,
        chunkData,
        bucketName: this.bucket,
        owner: this.backendCanisterId,
        projectId: this.projectId,
        httpHeaders,
      });
      const currentCompleted = ++completedChunks;
      if (onProgress != null) {
        const percentage =
          chunks.length === 0
            ? 100
            : Math.round((currentCompleted / chunks.length) * 100);
        onProgress(percentage);
      }
    };
    await Promise.all(
      Array.from(
        { length: MAXIMUM_CONCURRENT_UPLOADS },
        async (_, workerId) => {
          for (
            let i = workerId;
            i < chunks.length;
            i += MAXIMUM_CONCURRENT_UPLOADS
          ) {
            await uploadSingleChunk(i);
          }
        },
      ),
    );
  }

  private createFileChunks(file: Blob, chunkSize = CHUNK_SIZE): Blob[] {
    const chunks: Blob[] = [];
    const totalChunks = Math.ceil(file.size / chunkSize);
    for (let index = 0; index < totalChunks; index++) {
      const start = index * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      chunks.push(file.slice(start, end));
    }
    return chunks;
  }
}
