'use client';

import { InfoField, useAuthUser } from '@/components/shared';
import { ErrorState, LoadingState, PageShell } from '@/components/shared/layout';
import { formatRupees } from '@/components/shared/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { ApiKeySection } from './ApiKeySection';
import { ProfileUpdateForm } from './ProfileUpdateForm';

export default function ProfilePage() {
  const { data: userData, isLoading, error, refetch } = useAuthUser();
  const [isEditing, setIsEditing] = useState(false);
  const formSubmitRef = useRef<() => void | null>(null);

  if (isLoading || !userData) {
    return (
      <PageShell
        title="Account Settings"
        description="Manage your personal and financial preferences"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent mx-auto mb-4" />
            <p className="text-sm font-medium text-stone-600">Loading profile...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell
        title="Account Settings"
        description="Manage your personal and financial preferences"
      >
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Account Settings"
      description="Manage your personal and financial preferences"
      actions={
        isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(false);
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (formSubmitRef.current) {
                  formSubmitRef.current();
                }
              }}
            >
              Save
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsEditing(true);
            }}
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-gradient-to-r from-amber-600 to-yellow-600" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoField label="Email" value={userData?.email || 'N/A'} />
              <InfoField
                label="Database URL"
                value={<span className="font-mono text-sm">{userData?.database_url || 'N/A'}</span>}
                spanFullWidth
              />
            </div>
          </CardContent>
        </Card>

        {!isEditing && <ApiKeySection apiKey={userData?.api_key} qrString={userData?.qr_string} />}

        {isEditing ? (
          <ProfileUpdateForm
            onSuccess={() => {
              setIsEditing(false);
              refetch();
            }}
            onCancel={() => {
              setIsEditing(false);
            }}
            inlineMode
            formSubmitRef={formSubmitRef}
          />
        ) : (
          <>
            {(userData?.lifetime_income !== undefined ||
              userData?.lifetime_expense !== undefined) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-gradient-to-r from-amber-600 to-yellow-600" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    {userData.lifetime_income !== undefined && (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                        <p className="text-xs font-medium text-emerald-700 mb-1">Lifetime Income</p>
                        <p className="text-2xl font-bold text-emerald-800 font-mono">
                          {formatRupees(userData.lifetime_income)}
                        </p>
                      </div>
                    )}
                    {userData.lifetime_expense !== undefined && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                        <p className="text-xs font-medium text-red-700 mb-1">Lifetime Expense</p>
                        <p className="text-2xl font-bold text-red-800 font-mono">
                          {formatRupees(userData.lifetime_expense)}
                        </p>
                      </div>
                    )}
                    {(userData?.lifetime_income !== undefined ||
                      userData?.lifetime_expense !== undefined) && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200">
                        <p className="text-xs font-medium text-amber-700 mb-1">Net Balance</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-yellow-700 bg-clip-text text-transparent font-mono">
                          {formatRupees(
                            (userData?.lifetime_income ?? 0) - (userData?.lifetime_expense ?? 0)
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {userData?.use_llm_parsing !== undefined && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-gradient-to-r from-amber-600 to-yellow-600" />
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
                      <p className="text-xs font-medium text-stone-600 mb-1">LLM Parsing</p>
                      <p
                        className={`text-sm font-semibold ${userData.use_llm_parsing ? 'text-emerald-700' : 'text-stone-700'}`}
                      >
                        {userData.use_llm_parsing ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    {userData.llm_parse_credits !== undefined && (
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <p className="text-xs font-medium text-amber-700 mb-1">LLM Parse Credits</p>
                        <p className="text-sm font-bold text-amber-800">
                          {userData.llm_parse_credits}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}
