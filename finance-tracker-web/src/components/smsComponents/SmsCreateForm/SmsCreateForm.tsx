'use client';

import { Form, FormDatePicker, FormInput, FormTextarea } from '@/components/shared/form';
import { useCreateSms } from '@/components/shared/hooks/useSms';
import { Button } from '@/components/ui/button';
import type { internal_domain_sms_CreateSmsReq } from '@/generated/api';
import { startOfDay } from 'date-fns';
import * as z from 'zod';

const createSmsSchema = z.object({
  sender: z.string().optional(),
  raw_message: z.string().optional(),
  received_at: z.string().optional(),
});

interface SmsCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SmsCreateForm({ onSuccess, onCancel }: SmsCreateFormProps) {
  const createSms = useCreateSms();

  const handleSubmit = async (data: z.infer<typeof createSmsSchema>) => {
    try {
      const submitData: internal_domain_sms_CreateSmsReq = {
        sender: data.sender || undefined,
        raw_message: data.raw_message || undefined,
        received_at: data.received_at || undefined,
      };
      await createSms.mutateAsync(submitData);
      onSuccess?.();
    } catch (error) {
      // Error handling is done by the mutation hook
    }
  };

  const getTodayDateString = () => {
    const today = startOfDay(new Date());
    return today.toISOString();
  };

  const defaultValues: Partial<internal_domain_sms_CreateSmsReq> = {
    sender: '',
    raw_message: '',
    received_at: getTodayDateString(),
  };

  return (
    <Form
      schema={createSmsSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      showToastOnSuccess={false}
      showToastOnError={false}
    >
      {({ form, isSubmitting }) => (
        <div className="space-y-4">
          <FormInput
            control={form.control}
            name="sender"
            label="Sender"
            placeholder="Enter sender phone number or name"
          />
          <FormTextarea
            control={form.control}
            name="raw_message"
            label="Raw Message"
            placeholder="Enter the SMS message content"
          />
          <FormDatePicker
            control={form.control}
            name="received_at"
            label="Received At"
            placeholder="Select when the SMS was received"
          />
          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || createSms.isPending}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || createSms.isPending}>
              {isSubmitting || createSms.isPending ? 'Creating...' : 'Create SMS Log'}
            </Button>
          </div>
        </div>
      )}
    </Form>
  );
}
