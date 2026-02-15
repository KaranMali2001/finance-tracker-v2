'use client';

import { Form, FormDatePicker, FormInput, FormOption, FormSelect } from '@/components/shared/form';
import {
  useCreateInvestmentGoal,
  useUpdateInvestmentGoal,
} from '@/components/shared/hooks/useInvestment';
import { Button } from '@/components/ui/button';
import type {
  internal_domain_investment_CreateGoalReq,
  internal_domain_investment_Goal,
  internal_domain_investment_UpdateGoals,
} from '@/generated/api';
import { format } from 'date-fns';
import { useMemo } from 'react';
import * as z from 'zod';

// Status Options
const STATUS_OPTIONS: FormOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
];

// Priority Options (1-5, where 1 is highest priority)
const PRIORITY_OPTIONS: FormOption[] = [
  { value: '1', label: '1 - Highest' },
  { value: '2', label: '2 - High' },
  { value: '3', label: '3 - Medium' },
  { value: '4', label: '4 - Low' },
  { value: '5', label: '5 - Lowest' },
];

const createGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  target_amount: z
    .number({ message: 'Target amount is required' })
    .positive('Target amount must be greater than 0')
    .min(0.01, 'Target amount must be at least 0.01'),
  target_date: z.string().min(1, 'Target date is required'),
  current_amount: z
    .number({ message: 'Current amount must be a number' })
    .min(0, 'Current amount cannot be negative')
    .optional(),
  status: z.string().optional(),
  priority: z.preprocess((val) => {
    if (val === undefined || val === '' || val === null) {
      return undefined;
    }
    if (typeof val === 'string') {
      const num = parseInt(val, 10);
      return isNaN(num) ? undefined : num;
    }
    return val;
  }, z.number().min(1, 'Priority must be at least 1').max(5, 'Priority must be at most 5').optional()),
});

const updateGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').optional(),
  target_amount: z
    .number({ message: 'Target amount must be a number' })
    .positive('Target amount must be greater than 0')
    .min(0.01, 'Target amount must be at least 0.01')
    .optional(),
  target_date: z.string().min(1, 'Target date is required').optional(),
  current_amount: z
    .number({ message: 'Current amount must be a number' })
    .min(0, 'Current amount cannot be negative')
    .optional(),
  status: z.string().optional(),
  priority: z.preprocess((val) => {
    if (val === undefined || val === '' || val === null) {
      return undefined;
    }
    if (typeof val === 'string') {
      const num = parseInt(val, 10);
      return isNaN(num) ? undefined : num;
    }
    return val;
  }, z.number().min(1, 'Priority must be at least 1').max(5, 'Priority must be at most 5').optional()),
});

type CreateGoalFormSchema = z.infer<typeof createGoalSchema>;
type UpdateGoalFormSchema = z.infer<typeof updateGoalSchema>;

interface InvestmentGoalFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: Partial<internal_domain_investment_Goal>;
  isEdit?: boolean;
  goalId?: string;
}

export function InvestmentGoalForm({
  onSuccess,
  onCancel,
  initialValues,
  isEdit = false,
  goalId,
}: InvestmentGoalFormProps) {
  const createGoal = useCreateInvestmentGoal();
  const updateGoal = useUpdateInvestmentGoal();

  const schema = isEdit ? updateGoalSchema : createGoalSchema;

  const handleSubmit = async (data: CreateGoalFormSchema | UpdateGoalFormSchema) => {
    try {
      if (isEdit && goalId) {
        const updateData: internal_domain_investment_UpdateGoals = {
          id: goalId,
          name: data.name,
          target_amount: data.target_amount,
          target_date: data.target_date,
          current_amount: data.current_amount,
          status: data.status,
          priority: data.priority,
        };
        await updateGoal.mutateAsync({ id: goalId, data: updateData });
      } else {
        const createData: internal_domain_investment_CreateGoalReq = {
          name: data.name!,
          target_amount: data.target_amount!,
          target_date: data.target_date!,
          current_amount: data.current_amount,
          status: data.status,
          priority: data.priority,
        };
        await createGoal.mutateAsync(createData);
      }
      onSuccess?.();
    } catch (error) {
      // Error handling is done by the mutation hook
      console.error('Error submitting form:', error);
    }
  };

  // Transform initial values for form
  const defaultValues = useMemo(() => {
    if (!initialValues) {
      return {
        name: '',
        target_amount: undefined,
        target_date: '',
        current_amount: undefined,
        status: '',
        priority: undefined,
      };
    }

    // Format target_date from ISO string to YYYY-MM-DD format for date input
    let formattedTargetDate = '';
    if (initialValues.target_date) {
      try {
        const date = new Date(initialValues.target_date);
        formattedTargetDate = format(date, 'yyyy-MM-dd');
      } catch (e) {
        formattedTargetDate = '';
      }
    }

    return {
      name: initialValues.name || '',
      target_amount: initialValues.target_amount,
      target_date: formattedTargetDate,
      current_amount: initialValues.current_amount,
      status: initialValues.status || '',
      priority:
        initialValues.priority !== undefined && initialValues.priority !== null
          ? initialValues.priority
          : undefined,
    };
  }, [initialValues]);

  const isSubmitting = createGoal.isPending || updateGoal.isPending;

  return (
    <Form
      key={JSON.stringify(defaultValues)}
      schema={schema}
      defaultValues={defaultValues as unknown as Partial<z.infer<typeof schema>>}
      onSubmit={handleSubmit}
      showToastOnSuccess={false}
      showToastOnError={false}
    >
      {({ form, isSubmitting: formIsSubmitting }) => (
        <div className="space-y-4">
          <FormInput
            control={form.control}
            name="name"
            label="Goal Name"
            required={!isEdit}
            placeholder="Enter goal name"
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              control={form.control}
              name="target_amount"
              label="Target Amount"
              required={!isEdit}
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Enter target amount"
            />
            <FormInput
              control={form.control}
              name="current_amount"
              label="Current Amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter current amount"
            />
          </div>
          <FormDatePicker
            control={form.control}
            name="target_date"
            label="Target Date"
            required={!isEdit}
            placeholder="Select target date"
            allowFutureDates={true}
          />
          <FormSelect
            control={form.control}
            name="status"
            label="Status"
            options={STATUS_OPTIONS}
            placeholder="Select status (optional)"
          />
          <FormSelect
            control={form.control}
            name="priority"
            label="Priority"
            options={PRIORITY_OPTIONS}
            placeholder="Select priority (optional)"
          />
          <div className="flex justify-end gap-2">
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
                  ? 'Update Goal'
                  : 'Create Goal'}
            </Button>
          </div>
        </div>
      )}
    </Form>
  );
}
