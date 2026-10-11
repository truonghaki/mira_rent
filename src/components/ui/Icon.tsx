import { iconPaths, type IconName } from "./icon-paths"
export interface IconProps {
  name: IconName
  size?: number
  variant?: "customer" | "admin"
}
export default function Icon({
  name,
  size = 20,
  variant = "customer",
}: IconProps) {
  const path =
    name === "menu"
      ? iconPaths[variant === "customer" ? "customer-menu" : "admin-menu"]
      : iconPaths[name]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {path}
    </svg>
  )
}
