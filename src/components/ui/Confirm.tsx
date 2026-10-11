import AButton from "@/components/ui/AdminButton"
import AIcon from "@/components/ui/AdminIcon"

export default function Confirm({
  title,
  copy,
  confirm,
  destructive,
  onClose,
  onConfirm,
}: {
  title: string
  copy: string
  confirm: string
  destructive?: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <div className="overlay admin-modal-overlay" onClick={onClose}>
      <section
        className="admin-modal confirm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <p>XÁC NHẬN</p>
            <h2>{title}</h2>
          </div>
          <AButton className="icon-button" aria-label="Đóng" onClick={onClose}>
            <AIcon name="close" />
          </AButton>
        </div>
        <p>{copy}</p>
        <div className="modal-actions">
          <AButton className="button-outline" onClick={onClose}>
            Quay lại
          </AButton>
          <AButton
            className={destructive ? "danger-button" : "primary"}
            onClick={onConfirm}
          >
            {confirm}
          </AButton>
        </div>
      </section>
    </div>
  )
}
