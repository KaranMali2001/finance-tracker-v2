'use client';

import { InfoField, useAuthUser } from '@/components/shared';
import { ErrorState, LoadingState, PageShell } from '@/components/shared/layout';
import { formatRupees } from '@/components/shared/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { ProfileUpdateForm } from './ProfileUpdateForm';

export default function ProfilePage() {
  const { data: userData, isLoading, error, refetch } = useAuthUser();
  const [isEditing, setIsEditing] = useState(false);
  const formSubmitRef = useRef<() => void | null>(null);

  if (isLoading || !userData) {
    return (
      <PageShell title="Profile">
        <LoadingState variant="skeleton" count={5} />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Profile">
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Profile"
      description="View and manage your profile information"
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
            <CardTitle>Account Information</CardTitle>
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
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {userData.lifetime_income !== undefined && (
                      <InfoField
                        label="Lifetime Income"
                        value={formatRupees(userData.lifetime_income)}
                        valueClassName="text-xl font-bold"
                      />
                    )}
                    {userData.lifetime_expense !== undefined && (
                      <InfoField
                        label="Lifetime Expense"
                        value={formatRupees(userData.lifetime_expense)}
                        valueClassName="text-xl font-bold"
                      />
                    )}
                    {(userData?.lifetime_income !== undefined ||
                      userData?.lifetime_expense !== undefined) && (
                      <InfoField
                        label="Net Balance"
                        value={formatRupees(
                          (userData?.lifetime_income ?? 0) - (userData?.lifetime_expense ?? 0)
                        )}
                        valueClassName="text-xl font-bold"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {userData?.use_llm_parsing !== undefined && (
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoField
                      label="LLM Parsing"
                      value={userData.use_llm_parsing ? 'Enabled' : 'Disabled'}
                    />
                    {userData.llm_parse_credits !== undefined && (
                      <InfoField label="LLM Parse Credits" value={userData.llm_parse_credits} />
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
