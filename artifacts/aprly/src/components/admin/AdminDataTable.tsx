import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

function AdminDataTableRoot({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("admin-table-shell", className)}>{children}</div>;
}

function AdminDataTableScroll({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>;
}

function AdminDataTableTable({ children }: { children: ReactNode }) {
  return <table className="admin-table">{children}</table>;
}

function AdminDataTableHeader({ children }: { children: ReactNode }) {
  return (
    <thead className="admin-table-head">
      <tr>{children}</tr>
    </thead>
  );
}

function AdminDataTableHeadCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <th className={className}>{children}</th>;
}

function AdminDataTableBody({ children }: { children: ReactNode }) {
  return <tbody className="admin-table-body">{children}</tbody>;
}

function AdminDataTableRow({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <tr className={cn("admin-table-row", className)} onClick={onClick}>
      {children}
    </tr>
  );
}

function AdminDataTableCell({
  children,
  bold,
  className,
  colSpan,
}: {
  children: ReactNode;
  bold?: boolean;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td className={cn(bold && "admin-table-cell-bold", className)} colSpan={colSpan}>
      {children}
    </td>
  );
}

function AdminDataTableFooter({ children }: { children: ReactNode }) {
  return <div className="admin-table-footer">{children}</div>;
}

export const AdminDataTable = Object.assign(AdminDataTableRoot, {
  Scroll: AdminDataTableScroll,
  Table: AdminDataTableTable,
  Header: AdminDataTableHeader,
  HeadCell: AdminDataTableHeadCell,
  Body: AdminDataTableBody,
  Row: AdminDataTableRow,
  Cell: AdminDataTableCell,
  Footer: AdminDataTableFooter,
});
