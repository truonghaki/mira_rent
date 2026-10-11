import { go } from "@/app/router/navigation"
import Brand from "@/components/common/customer/Brand"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"

export default function Header({ onSearch }: { onSearch: () => void }) {
  return (
    <header className="public-header">
      <Brand />
      <div className="header-actions">
        <Button
          className="icon-button"
          aria-label="Tìm kiếm"
          onClick={onSearch}
        >
          <Icon name="search" />
        </Button>
        <Button
          className="icon-button"
          aria-label="Bộ sưu tập"
          onClick={() => go("collection")}
        >
          <Icon name="menu" />
        </Button>
      </div>
    </header>
  )
}
