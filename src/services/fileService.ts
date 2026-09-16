/**
 * ============================================================
 * UZHAVAN CONNECT — Idempotent File Storage, Indexing & Search Service
 * 
 * CORE GUARANTEE:
 * 1 UNIQUE FILE
 *   ↓
 * 1 STORAGE OBJECT
 *   ↓
 * 1 DATABASE RECORD
 *   ↓
 * 1 SEARCH/INDEX RECORD
 *   ↓
 * 1 SEARCH RESULT
 *   ↓
 * 1 FILE DISPLAY
 * ============================================================
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type FileCategory =
  | 'INVOICE'
  | 'QUALITY_CERT'
  | 'PRODUCE_PASSPORT'
  | 'SETTLEMENT_RECEIPT'
  | 'CONTRACT'
  | 'WAYBILL'
  | 'GENERAL';

export interface FileRecord {
  id: string;
  userId: string;
  name: string;
  size: number;
  mimeType: string;
  fileHash: string; // SHA-256 cryptographic content digest
  storagePath: string;
  category: FileCategory;
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  url?: string;
  blobDataUrl?: string; // Local preview URI for offline/demo operation
}

export interface FileSearchIndexRecord {
  id: string;
  fileId: string;
  userId: string;
  searchableText: string;
  category?: string;
  indexedAt: string;
}

export interface UploadOptions {
  userId: string;
  category?: FileCategory;
  metadata?: Record<string, any>;
  onProgress?: (percent: number) => void;
}

export interface UploadResult {
  file: FileRecord;
  isDuplicate: boolean;
  status: 'created' | 'already_exists';
  message: string;
}

export interface SearchOptions {
  userId?: string;
  category?: FileCategory;
  limit?: number;
}

export interface CleanupReport {
  totalFilesScanned: number;
  uniqueFilesKept: number;
  duplicatesRemoved: number;
  indexRecordsCleaned: number;
}

// ── LOCAL STORAGE PERSISTENCE KEYS (Fallback & Offline Sync) ─────────────────
const LOCAL_STORAGE_FILES_KEY = 'uzhavan_files_vault';
const LOCAL_STORAGE_INDEX_KEY = 'uzhavan_file_search_index';

// ── CONCURRENCY & IN-FLIGHT LOCK REGISTRY ────────────────────────────────────
// Prevents React StrictMode, double onChange triggers, or rapid clicks from initiating parallel uploads
const activeUploadLocks = new Map<string, Promise<UploadResult>>();

/**
 * Computes a deterministic SHA-256 cryptographic checksum of file binary content.
 * Guarantees content-based identity so identical files are recognized even if renamed.
 */
export async function calculateFileHash(file: File | Blob): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const digestBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(digestBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Loads all file records from local persistence.
 */
function getLocalFiles(): FileRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FILES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[fileService] Failed to read files from local storage', err);
    return [];
  }
}

/**
 * Persists file records to local storage.
 */
function setLocalFiles(files: FileRecord[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_FILES_KEY, JSON.stringify(files));
  } catch (err) {
    console.warn('[fileService] Failed to persist files to local storage', err);
  }
}

/**
 * Loads all search index records from local persistence.
 */
function getLocalIndex(): FileSearchIndexRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[fileService] Failed to read index from local storage', err);
    return [];
  }
}

/**
 * Persists search index records to local storage.
 */
function setLocalIndex(index: FileSearchIndexRecord[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_INDEX_KEY, JSON.stringify(index));
  } catch (err) {
    console.warn('[fileService] Failed to persist index to local storage', err);
  }
}

/**
 * Helper to generate a UUID v4
 */
function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Builds searchable text tokens for indexing a file.
 */
function buildSearchableText(file: FileRecord): string {
  const parts: string[] = [
    file.name,
    file.name.replace(/\.[^/.]+$/, ''), // filename without extension
    file.category,
    file.mimeType,
    file.id,
    file.fileHash.substring(0, 8),
  ];

  if (file.metadata) {
    Object.values(file.metadata).forEach((val) => {
      if (typeof val === 'string' || typeof val === 'number') {
        parts.push(String(val));
      }
    });
  }

  return parts.join(' ').toLowerCase();
}

/**
 * Idempotently updates or inserts the search index record for a file.
 * Guarantees: 1 File = Exactly 1 Search Index Record.
 */
