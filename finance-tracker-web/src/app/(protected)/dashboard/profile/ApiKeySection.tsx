'use client';

import { InfoField, useGenerateApiKey } from '@/components/shared';
import { copyToClipboard } from '@/components/shared/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Copy, EyeOff, Key, QrCode } from 'lucide-react';
import { useState } from 'react';

interface ApiKeySectionProps {
  apiKey?: string;
  qrString?: string;
}

export function ApiKeySection({ apiKey, qrString }: ApiKeySectionProps) {
  const { mutate: generateApiKey, isPending } = useGenerateApiKey();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const handleCopy = async () => {
    if (apiKey) {
      const success = await copyToClipboard(apiKey, 'API key copied to clipboard');
      if (success) {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      }
    }
  };

  const handleGenerate = () => {
    generateApiKey(undefined);
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) {
      return key;
    }
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  };

  const hasApiKey = apiKey ? apiKey.trim().length > 0 : false;

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key</CardTitle>
      </CardHeader>
      <CardContent>
        {hasApiKey ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <InfoField
                label="Your API Key"
                value={
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm break-all flex-1">
                      {maskApiKey(apiKey!)}
                    </span>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={handleCopy} disabled={copied}>
                        {copied ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                      {qrString && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowQr(!showQr);
                          }}
                        >
                          {showQr ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Hide QR
                            </>
                          ) : (
                            <>
                              <QrCode className="mr-2 h-4 w-4" />
                              Show QR
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                }
                spanFullWidth
              />
            </div>
            {qrString && showQr && (
              <div className="space-y-2">
                <InfoField
                  label="QR Code"
                  value={
                    <div className="flex justify-center p-4 bg-white rounded-lg border w-fit mx-auto">
                      <img src={qrString} alt="API Key QR Code" className="w-48 h-48" />
                    </div>
                  }
                  spanFullWidth
                />
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Your API key has been generated. Keep it secure and do not share it publicly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate an API key to access the Finance Tracker API. Once generated, you cannot
              regenerate it.
            </p>
            <Button onClick={handleGenerate} disabled={isPending || hasApiKey}>
              <Key className="mr-2 h-4 w-4" />
              {isPending ? 'Generating...' : 'Generate API Key'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
