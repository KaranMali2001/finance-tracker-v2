'use client';

import { useState } from 'react';
import { useParseTransactionImage } from '@/components/shared/hooks/useTransaction';
import { Button } from '@/components/ui/button';
import type { internal_domain_transaction_ParsedTxnRes } from '@/generated/api';

interface ReceiptUploadProps {
  onParsed: (parsed: internal_domain_transaction_ParsedTxnRes) => void;
  onError?: (error: unknown) => void;
}

export function ReceiptUpload({ onParsed, onError }: ReceiptUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const parseImage = useParseTransactionImage();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleParseClick = async () => {
    if (!selectedFile) {
      return;
    }

    try {
      const parsed = await parseImage.mutateAsync(selectedFile);
      onParsed(parsed);
    } catch (error) {
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-border p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium">Upload Receipt</span>
          <span className="text-xs text-muted-foreground">
            Upload a receipt image to auto-fill transaction details. Supported formats: JPG, PNG,
            GIF, WEBP.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="receipt-upload-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const input = document.getElementById(
                'receipt-upload-input'
              ) as HTMLInputElement | null;
              if (input) {
                input.click();
              }
            }}
            disabled={parseImage.isPending}
          >
            {selectedFile ? 'Change Image' : 'Choose Image'}
          </Button>
          <Button
            type="button"
            onClick={handleParseClick}
            disabled={!selectedFile || parseImage.isPending}
          >
            {parseImage.isPending ? 'Parsing...' : 'Parse Receipt'}
          </Button>
        </div>
      </div>
      {selectedFile && (
        <div className="text-xs text-muted-foreground">
          Selected file: <span className="font-medium text-foreground">{selectedFile.name}</span>
        </div>
      )}
    </div>
  );
}
