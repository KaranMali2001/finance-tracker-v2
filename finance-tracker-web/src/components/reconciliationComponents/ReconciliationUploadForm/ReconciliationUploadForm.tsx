'use client';

import { useAccounts } from '@/components/shared/hooks/useAccount';
import { useUploadReconciliationStatement } from '@/components/shared/hooks/useReconciliation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { internal_domain_reconciliation_ParsedTxns } from '@/generated/api';
import { useAuth } from '@clerk/nextjs';
import { useMemo, useState } from 'react';

function toIsoString(value: string): string {
  return new Date(value).toISOString();
}

export function ReconciliationUploadForm() {
  const { userId } = useAuth();
  const {
    data: accounts,
    isLoading: isLoadingAccounts,
    isFetching: isFetchingAccounts,
  } = useAccounts();
  const upload = useUploadReconciliationStatement();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [accountId, setAccountId] = useState<string>('');
  const [statementPeriodStart, setStatementPeriodStart] = useState<string>('');
  const [statementPeriodEnd, setStatementPeriodEnd] = useState<string>('');
  const [result, setResult] = useState<Array<internal_domain_reconciliation_ParsedTxns> | null>(
    null
  );

  const accountOptions = useMemo(() => {
    if (!accounts) {
      return [];
    }

    return accounts.map((a) => ({
      value: a.id || '',
      label: a.account_name || a.id || 'Account',
    }));
  }, [accounts]);

  const canSubmit =
    !!userId &&
    !!selectedFile &&
    !!accountId &&
    !!statementPeriodStart &&
    !!statementPeriodEnd &&
    !upload.isPending;

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="text-lg font-semibold">Upload bank statement</div>
        <div className="text-sm text-muted-foreground">
          Upload an Excel file (.xls / .xlsx) to test the reconciliation flow.
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="recon-account">Account</Label>
          <Select
            value={accountId || undefined}
            onValueChange={(value) => {
              setAccountId(value);
            }}
            disabled={isLoadingAccounts || isFetchingAccounts}
          >
            <SelectTrigger id="recon-account">
              <SelectValue
                placeholder={isLoadingAccounts ? 'Loading accounts...' : 'Select an account'}
              />
            </SelectTrigger>
            <SelectContent>
              {accountOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Statement file</Label>
          <div className="flex items-center gap-2">
            <input
              id="recon-statement-input"
              type="file"
              accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setSelectedFile(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const input = document.getElementById(
                  'recon-statement-input'
                ) as HTMLInputElement | null;
                if (input) {
                  input.click();
                }
              }}
              disabled={upload.isPending}
            >
              {selectedFile ? 'Change file' : 'Choose file'}
            </Button>
            {selectedFile && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{selectedFile.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recon-start">Statement period start</Label>
          <Input
            id="recon-start"
            type="datetime-local"
            value={statementPeriodStart}
            onChange={(e) => {
              setStatementPeriodStart(e.target.value);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recon-end">Statement period end</Label>
          <Input
            id="recon-end"
            type="datetime-local"
            value={statementPeriodEnd}
            onChange={(e) => {
              setStatementPeriodEnd(e.target.value);
            }}
          />
        </div>
      </div>

      {!userId && (
        <div className="text-sm text-destructive">You must be signed in to upload a statement.</div>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={async () => {
            if (!canSubmit || !selectedFile || !userId) {
              return;
            }

            const res = await upload.mutateAsync({
              statement: selectedFile,
              statementPeriodStart: toIsoString(statementPeriodStart),
              statementPeriodEnd: toIsoString(statementPeriodEnd),
              accountId,
              userId,
              fileName: selectedFile.name,
            });

            setResult(res);
          }}
          disabled={!canSubmit}
        >
          {upload.isPending ? 'Uploading...' : 'Upload & process'}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSelectedFile(null);
            setAccountId('');
            setStatementPeriodStart('');
            setStatementPeriodEnd('');
            setResult(null);
          }}
          disabled={upload.isPending}
        >
          Reset
        </Button>
      </div>

      {result && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Response</div>
          <pre className="max-h-[420px] overflow-auto rounded-md bg-muted p-3 text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </Card>
  );
}
