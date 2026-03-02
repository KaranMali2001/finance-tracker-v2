'use client';

import { Form, FormCheckbox, FormInput, FormOption, FormSelect } from '@/components/shared/form';
import { useAccounts } from '@/components/shared/hooks/useAccount';
import {
  useCreateInvestmentRule,
  useInvestmentGoals,
  useUpdateInvestmentRule,
} from '@/components/shared/hooks/useInvestment';
import { Button } from '@/components/ui/button';
import type {
  internal_domain_investment_CreateGoalInvestmentReq,
  internal_domain_investment_GoalInvestment,
} from '@/generated/api';
import { internal_domain_investment_CreateGoalInvestmentReq as CreateReq } from '@/generated/api';
import { useMemo } from 'react';
import type { Control } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import * as z from 'zod';

const INVESTMENT_TYPE_OPTIONS: FormOption[] = [
  { value: CreateReq.investment_type.MUTUAL_FUND, label: 'Mutual Fund' },
  { value: CreateReq.investment_type.STOCK, label: 'Stock' },
  { value: CreateReq.investment_type.FD, label: 'Fixed Deposit' },
  { value: CreateReq.investment_type.PPF, label: 'PPF' },
  { value: CreateReq.investment_type.NPS, label: 'NPS' },
  { value: CreateReq.investment_type.GOLD, label: 'Gold' },
  { value: CreateReq.investment_type.REAL_ESTATE, label: 'Real Estate' },
  { value: CreateReq.investment_type.CRYPTO, label: 'Crypto' },
  { value: CreateReq.investment_type.OTHER, label: 'Other' },
];

const CONTRIBUTION_TYPE_OPTIONS: FormOption[] = [
  { value: CreateReq.contribution_type.ONE_TIME, label: 'One Time' },
  { value: CreateReq.contribution_type.SIP, label: 'SIP (Recurring)' },
];

const ruleSchema = z.object({
  investment_type: z.string().min(1, 'Investment type is required'),
  contribution_type: z.string().min(1, 'Contribution type is required'),
  contribution_value: z
    .number({ message: 'Amount is required' })
    .positive('Amount must be greater than 0'),
  account_id: z.string().min(1, 'Account is required'),
  goal_id: z.string().optional(),
  auto_invest: z.boolean().optional(),
  investment_day: z.number().min(1).max(31).optional().or(z.literal(undefined)),
  merchant_name_pattern: z.string().optional(),
  description_pattern: z.string().optional(),
});

type RuleFormSchema = z.infer<typeof ruleSchema>;

interface InvestmentRuleFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: Partial<internal_domain_investment_GoalInvestment>;
  isEdit?: boolean;
  ruleId?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SipFields({ control }: { control: Control<any> }) {
  const autoInvest = useWatch({ control, name: 'auto_invest' });

  return (
    <>
      <FormCheckbox
        control={control}
        name="auto_invest"
        label="Auto-invest (automatically match transactions)"
      />
      {autoInvest && (
        <FormInput
          control={control}
          name="investment_day"
          label="SIP Day (1–31)"
          type="number"
          min="1"
          max="31"
          placeholder="Day of month for SIP"
        />
      )}
      <FormInput
        control={control}
        name="merchant_name_pattern"
        label="Merchant Name Pattern"
        placeholder="e.g. HDFC MUTUAL (for auto-matching)"
      />
      <FormInput
        control={control}
        name="description_pattern"
        label="Description Pattern"
        placeholder="e.g. MF INVESTMENT (for auto-matching)"
      />
    </>
  );
}

