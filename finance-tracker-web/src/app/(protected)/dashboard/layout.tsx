export default async function Layout({ children }: { children: React.ReactNode }) {
  // Note: API client should be initialized per-request in each Server Component
  // Not here in the layout to avoid request conflicts

  return <div>{children}</div>;
}
