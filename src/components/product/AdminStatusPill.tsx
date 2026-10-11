import StatusPill, { type StatusPillProps } from "./StatusPill"
export default function AdminStatusPill(
  props: Omit<StatusPillProps, "audience">,
) {
  return <StatusPill {...props} audience="admin" />
}
