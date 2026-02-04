'use client';

import { useAccounts } from '@/components/shared/hooks/useAccount';
import { useUploadReconciliationStatement } from '@/components/shared/hooks/useReconciliation';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { internal_domain_reconciliation_UploadStatementRes } from '@/generated/api';
import { useAuth } from '@clerk/nextjs';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ReconciliationUploadFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReconciliationUploadForm({
  onSuccess,
  onCancel,
}: ReconciliationUploadFormProps = {}) {
  const { userId } = useAuth();
  const {
    data: accounts,
    isLoading: isLoadingAccounts,
    isFetching: isFetchingAccounts,
  } = useAccounts();
  const upload = useUploadReconciliationStatement();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [accountId, setAccountId] = useState<string>('');
  const [statementPeriodStart, setStatementPeriodStart] = useState<Date | undefined>(undefined);
  const [statementPeriodEnd, setStatementPeriodEnd] = useState<Date | undefined>(undefined);
  const [result, setResult] = useState<internal_domain_reconciliation_UploadStatementRes | null>(
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
    statementPeriodStart != null &&
    statementPeriodEnd != null &&
    !upload.isPending;

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="text-lg font-semibold">Upload bank statement</div>
        <div className="text-sm text-muted-foreground">
          Upload a statement file (.xlsx / .csv) to test the reconciliation flow.
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
              accept=".xlsx,.csv,text/csv,application/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="recon-start"
                type="button"
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  statementPeriodStart == null && 'text-muted-foreground'
                )}
                disabled={upload.isPending}
              >
                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                {statementPeriodStart ? (
                  format(statementPeriodStart, 'dd / MM / yyyy')
                ) : (
                  <span>dd / mm / yyyy</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={statementPeriodStart}
                onSelect={setStatementPeriodStart}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recon-end">Statement period end</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="recon-end"
                type="button"
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  statementPeriodEnd == null && 'text-muted-foreground'
                )}
                disabled={upload.isPending}
              >
                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                {statementPeriodEnd ? (
                  format(statementPeriodEnd, 'dd / MM / yyyy')
                ) : (
                  <span>dd / mm / yyyy</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={statementPeriodEnd}
                onSelect={setStatementPeriodEnd}
                initialFocus
              />
            </PopoverContent>
          </Popover>
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
              statementPeriodStart: statementPeriodStart.toISOString(),
              statementPeriodEnd: statementPeriodEnd.toISOString(),
              accountId,
              userId,
              fileName: selectedFile.name,
            });

            setResult(res);
            onSuccess?.();
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
            setStatementPeriodStart(undefined);
            setStatementPeriodEnd(undefined);
            setResult(null);
            onCancel?.();
          }}
          disabled={upload.isPending}
        >
          Reset
        </Button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="text-sm font-medium">Result</div>
          <div className="grid gap-2 text-sm">
            {result.upload_id && (
              <div>
                <span className="text-muted-foreground">Upload ID:</span>{' '}
                <span className="font-mono">{result.upload_id}</span>
              </div>
            )}
            {result.status && (
              <div>
                <span className="text-muted-foreground">Status:</span> {result.status}
              </div>
            )}
            {result.summary && (
              <div className="flex flex-wrap gap-4 rounded-md bg-muted p-3">
                <span>Total: {result.summary.total_rows ?? 0}</span>
                <span>Valid: {result.summary.valid_rows ?? 0}</span>
                <span>Duplicates: {result.summary.duplicate_rows ?? 0}</span>
                <span>Errors: {result.summary.error_rows ?? 0}</span>
              </div>
            )}
          </div>
          {result.txns && result.txns.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Transactions ({result.txns.length})</div>
              <pre className="max-h-[320px] overflow-auto rounded-md bg-muted p-3 text-xs">
                {JSON.stringify(result.txns, null, 2)}
              </pre>
            </div>
          )}
          {result.summary?.errors && result.summary.errors.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-destructive">
                Parse errors ({result.summary.errors.length})
              </div>
              <ul className="max-h-[240px] overflow-y-auto rounded-md border border-destructive/30 bg-destructive/5 p-2 list-none space-y-1.5">
                {result.summary.errors.map((err, idx) => (
                  <li
                    key={idx}
                    className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-foreground border border-destructive/20"
                  >
                    {err.row != null && <span className="font-medium">Row {err.row}: </span>}
                    {err.error ??
                      (typeof err.data === 'string'
                        ? err.data
                        : JSON.stringify(err.data ?? 'Unknown error'))}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
