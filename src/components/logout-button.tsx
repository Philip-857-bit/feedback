import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="outline" size="sm">
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </form>
  );
}
