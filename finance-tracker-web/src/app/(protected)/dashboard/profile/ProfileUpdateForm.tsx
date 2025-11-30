'use client';

import { useAuthUser, useUpdateUser } from '@/components/shared';
import { Form, FormCheckbox, FormInput } from '@/components/shared/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { internal_domain_user_UpdateUserReq } from '@/generated/api';
import { useRouter } from 'next/navigation';
import React from 'react';
import * as z from 'zod';

const updateUserSchema = z.object({
  database_url: z
    .string()
    .refine(
      (val) => val === '' || z.string().url().safeParse(val).success,
      'Must be a valid URL or empty'
    )
    .optional(),
  lifetime_income: z.number().min(0, 'Must be positive').optional(),
  lifetime_expense: z.number().min(0, 'Must be positive').optional(),
  use_llm_parsing: z.boolean().optional(),
});

type UpdateUserFormInput = z.infer<typeof updateUserSchema>;

interface ProfileUpdateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showOnlySettings?: boolean;
  inlineMode?: boolean;
  formSubmitRef?: React.MutableRefObject<(() => void) | null>;
}

export function ProfileUpdateForm({
  onSuccess,
  onCancel,
  showOnlySettings,
  inlineMode = false,
  formSubmitRef,
}: ProfileUpdateFormProps = {}) {
  const router = useRouter();
  const updateUser = useUpdateUser();
  const { data: userData, isLoading } = useAuthUser();

  // Transform function to convert form data to API format
  const transformToUpdateRequest = (
    data: UpdateUserFormInput
  ): internal_domain_user_UpdateUserReq => {
    const updateData: internal_domain_user_UpdateUserReq = {};

    // Handle database_url - only include if it has a non-empty value
    if (data.database_url && String(data.database_url).trim() !== '') {
      updateData.database_url = String(data.database_url);
    }

    // Handle lifetime_income - only include if it's a valid number
    if (data.lifetime_income !== null && data.lifetime_income !== undefined) {
      if (typeof data.lifetime_income === 'number' && isFinite(data.lifetime_income)) {
        updateData.lifetime_income = data.lifetime_income;
      } else {
        const parsed = parseFloat(String(data.lifetime_income));
        if (!isNaN(parsed) && isFinite(parsed)) {
          updateData.lifetime_income = parsed;
        }
      }
    }

    // Handle lifetime_expense - only include if it's a valid number
    if (data.lifetime_expense !== null && data.lifetime_expense !== undefined) {
      if (typeof data.lifetime_expense === 'number' && isFinite(data.lifetime_expense)) {
        updateData.lifetime_expense = data.lifetime_expense;
      } else {
        const parsed = parseFloat(String(data.lifetime_expense));
        if (!isNaN(parsed) && isFinite(parsed)) {
          updateData.lifetime_expense = parsed;
        }
      }
    }

    // Handle use_llm_parsing - only include if it's defined
    if (data.use_llm_parsing !== undefined) {
      updateData.use_llm_parsing = data.use_llm_parsing;
    }

    return updateData;
  };

  const handleSubmit = async (data: internal_domain_user_UpdateUserReq) => {
    await updateUser.mutateAsync(data);
    router.refresh();
    onSuccess?.();
  };

  if (isLoading || !userData) {
    return null;
  }

  const defaultValues: Partial<internal_domain_user_UpdateUserReq> = {
    database_url: userData.database_url || '',
    lifetime_income: userData.lifetime_income ?? undefined,
    lifetime_expense: userData.lifetime_expense ?? undefined,
    use_llm_parsing: userData.use_llm_parsing ?? undefined,
  };

  // Create a key that changes when userData changes to force form re-initialization
  const formKey = React.useMemo(
    () =>
      `form-${userData.lifetime_income ?? 'null'}-${userData.lifetime_expense ?? 'null'}-${userData.use_llm_parsing ?? 'null'}`,
    [userData.lifetime_income, userData.lifetime_expense, userData.use_llm_parsing]
  );

  return (
    <Form
      schema={updateUserSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      transform={transformToUpdateRequest}
      showToastOnSuccess={false}
      showToastOnError={false}
      key={formKey}
    >
      {({ form, isSubmitting }) => {
        // Expose form submit function to parent via ref
        // Use react-hook-form's handleSubmit which validates the data,
        // then apply transform and call handleSubmit
        if (formSubmitRef) {
          formSubmitRef.current = () => {
            form.handleSubmit(
              (data) => {
                // Apply transform and submit
                const transformedData = transformToUpdateRequest(data);
                handleSubmit(transformedData);
              },
              () => {
                // Validation errors - Form component will handle these via showToastOnError
              }
            )();
          };
        }

        if (inlineMode) {
          return (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="database_url"
                      label="Database URL"
                      type="url"
                      placeholder="Enter database URL"
                      className="md:col-span-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {(userData?.lifetime_income !== undefined ||
                userData?.lifetime_expense !== undefined) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormInput
                        control={form.control}
                        name="lifetime_income"
                        label="Lifetime Income"
                        type="number"
                        step="0.01"
                        placeholder="Enter lifetime income"
                      />
                      <FormInput
                        control={form.control}
                        name="lifetime_expense"
                        label="Lifetime Expense"
                        type="number"
                        step="0.01"
                        placeholder="Enter lifetime expense"
                      />
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
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <FormCheckbox
                          control={form.control}
                          name="use_llm_parsing"
                          checkboxLabel="Enable LLM Parsing"
                          description="Use AI-powered parsing for transactions"
                        />
                      </div>
                      {userData.llm_parse_credits !== undefined && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">
                            LLM Parse Credits
                          </span>
                          <p className="mt-1 text-card-foreground">{userData.llm_parse_credits}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          );
        }

        return (
          <div className="space-y-4">
            {!showOnlySettings && (
              <>
                <FormInput
                  control={form.control}
                  name="database_url"
                  label="Database URL"
                  type="url"
                  placeholder="Enter database URL"
                />
                <FormInput
                  control={form.control}
                  name="lifetime_income"
                  label="Lifetime Income"
                  type="number"
                  step="0.01"
                  placeholder="Enter lifetime income"
                />
                <FormInput
                  control={form.control}
                  name="lifetime_expense"
                  label="Lifetime Expense"
                  type="number"
                  step="0.01"
                  placeholder="Enter lifetime expense"
                />
              </>
            )}
            {showOnlySettings && (
              <FormCheckbox
                control={form.control}
                name="use_llm_parsing"
                checkboxLabel="Enable LLM Parsing"
                description="Use AI-powered parsing for transactions"
              />
            )}
            <div className="flex justify-end gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting || updateUser.isPending}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting || updateUser.isPending}>
                {isSubmitting || updateUser.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        );
      }}
    </Form>
  );
}
