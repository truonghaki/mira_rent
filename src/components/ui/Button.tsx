import type { ButtonHTMLAttributes } from "react"
import Icon from "./Icon"
import type { IconName } from "./icon-paths"
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: IconName
  variant?: "customer" | "admin"
}
export default function Button({
  children,
  className = "",
  icon,
  variant = "customer",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={`button ${className}`} {...props}>
      {icon && <Icon name={icon} variant={variant} />}
      {children}
    </button>
  )
}
