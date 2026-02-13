export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  // Minimal layout - no sidebar, no dashboard padding
  // Still inherits root layout providers (Clerk, React Query) which are needed for API calls
  return <>{children}</>;
}
