declare module "react-native-get-sms-android" {
  interface SmsFilter {
    box?: "inbox" | "sent" | "draft" | "outbox" | "failed" | "queued";
    minDate?: number;
    maxDate?: number;
    bodyRegex?: string;
    address?: string;
    maxCount?: number;
    indexFrom?: number;
    read?: 0 | 1;
    _id?: string;
    thread_id?: string;
  }

  const SmsAndroid: {
    list(
      filter: string,
      fail: (error: string) => void,
      success: (count: number, smsList: string) => void
    ): void;
    delete(
      id: string,
      fail: (error: string) => void,
      success: (isDeleted: boolean) => void
    ): void;
  };

  export default SmsAndroid;
}