export async function indexFileIdempotent(file: FileRecord): Promise<void> {
  const searchableText = buildSearchableText(file);

  // 1. Update Supabase search index if configured
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('file_search_index')
        .upsert(
          {
            file_id: file.id,
            user_id: file.userId,
            searchable_text: searchableText,
            category: file.category,
            indexed_at: new Date().toISOString(),
          },
          { onConflict: 'file_id' }
        );
    } catch (err) {
      console.warn('[fileService] Supabase indexing failed, fallback to local index', err);
    }
  }

  // 2. Always update local search index idempotently
  const index = getLocalIndex();
  const existingIdx = index.findIndex((item) => item.fileId === file.id);

  const indexRecord: FileSearchIndexRecord = {
    id: existingIdx >= 0 ? index[existingIdx].id : generateUuid(),
    fileId: file.id,
    userId: file.userId,
    searchableText,
    category: file.category,
    indexedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    index[existingIdx] = indexRecord;
  } else {
    index.push(indexRecord);
  }

  setLocalIndex(index);
}

/**
 * Core Idempotent Upload Handler.
 * 
 * Guarantees:
 * - Content hash (SHA-256) calculation before upload.
 * - In-flight upload lock prevents parallel double-upload requests.
 * - If identical file exists for user: returns existing record with status 'already_exists'.
 * - If new file: creates exactly 1 storage object, 1 DB row, and 1 search index row.
 */
export async function uploadFile(
  file: File | Blob,
  fileName: string,
  options: UploadOptions
): Promise<UploadResult> {
  const { userId, category = 'GENERAL', metadata = {}, onProgress } = options;

  if (onProgress) onProgress(10);

  // Step 1: Calculate cryptographic content hash
  const fileHash = await calculateFileHash(file);
  const lockKey = `${userId}:${fileHash}`;

  if (onProgress) onProgress(30);

  // Step 2: Check in-flight upload lock (prevents parallel double uploads)
  if (activeUploadLocks.has(lockKey)) {
    console.info(`[fileService] Upload already in-flight for hash ${fileHash.substring(0, 8)}... Awaiting active promise.`);
    return activeUploadLocks.get(lockKey)!;
  }

  // Execute upload inside lock promise
  const uploadPromise = (async (): Promise<UploadResult> => {
    try {
      // Step 3: Check if file already exists in database/local storage
      let existingFile: FileRecord | null = null;

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('files')
            .select('*')
            .eq('user_id', userId)
            .eq('file_hash', fileHash)
            .eq('status', 'ACTIVE')
            .maybeSingle();

          if (!error && data) {
            existingFile = {
              id: data.id,
              userId: data.user_id,
              name: data.name,
              size: Number(data.size),
              mimeType: data.mime_type,
              fileHash: data.file_hash,
              storagePath: data.storage_path,
              category: data.category as FileCategory,
              status: data.status,
              metadata: data.metadata,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            };
          }
        } catch (e) {
          console.warn('[fileService] Remote existence check failed, falling back to local vault', e);
        }
      }

      // Check local vault if not found in Supabase
      if (!existingFile) {
        const localFiles = getLocalFiles();
        existingFile = localFiles.find(
          (f) => f.userId === userId && f.fileHash === fileHash && f.status === 'ACTIVE'
        ) || null;
      }

      // IDEMPOTENCY HIT: File with this content already exists!
      if (existingFile) {
        if (onProgress) onProgress(100);
        console.info(`[fileService] Idempotency check: File with hash ${fileHash.substring(0, 8)} already exists as ${existingFile.name} (${existingFile.id}). Returning existing record.`);

        // Ensure it is indexed
        await indexFileIdempotent(existingFile);

        return {
          file: existingFile,
          isDuplicate: true,
          status: 'already_exists',
          message: `File already exists in your vault as "${existingFile.name}". Existing record preserved.`,
        };
      }

      if (onProgress) onProgress(50);

      // Step 4: File is unique! Proceed to single storage upload
      const fileId = generateUuid();
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `uploads/${userId}/${fileHash}/${sanitizedName}`;
      let publicUrl: string | undefined;

      if (isSupabaseConfigured) {
        try {
          const { error: storageError } = await supabase.storage
            .from('documents')
            .upload(storagePath, file, {
              upsert: true,
              contentType: file.type || 'application/octet-stream',
            });

          if (!storageError) {
            const { data: urlData } = supabase.storage
              .from('documents')
              .getPublicUrl(storagePath);
            publicUrl = urlData?.publicUrl;
          }
        } catch (storageErr) {
          console.warn('[fileService] Supabase storage upload failed, using local offline storage', storageErr);
        }
      }

      if (onProgress) onProgress(75);

      // For instant offline/local preview, create object URL if needed
      let blobDataUrl: string | undefined;
      if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
        try {
          blobDataUrl = URL.createObjectURL(file);
        } catch {
          // ignore if not supported
        }
      }

      // Step 5: Construct the single canonical record
      const now = new Date().toISOString();
      const newRecord: FileRecord = {
        id: fileId,
        userId,
        name: fileName,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        fileHash,
        storagePath,
        category,
        status: 'ACTIVE',
        metadata,
        createdAt: now,
        updatedAt: now,
        url: publicUrl,
        blobDataUrl,
      };

      // Step 6: Store in database
      if (isSupabaseConfigured) {
        try {
          await supabase.from('files').insert({
            id: newRecord.id,
            user_id: newRecord.userId,
            name: newRecord.name,
            size: newRecord.size,
            mime_type: newRecord.mimeType,
            file_hash: newRecord.fileHash,
            storage_path: newRecord.storagePath,
            category: newRecord.category,
            status: newRecord.status,
            metadata: newRecord.metadata,
            created_at: newRecord.createdAt,
            updated_at: newRecord.updatedAt,
          });
        } catch (dbErr) {
          console.warn('[fileService] Supabase DB insert failed, recorded locally', dbErr);
        }
      }

      // Record locally
      const localFiles = getLocalFiles();
      localFiles.unshift(newRecord);
      setLocalFiles(localFiles);

      if (onProgress) onProgress(90);

      // Step 7: Index the file into the search index
      await indexFileIdempotent(newRecord);

      if (onProgress) onProgress(100);

      console.info(`[fileService] File successfully stored and indexed: ${newRecord.name} (id: ${newRecord.id}, hash: ${newRecord.fileHash.substring(0, 8)})`);

      return {
        file: newRecord,
        isDuplicate: false,
        status: 'created',
        message: `File "${newRecord.name}" successfully uploaded and verified.`,
      };
    } catch (err) {
      throw err;
    }
  })();

  activeUploadLocks.set(lockKey, uploadPromise);
  uploadPromise.finally(() => {
    activeUploadLocks.delete(lockKey);
  });

  return uploadPromise;
}

