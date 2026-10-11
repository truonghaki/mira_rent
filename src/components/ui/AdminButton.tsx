import Button, { type ButtonProps } from "./Button"
export default function AdminButton(props: Omit<ButtonProps, "variant">) {
  return <Button {...props} variant="admin" />
}
