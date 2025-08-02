import { LogoutButton } from "@/components/logout-button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="absolute top-4 right-4">
        <LogoutButton />
      </div>
      {children}
    </div>
  );
}