export function InvestmentRuleForm({
  onSuccess,
  onCancel,
  initialValues,
  isEdit = false,
  ruleId,
}: InvestmentRuleFormProps) {
  const createRule = useCreateInvestmentRule();
  const updateRule = useUpdateInvestmentRule();
  const { data: accounts } = useAccounts();
  const { data: goals } = useInvestmentGoals();

  const accountOptions: FormOption[] = useMemo(
    () =>
      (accounts ?? []).map((a) => ({
        value: a.id ?? '',
        label: a.account_name ?? a.id ?? '',
      })),
    [accounts]
  );

  const goalOptions: FormOption[] = useMemo(
    () => [
      { value: '__none__', label: 'No goal (standalone rule)' },
      ...(goals ?? []).map((g) => ({
        value: g.id ?? '',
        label: g.name ?? g.id ?? '',
      })),
    ],
    [goals]
  );

  const defaultValues = useMemo(
    () => ({
      investment_type: initialValues?.investment_type ?? '',
      contribution_type: initialValues?.contribution_type ?? '',
      contribution_value: initialValues?.contribution_value ?? undefined,
      account_id: initialValues?.account_id ?? '',
      goal_id: initialValues?.goal_id ?? '__none__',
      auto_invest: initialValues?.auto_invest ?? false,
      investment_day: initialValues?.investment_day ?? undefined,
      merchant_name_pattern: initialValues?.merchant_name_pattern ?? '',
      description_pattern: initialValues?.description_pattern ?? '',
    }),
    [initialValues]
  );

  const handleSubmit = async (data: RuleFormSchema) => {
    try {
      if (isEdit && ruleId) {
        await updateRule.mutateAsync({
          id: ruleId,
          data: {
            id: ruleId,
            investment_type: data.investment_type as CreateReq.investment_type,
            contribution_type: data.contribution_type as CreateReq.contribution_type,
            contribution_value: data.contribution_value,
            auto_invest: data.auto_invest,
            investment_day: data.investment_day,
            merchant_name_pattern: data.merchant_name_pattern || undefined,
            description_pattern: data.description_pattern || undefined,
          },
        });
      } else {
        const payload: internal_domain_investment_CreateGoalInvestmentReq = {
          investment_type: data.investment_type as CreateReq.investment_type,
          contribution_type: data.contribution_type as CreateReq.contribution_type,
          contribution_value: data.contribution_value,
          account_id: data.account_id,
          goal_id: data.goal_id && data.goal_id !== '__none__' ? data.goal_id : undefined,
          auto_invest: data.auto_invest,
          investment_day: data.investment_day,
          merchant_name_pattern: data.merchant_name_pattern || undefined,
          description_pattern: data.description_pattern || undefined,
        };
        await createRule.mutateAsync(payload);
      }
      onSuccess?.();
    } catch {
      // handled by mutation hook
    }
  };

  const isSubmitting = createRule.isPending || updateRule.isPending;

  return (
    <Form
      key={JSON.stringify(defaultValues)}
      schema={ruleSchema}
      defaultValues={defaultValues as unknown as Partial<RuleFormSchema>}
      onSubmit={handleSubmit}
      showToastOnSuccess={false}
      showToastOnError={false}
    >
      {({ form, isSubmitting: formIsSubmitting }) => {
        const contributionType = form.watch('contribution_type');
        const isSip = contributionType === CreateReq.contribution_type.SIP;

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                control={form.control}
                name="investment_type"
                label="Investment Type"
                options={INVESTMENT_TYPE_OPTIONS}
                placeholder="Select type"
                required
              />
              <FormSelect
                control={form.control}
                name="contribution_type"
                label="Contribution Type"
                options={CONTRIBUTION_TYPE_OPTIONS}
                placeholder="Select contribution"
                required
              />
            </div>
            <FormInput
              control={form.control}
              name="contribution_value"
              label="Amount (₹)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Enter amount"
              required
            />
            <FormSelect
              control={form.control}
              name="account_id"
              label="Account"
              options={accountOptions}
              placeholder="Select account"
              required
            />
            <FormSelect
              control={form.control}
              name="goal_id"
              label="Link to Goal (optional)"
              options={goalOptions}
              placeholder="Select goal"
            />
            {isSip && <SipFields control={form.control} />}
            <div className="flex justify-end gap-2 pt-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting || formIsSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting || formIsSubmitting}>
                {isSubmitting || formIsSubmitting
                  ? isEdit
                    ? 'Updating...'
                    : 'Creating...'
                  : isEdit
                    ? 'Update Rule'
                    : 'Create Rule'}
              </Button>
            </div>
          </div>
        );
      }}
    </Form>
  );
}
