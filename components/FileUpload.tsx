"use client";

import { useRef, useState, useCallback, type Dispatch, type SetStateAction } from "react";
import { Upload, FileText, Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getFileSize, getFileType, previewFile } from "@/utils";
import type { FileUploadsType } from "@/types";

interface FileUploadProps {
  files: FileUploadsType;
  setFiles: (state: FileUploadsType) => void | Dispatch<SetStateAction<FileUploadsType>>;
  localFiles?: FileUploadsType;
  className?: string;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  maxFiles?: number;
}

export function FileUpload({
  files,
  setFiles,
  localFiles,
  className,
  accept = ".pdf,.csv,.doc,.docx,.png,.jpg,.jpeg",
  maxSizeMB = 5,
  multiple = false,
  maxFiles = 5,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const items = (localFiles ?? files) as FileUploadsType;

  const removeFile = useCallback(
    (id: string) => {
      if (!Array.isArray(items)) return;
      const filtered = items.filter((f) => typeof f !== "string" && f?.id !== id);
      setFiles(filtered);
    },
    [items, setFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      const valid = droppedFiles.filter(
        (f) => f.size <= maxSizeMB * 1024 * 1024
      );
      const newFiles = valid.map((file) => ({
        id: crypto.randomUUID(),
        file,
      }));
      if (multiple) {
        setFiles([...(items ?? []), ...newFiles].slice(0, maxFiles));
      } else {
        setFiles(newFiles.slice(0, maxFiles));
      }
    },
    [items, maxFiles, maxSizeMB, multiple, setFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? []);
      const valid = selected.filter((f) => f.size <= maxSizeMB * 1024 * 1024);
      const newFiles = valid.map((file) => ({
        id: crypto.randomUUID(),
        file,
      }));
      if (multiple) {
        setFiles([...(items ?? []), ...newFiles].slice(0, maxFiles));
      } else {
        setFiles(newFiles.slice(0, maxFiles));
      }
      if (inputRef.current) inputRef.current.value = "";
    },
    [items, maxFiles, maxSizeMB, multiple, setFiles]
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors",
          dragOver
            ? "border-foreground bg-muted/50"
            : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30"
        )}
      >
        <Upload className="size-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">
            Drop files here or click to browse
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Supported: PDF, CSV, DOC, Images (up to {maxSizeMB}MB)
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      {Array.isArray(items) && items.length > 0 && (
        <div className="space-y-2">
          {items.map((each, idx) => {
            const isString = typeof each === "string";
            const fileType = getFileType(isString ? each : each.file) ?? "";
            const size = getFileSize(isString ? 0 : each.file);
            const ext = fileType.toUpperCase();

            return (
              <div
                key={isString ? each : each.id}
                className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                  {["png", "jpg", "jpeg", "gif", "webp"].includes(fileType) ? (
                    <img
                      src={isString ? each : URL.createObjectURL(each.file)}
                      alt=""
                      className="size-9 rounded-md object-cover"
                    />
                  ) : (
                    <FileText className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    Document {idx + 1}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {ext} • {size} KB
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      previewFile(isString ? each : each.file);
                    }}
                  >
                    <Eye className="size-3.5" />
                  </Button>
                  {!isString && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(each.id);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
