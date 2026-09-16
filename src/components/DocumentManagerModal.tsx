import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import {
  FileCategory,
  FileRecord,
  UploadResult,
  uploadFile,
  getFiles,
  deleteFile,
  searchFiles,
  cleanupExistingDuplicates,
  CleanupReport,
} from '../services/fileService';
import {
  FileText,
  Upload,
  Search,
  X,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileImage,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const CATEGORIES: { id: FileCategory | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'All Files' },
  { id: 'INVOICE', label: 'Invoices' },
  { id: 'QUALITY_CERT', label: 'Quality Assays' },
  { id: 'PRODUCE_PASSPORT', label: 'Passports' },
  { id: 'SETTLEMENT_RECEIPT', label: 'Receipts' },
  { id: 'CONTRACT', label: 'Contracts' },
  { id: 'WAYBILL', label: 'E-Waybills' },
  { id: 'GENERAL', label: 'Other' },
];

interface DocumentManagerModalProps {
  isOpen?: boolean;
  defaultCategory?: FileCategory;
  onClose?: () => void;
}

export const DocumentManagerModal: React.FC<DocumentManagerModalProps> = ({
  isOpen,
  defaultCategory,
  onClose,
}) => {
  const { currentUser } = useApp();
  const { t } = useLanguage();

  const userId = currentUser?.id || 'guest';

  const [files, setFiles] = useState<FileRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FileCategory | 'ALL'>(
    defaultCategory || 'ALL'
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<FileRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FileRecord[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load files on open
  const loadFiles = useCallback(async () => {
    setIsLoadingFiles(true);
    try {
      const loaded = await getFiles(userId);
      setFiles(loaded);
    } catch (err) {
      console.warn('[DocumentManagerModal] Failed to load files', err);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen !== false) {
      loadFiles();
    }
  }, [isOpen, loadFiles]);

  // Sync category when opened with a specific filter
  useEffect(() => {
    if (defaultCategory) {
      setSelectedCategory(defaultCategory);
    }
  }, [defaultCategory]);

  // Debounced live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const cat = selectedCategory === 'ALL' ? undefined : selectedCategory;
        const res = await searchFiles(searchQuery, { userId, category: cat });
        setSearchResults(res);
      } catch (err) {
        console.warn('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, userId]);

  // Active files to display
  const displayedFiles = useMemo(() => {
    let list = searchResults !== null ? searchResults : files;

    if (selectedCategory !== 'ALL' && searchResults === null) {
      list = list.filter((f) => f.category === selectedCategory);
    }

    // Defensive deduplication: 1 card per unique fileHash
    const uniqueMap = new Map<string, FileRecord>();
    list.forEach((f) => {
      if (!uniqueMap.has(f.fileHash)) {
        uniqueMap.set(f.fileHash, f);
      }
    });

    return Array.from(uniqueMap.values());
  }, [searchResults, files, selectedCategory]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string, category: FileCategory) => {
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('csv')) return FileSpreadsheet;
    if (mimeType.includes('image')) return FileImage;
    if (category === 'QUALITY_CERT' || category === 'PRODUCE_PASSPORT') return ShieldCheck;
    return FileText;
  };

  const handleUploadFiles = async (fileList: FileList | File[]) => {
    if (!fileList || fileList.length === 0) return;

    setIsUploading(true);
    setUploadNotice(null);

    const results: UploadResult[] = [];
    const filesArray = Array.from(fileList);

    for (const file of filesArray) {
      try {
        const cat: FileCategory =
          selectedCategory !== 'ALL' ? selectedCategory : 'GENERAL';
        const res = await uploadFile(file, file.name, { userId, category: cat });
        results.push(res);
      } catch (err: unknown) {
        console.error('Upload failed for', file.name, err);
      }
    }

    setIsUploading(false);
    await loadFiles(); // Refresh file list

    if (results.length === 1) {
      const single = results[0];
      if (single.isDuplicate) {
        setUploadNotice({
          type: 'info',
          text: `Notice: "${single.file.name}" already exists in your vault. Canonical record preserved (no duplicate created).`,
        });
      } else {
        setUploadNotice({
          type: 'success',
          text: `Success: "${single.file.name}" uploaded and indexed successfully.`,
        });
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      }
    } else if (results.length > 1) {
      const duplicates = results.filter((r) => r.isDuplicate).length;
      const created = results.length - duplicates;

      if (duplicates > 0 && created > 0) {
        setUploadNotice({
          type: 'info',
          text: `Processed ${results.length} files: ${created} new files uploaded, ${duplicates} duplicate(s) safely skipped.`,
        });
      } else if (duplicates > 0 && created === 0) {
        setUploadNotice({
          type: 'info',
          text: `All ${results.length} files already exist in your vault. No duplicate records created.`,
        });
      } else {
        setUploadNotice({
          type: 'success',
          text: `Successfully uploaded and indexed ${created} unique files.`,
        });
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"? This will remove its storage object and search index record.`)) {
      await deleteFile(fileId);
      if (selectedFileForPreview?.id === fileId) {
        setSelectedFileForPreview(null);
      }
      setUploadNotice({
        type: 'info',
        text: `File "${fileName}" and its search index record have been removed.`,
      });
      await loadFiles();
    }
  };

  const handleRunCleanup = async () => {
    const report: CleanupReport = await cleanupExistingDuplicates(userId);
    setUploadNotice({
      type: 'info',
      text: `Deduplication scan complete: ${report.totalFilesScanned} scanned, ${report.uniqueFilesKept} unique files preserved, ${report.duplicatesRemoved} duplicate records purged.`,
    });
    await loadFiles();
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  if (isOpen === false) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-manager-title"
    >
      <div
        className="relative w-full max-w-5xl bg-[#faf9f5] rounded-[32px] border border-[#ccd5ae]/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#01472e]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <div className="shrink-0 px-6 py-5 bg-white/90 border-b border-[#ccd5ae]/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eaf4ec] text-[#01472e] flex items-center justify-center border border-[#a3b18a]/40 shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 id="doc-manager-title" className="text-base sm:text-lg font-semibold text-[#01472e] tracking-tight">
                {t('docManager.title', 'Document Vault & Verified Files')}
              </h2>
              <p className="text-xs text-[#5c7065] flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t('docManager.shaNotice', 'SHA-256 Cryptographic Idempotency • 1 File = 1 Record')}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunCleanup}
              className="btn-outline text-xs px-3.5 py-1.5 gap-1.5 hidden sm:inline-flex"
              title="Scan and purge any duplicate file entries"
            >
              <RefreshCw className="w-3 h-3 text-[#01472e]" />
              <span>{t('docManager.deduplicateVault', 'Deduplicate Vault')}</span>
            </button>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-[#5c7065] hover:text-[#01472e] hover:bg-[#eaf4ec] transition-colors cursor-pointer"
              aria-label={t('common.close', 'Close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── NOTICE BANNER ──────────────────────────────────────────────────── */}
        {uploadNotice && (
          <div
            className={`px-6 py-3 text-xs flex items-center justify-between border-b ${
              uploadNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : uploadNotice.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : 'bg-blue-50 text-blue-900 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {uploadNotice.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              {uploadNotice.type === 'info' && <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />}
              {uploadNotice.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span className="font-medium leading-relaxed">{uploadNotice.text}</span>
            </div>
            <button
              onClick={() => setUploadNotice(null)}
              className="text-xs opacity-70 hover:opacity-100 cursor-pointer ml-3 font-semibold"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── MAIN CONTENT AREA ──────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. UPLOAD DROP ZONE */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 sm:p-8 rounded-[28px] border-2 border-dashed transition-all text-center cursor-pointer ${
              isDragging
                ? 'border-[#01472e] bg-[#eaf4ec]/60 scale-[0.99]'
                : 'border-[#ccd5ae] hover:border-[#a3b18a] bg-white/70 hover:bg-white'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleUploadFiles(e.target.files);
                }
              }}
            />

            <div className="max-w-md mx-auto space-y-3 pointer-events-none">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#eaf4ec] text-[#01472e] flex items-center justify-center border border-[#a3b18a]/40 shadow-2xs">
                {isUploading ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-[#01472e]" />
                ) : (
                  <Upload className="w-6 h-6 text-[#01472e]" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#01472e]">
                  {isUploading ? 'Computing SHA-256 & Verifying...' : 'Drop files here or click to browse'}
                </h3>
                <p className="text-xs text-[#5c7065] mt-1">
                  Supports PDF, DOCX, XLSX, CSV, PPTX, JPG, PNG, TXT (up to 50MB)
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-[11px] text-[#788c80]">
                <span className="inline-flex items-center gap-1 bg-[#fefae0] text-[#01472e] px-2.5 py-0.5 rounded-full border border-[#ccd5ae]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Auto Deduplication
                </span>
                <span className="inline-flex items-center gap-1 bg-[#fefae0] text-[#01472e] px-2.5 py-0.5 rounded-full border border-[#ccd5ae]">
                  <Sparkles className="w-3 h-3 text-emerald-700" /> Instant Search Index
                </span>
              </div>
            </div>
          </div>

          {/* 2. SEARCH & FILTER TOOLBAR */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#788c80]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by filename, category, hash, or invoice ID..."
                  className="input-modern pl-10 pr-4 py-2.5 bg-white shadow-2xs text-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#788c80] hover:text-[#01472e] text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-[#01472e] bg-white px-3.5 py-2.5 rounded-2xl border border-[#ccd5ae]/50 shadow-2xs">
                  {isLoadingFiles ? 'Loading...' : `${displayedFiles.length} Unique File${displayedFiles.length === 1 ? '' : 's'}`}
                </span>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-[#01472e] text-[#fefae0] shadow-2xs'
                      : 'bg-white text-[#5c7065] hover:text-[#01472e] border border-[#ccd5ae]/40 hover:bg-[#eaf4ec]/50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. FILE GRID */}
          {displayedFiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {displayedFiles.map((file) => {
                const IconComponent = getFileIcon(file.mimeType, file.category);
                return (
                  <div
                    key={file.id}
                    className="agri-card p-4 rounded-2xl bg-white border border-[#ccd5ae]/50 shadow-soft hover:shadow-forest transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-9 h-9 rounded-xl bg-[#eaf4ec] text-[#01472e] flex items-center justify-center border border-[#a3b18a]/30 shrink-0">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#fefae0] text-[#01472e] border border-[#ccd5ae]/60">
                            {file.category}
                          </span>
                          <button
                            onClick={() => handleDelete(file.id, file.name)}
                            className="p-1 rounded-lg text-[#5c7065] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer opacity-70 group-hover:opacity-100"
                            title="Delete file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4
                        className="text-xs font-semibold text-[#01472e] mt-2.5 truncate leading-tight"
                        title={file.name}
                      >
                        {file.name}
                      </h4>

                      <div className="flex items-center gap-2 text-[10px] text-[#788c80] mt-1">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span title={file.createdAt}>
                          {new Date(file.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div
                        className="mt-2 text-[9px] font-mono text-[#5c7065] bg-[#faf9f5] px-2 py-1 rounded-lg border border-[#ccd5ae]/30 truncate"
                        title={`SHA-256 Content Fingerprint:\n${file.fileHash}`}
                      >
                        SHA-256: {file.fileHash.substring(0, 16)}...
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#ccd5ae]/30 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedFileForPreview(file)}
                        className="text-[11px] font-medium text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{t('docManager.inspectRecord', 'Inspect Record →')}</span>
                      </button>
                      {file.blobDataUrl || file.url ? (
                        <a
                          href={file.blobDataUrl || file.url}
                          download={file.name}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-[#eaf4ec] text-[#01472e] hover:bg-[#ccd5ae]/40 transition text-[11px] flex items-center gap-1 cursor-pointer"
                          title="Download file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 bg-white rounded-2xl border border-[#ccd5ae]/40 text-center space-y-2">
              <FileText className="w-10 h-10 mx-auto text-[#a3b18a]" />
              <h4 className="text-sm font-semibold text-[#01472e]">
                {searchQuery ? `No files matching "${searchQuery}"` : 'No files in vault'}
              </h4>
              <p className="text-xs text-[#5c7065] max-w-sm mx-auto">
                {searchQuery
                  ? 'Try clearing the search query or selecting a different category filter.'
                  : 'Upload an invoice, quality test certificate, or agreement to get started.'}
              </p>
            </div>
          )}
        </div>

        {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
        <div className="shrink-0 px-6 py-4 bg-[#faf9f5]/90 border-t border-[#ccd5ae]/40 flex items-center justify-between gap-3 text-xs">
          <div className="text-[#5c7065] text-[11px] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t('docManager.strictEnforcement', 'Strict 1-to-1 Index Enforcement Active')}</span>
          </div>
          <button
            onClick={handleClose}
            className="btn-primary text-xs px-5 py-2"
          >
            {t('common.done', 'Done')}
          </button>
        </div>

        {/* ── FILE DETAIL DRAWER ─────────────────────────────────────────────── */}
        {selectedFileForPreview && (
          <div
            className="absolute inset-0 z-20 bg-black/40 backdrop-blur-xs flex justify-end"
            onClick={() => setSelectedFileForPreview(null)}
          >
            <div
              className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slideInRight"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#ccd5ae]/40">
                  <h3 className="text-sm font-semibold text-[#01472e]">
                    {t('docManager.fileMetadata', 'Verified File Metadata')}
                  </h3>
                  <button
                    onClick={() => setSelectedFileForPreview(null)}
                    className="p-1.5 rounded-lg hover:bg-[#eaf4ec] text-[#5c7065] hover:text-[#01472e]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#01472e]">
                    <FileText className="w-4 h-4 text-emerald-800" />
                    <span className="truncate">{selectedFileForPreview.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-[#5c7065] pt-1">
                    <div>
                      <span className="block text-[#788c80]">{t('docManager.size', 'Size')}</span>
                      <span className="font-semibold text-[#01472e]">
                        {formatFileSize(selectedFileForPreview.size)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[#788c80]">{t('docManager.category', 'Category')}</span>
                      <span className="font-semibold text-[#01472e]">
                        {selectedFileForPreview.category}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[#788c80]">{t('docManager.mimeType', 'MIME Type')}</span>
                      <span className="font-semibold text-[#01472e] truncate block">
                        {selectedFileForPreview.mimeType}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[#788c80]">{t('common.status', 'Status')}</span>
                      <span className="font-semibold text-emerald-700">
                        {selectedFileForPreview.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-950 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Cryptographic Integrity</span>
                  </div>
                  <p className="text-[11px] text-emerald-900 leading-relaxed">
                    This file is tracked by its binary content SHA-256 fingerprint. Any repeated uploads of this exact file are automatically deduplicated.
                  </p>
                  <div className="font-mono text-[9px] bg-white/80 p-2 rounded-lg border border-emerald-300 break-all select-all text-emerald-950">
                    {selectedFileForPreview.fileHash}
                  </div>
                </div>

                <div className="space-y-2 text-[11px] text-[#5c7065]">
                  <div>
                    <span className="block text-[#788c80] text-[10px]">Canonical File ID</span>
                    <span className="font-mono text-[#01472e]">{selectedFileForPreview.id}</span>
                  </div>
                  <div>
                    <span className="block text-[#788c80] text-[10px]">Storage Key</span>
                    <span className="font-mono text-[#01472e] truncate block">
                      {selectedFileForPreview.storagePath}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[#788c80] text-[10px]">Created At</span>
                    <span>{new Date(selectedFileForPreview.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#ccd5ae]/40 flex gap-2">
                {selectedFileForPreview.blobDataUrl || selectedFileForPreview.url ? (
                  <a
                    href={selectedFileForPreview.blobDataUrl || selectedFileForPreview.url}
                    download={selectedFileForPreview.name}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary text-xs flex-1 text-center"
                  >
                    <Download className="w-3.5 h-3.5 inline mr-1.5" /> Download File
                  </a>
                ) : null}
                <button
                  onClick={() =>
                    handleDelete(selectedFileForPreview.id, selectedFileForPreview.name)
                  }
                  className="btn-outline text-rose-700 border-rose-300 hover:bg-rose-50 text-xs px-3"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
