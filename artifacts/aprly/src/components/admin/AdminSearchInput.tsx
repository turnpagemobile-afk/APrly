import { adminContent } from "@/content/admin";
import { adminAsset } from "@/lib/admin-assets";
import { cn } from "@/lib/utils";

type AdminSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
};

export function AdminSearchInput({
  value,
  onChange,
  placeholder = "Search",
  "aria-label": ariaLabel,
  className,
}: AdminSearchInputProps) {
  const hasClear = value.length > 0;

  return (
    <div className={cn("admin-search-input-wrap", className)}>
      <img
        src={adminAsset("users/search.svg")}
        alt=""
        className="admin-search-input-icon"
        aria-hidden="true"
      />
      <input
        type="text"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className={cn("admin-search-input", hasClear && "admin-search-input--has-clear")}
      />
      {hasClear ? (
        <button
          type="button"
          className="admin-search-clear-btn"
          onClick={() => onChange("")}
          aria-label={adminContent.users.clearSearchAria}
        >
          <img
            src={adminAsset("users/search-clear.svg")}
            alt=""
            className="h-[18px] w-[18px]"
            aria-hidden="true"
          />
        </button>
      ) : null}
    </div>
  );
}
