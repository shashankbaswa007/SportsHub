export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}