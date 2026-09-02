export interface FileLike {
  name: string;
  size: number;
  mimeType: string;
}

export interface DraftInput {
  captureId: string;
  projectId: string;
  payload: unknown;
}

export interface UploadRequest {
  captureId: string;
  idempotencyKey: string;
  filename: string;
  mimeType: string;
  byteSize: number;
}

export interface UploadSession {
  uploadId: string;
  storageKey: string;
  expiresAt: string;
}

export interface MediaIngestAdapter {
  chooseFiles(): Promise<FileLike[]>;
  persistDraft(input: DraftInput): Promise<void>;
  beginUpload(input: UploadRequest): Promise<UploadSession>;
}
