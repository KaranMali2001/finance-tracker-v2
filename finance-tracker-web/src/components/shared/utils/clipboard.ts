import { toast } from '../feedback/Toast';

/**
 * Copies text to clipboard and shows toast notification
 * @param text - The text to copy to clipboard
 * @param successMessage - Optional custom success message
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function copyToClipboard(text: string, successMessage?: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage || 'Copied to clipboard');
    return true;
  } catch (error) {
    toast.error('Failed to copy to clipboard');
    return false;
  }
}
