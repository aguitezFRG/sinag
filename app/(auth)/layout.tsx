export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The children (login/register pages) now have their own full layout
  return children;
}
