import Icon, { type IconProps } from "./Icon"
export default function AdminIcon(props: Omit<IconProps, "variant">) {
  return <Icon {...props} variant="admin" />
}