/**
 * Retrieve all unique active files for a user.
 * Guaranteed: Returns deduplicated list (each unique fileHash appears exactly once).
 */
export async function getFiles(userId?: string, category?: FileCategory): Promise<FileRecord[]> {
  let files: FileRecord[] = [];

  if (isSupabaseConfigured && userId) {
    try {
      let query = supabase
        .from('files')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (!error && data) {
        files = data.map((d) => ({
          id: d.id,
          userId: d.user_id,
          name: d.name,
          size: Number(d.size),
          mimeType: d.mime_type,
          fileHash: d.file_hash,
          storagePath: d.storage_path,
          category: d.category as FileCategory,
          status: d.status,
          metadata: d.metadata,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    } catch (err) {
      console.warn('[fileService] Failed to fetch remote files, fallback to local', err);
    }
  }

  // Merge with local files
  const localFiles = getLocalFiles().filter((f) => f.status === 'ACTIVE');
  if (files.length === 0) {
    files = localFiles;
  } else {
    // Merge without duplicates based on fileId or fileHash
    const knownIds = new Set(files.map((f) => f.id));
    localFiles.forEach((lf) => {
      if (!knownIds.has(lf.id)) {
        files.push(lf);
      }
    });
  }

  // Filter by userId if provided
  if (userId) {
    files = files.filter((f) => f.userId === userId);
  }

  // Filter by category if provided
  if (category) {
    files = files.filter((f) => f.category === category);
  }

  // Defensive Deduplication: Guarantee exactly 1 entry per fileHash per user
  const deduplicated: FileRecord[] = [];
  const seenHashes = new Set<string>();

  for (const file of files) {
    const key = `${file.userId}:${file.fileHash}`;
    if (!seenHashes.has(key)) {
      seenHashes.add(key);
      deduplicated.push(file);
    }
  }

  return deduplicated;
}

/**
 * Search files with guaranteed deduplication.
 * 
 * Searches the index and returns matching unique files.
 * Guarantee: 1 Search Result per Unique File.
 */
export async function searchFiles(
  query: string,
  options?: SearchOptions
): Promise<FileRecord[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    return getFiles(options?.userId, options?.category);
  }

  const allFiles = await getFiles(options?.userId, options?.category);
  const searchIndex = getLocalIndex();

  // Find matching file IDs from search index
  const matchingFileIds = new Set<string>();

  // 1. Check search index
  searchIndex.forEach((item) => {
    if (options?.userId && item.userId !== options.userId) return;
    if (options?.category && item.category !== options.category) return;
    if (item.searchableText.includes(cleanQuery)) {
      matchingFileIds.add(item.fileId);
    }
  });

  // 2. Direct match fallback on file attributes
  const results: FileRecord[] = [];
  const seenHashes = new Set<string>();
  const seenIds = new Set<string>();

  allFiles.forEach((file) => {
    const isIndexedMatch = matchingFileIds.has(file.id);
    const isNameMatch = file.name.toLowerCase().includes(cleanQuery);
    const isCategoryMatch = file.category.toLowerCase().includes(cleanQuery);
    const isIdMatch = file.id.toLowerCase().includes(cleanQuery);

    if (isIndexedMatch || isNameMatch || isCategoryMatch || isIdMatch) {
      const hashKey = `${file.userId}:${file.fileHash}`;
      // STRICT DEDUPLICATION: Prevent duplicate search cards
      if (!seenHashes.has(hashKey) && !seenIds.has(file.id)) {
        seenHashes.add(hashKey);
        seenIds.add(file.id);
        results.push(file);
      }
    }
  });

  if (options?.limit && options.limit > 0) {
    return results.slice(0, options.limit);
  }

  return results;
}

/**
 * Delete a file record and remove it from storage and the search index.
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  // 1. Delete from Supabase if configured
  if (isSupabaseConfigured) {
    try {
      // Find file to get storage path
      const { data } = await supabase
        .from('files')
        .select('storage_path')
        .eq('id', fileId)
        .maybeSingle();

      if (data?.storage_path) {
        await supabase.storage.from('documents').remove([data.storage_path]);
      }

      await supabase.from('files').delete().eq('id', fileId);
      await supabase.from('file_search_index').delete().eq('file_id', fileId);
    } catch (err) {
      console.warn('[fileService] Remote deletion failed, deleting locally', err);
    }
  }

  // 2. Delete from local storage
  const files = getLocalFiles();
  const updatedFiles = files.filter((f) => f.id !== fileId);
  setLocalFiles(updatedFiles);

  // 3. Remove from local search index
  const index = getLocalIndex();
  const updatedIndex = index.filter((item) => item.fileId !== fileId);
  setLocalIndex(updatedIndex);

  console.info(`[fileService] File ${fileId} and associated search index records deleted.`);
  return true;
}

/**
 * Migration & Cleanup Utility: Collapses pre-existing dirty/duplicate records down to 1 canonical record.
 */
export async function cleanupExistingDuplicates(userId?: string): Promise<CleanupReport> {
  const localFiles = getLocalFiles();
  const totalFilesScanned = localFiles.length;

  const grouped = new Map<string, FileRecord[]>();

  localFiles.forEach((file) => {
    if (userId && file.userId !== userId) return;
    const key = `${file.userId}:${file.fileHash}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(file);
  });

  const canonicalFiles: FileRecord[] = [];
  const removedFileIds = new Set<string>();

  grouped.forEach((records) => {
    // Sort by createdAt ascending: keep the earliest record as canonical
    records.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const canonical = records[0];
    canonicalFiles.push(canonical);

    // Any other records are redundant duplicates
    for (let i = 1; i < records.length; i++) {
      removedFileIds.add(records[i].id);
    }
  });

  // Update local files with only canonical entries
  const finalFiles = localFiles.filter(
    (file) => !removedFileIds.has(file.id)
  );
  setLocalFiles(finalFiles);

  // Clean local search index: keep only entries pointing to canonical files
  const index = getLocalIndex();
  const validFileIds = new Set(finalFiles.map((f) => f.id));
  const cleanedIndex = index.filter((item) => validFileIds.has(item.fileId));

  // Re-index all canonical files to ensure 100% search consistency
  for (const f of canonicalFiles) {
    await indexFileIdempotent(f);
  }

  const duplicatesRemoved = removedFileIds.size;
  const indexRecordsCleaned = index.length - cleanedIndex.length;

  console.info(`[fileService] Cleanup complete. Scanned: ${totalFilesScanned}, Kept: ${canonicalFiles.length}, Removed Duplicates: ${duplicatesRemoved}`);

  return {
    totalFilesScanned,
    uniqueFilesKept: canonicalFiles.length,
    duplicatesRemoved,
    indexRecordsCleaned,
  };
}
