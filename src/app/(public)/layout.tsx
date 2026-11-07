// The site is a single page; the hero's "View my work" button and the contact section's
// "Back to top" link handle navigation, so there's no top bar.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex-1">{children}</main>;
}
