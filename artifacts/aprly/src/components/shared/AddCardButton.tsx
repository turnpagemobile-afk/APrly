import { cloneElement, type ButtonHTMLAttributes, type ReactElement } from "react";
import { Loader2 } from "lucide-react";
import { PillButton } from "@/components/shared/PillButton";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { cabinetAsset } from "@/lib/cabinet-assets";
import { cn } from "@/lib/utils";

type AddCardButtonBaseProps = {
  loading?: boolean;
  className?: string;
  label?: string;
};

type AddCardButtonAsButtonProps = AddCardButtonBaseProps & {
  asChild?: false;
} & ButtonHTMLAttributes<HTMLButtonElement>;

type AddCardButtonAsChildProps = AddCardButtonBaseProps & {
  asChild: true;
  children: ReactElement;
};

export type AddCardButtonProps = AddCardButtonAsButtonProps | AddCardButtonAsChildProps;

function AddCardButtonContent({ loading, label }: { loading?: boolean; label: string }) {
  return (
    <>
      {loading ? (
        <Loader2 className="h-6 w-6 shrink-0 animate-spin" aria-hidden="true" />
      ) : (
        <img
          src={cabinetAsset("cabinet/dashboard/plus.svg")}
          alt=""
          aria-hidden
          className="h-6 w-6 shrink-0"
        />
      )}
      {label}
    </>
  );
}

export function AddCardButton(props: AddCardButtonProps) {
  const { loading = false, className, label = planLeadDetailContent.addCard } = props;

  if (props.asChild) {
    return (
      <PillButton
        variant="secondary"
        size="lg"
        asChild
        className={cn("gap-2", className)}
      >
        {cloneElement(props.children, undefined, (
          <AddCardButtonContent loading={loading} label={label} />
        ))}
      </PillButton>
    );
  }

  const { asChild: _asChild, ...buttonProps } = props;

  return (
    <PillButton
      variant="secondary"
      size="lg"
      className={cn("gap-2", className)}
      {...buttonProps}
    >
      <AddCardButtonContent loading={loading} label={label} />
    </PillButton>
  );
}
