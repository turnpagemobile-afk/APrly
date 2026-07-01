import { Link } from "wouter";
import { adminContent } from "@/content/admin";
import { adminAsset } from "@/lib/admin-assets";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AdminPartnerRowMenuProps = {
  partnerId: number;
  isActive: boolean;
  onDeactivate: () => void;
  onActivate: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

export function AdminPartnerRowMenu({
  partnerId,
  isActive,
  onDeactivate,
  onActivate,
  onDelete,
  disabled,
}: AdminPartnerRowMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="admin-partner-row-menu-trigger"
          aria-label="Partner actions"
          disabled={disabled}
        >
          <img src={adminAsset("partners/menu-dots.svg")} alt="" className="h-6 w-6" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="admin-partner-row-menu-content rounded-[6px] border-0 p-2 shadow-md">
        <DropdownMenuItem asChild className="rounded-none p-0 focus:bg-transparent">
          <Link href={`/admin/partners/${partnerId}`} className="admin-partner-row-menu-item app-button-button-l-m text-action">
            <img src={adminAsset("partners/menu-view.svg")} alt="" className="h-6 w-6 shrink-0" aria-hidden="true" />
            {adminContent.partners.menuView}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="admin-partner-row-menu-item app-button-button-l-m rounded-none p-0 text-action focus:bg-transparent"
          onClick={isActive ? onDeactivate : onActivate}
          disabled={disabled}
        >
          <img src={adminAsset("partners/menu-close.svg")} alt="" className="h-6 w-6 shrink-0" aria-hidden="true" />
          {isActive ? adminContent.partners.menuDeactivate : adminContent.partners.menuActivate}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            "admin-partner-row-menu-item admin-partner-row-menu-item--danger app-button-button-l-m rounded-none p-0 focus:bg-transparent",
          )}
          onClick={onDelete}
          disabled={disabled}
        >
          <img src={adminAsset("partners/menu-trash.svg")} alt="" className="h-6 w-6 shrink-0" aria-hidden="true" />
          {adminContent.partners.menuDelete}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
