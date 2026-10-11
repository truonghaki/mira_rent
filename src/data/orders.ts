import { coverUrl } from "@/features/products/images"
import { suggestedPrice } from "@/features/rentals/pricing"
import type { Product } from "@/types/product"
import type { ProductSnapshot, RentalOrder, RentalStatus } from "@/types/rental"
import { calendarDays } from "@/utils/date"
import { initialProducts } from "./products"

const snapshot = (item: Product): ProductSnapshot => ({
  id: item.id,
  name: item.name,
  slug: item.slug,
  coverUrl: coverUrl(item),
  category: item.category,
})

const order = (
  id: string,
  item: Product,
  status: RentalStatus,
  customerName: string,
  start: string,
  end: string,
  revenue = 0,
  completedAt: string | null = null,
): RentalOrder => {
  const rentalDays = calendarDays(start, end)
  const price = suggestedPrice(item, rentalDays)
  return {
    id,
    productId: item.id,
    productSnapshot: snapshot(item),
    customerName,
    customerPhone: "0912 435 886",
    rentalStartDate: start,
    expectedReturnDate: end,
    actualReturnDate: completedAt ? end : null,
    rentalDays,
    firstDayPriceSnapshot: item.firstDayPrice,
    additionalDayPriceSnapshot: item.additionalDayPrice,
    suggestedPrice: price,
    depositAmount: 500000,
    additionalCharges: 0,
    discount: 0,
    actualRevenue: revenue,
    status,
    notes: "",
    createdAt: `${start}T08:00:00.000Z`,
    completedAt,
  }
}

export const initialOrders: RentalOrder[] = [
  order(
    "MIRA-260318-01",
    initialProducts[1],
    "reserved",
    "Trần Ngọc Mai",
    "2026-03-22",
    "2026-03-24",
  ),
  order(
    "MIRA-260316-02",
    initialProducts[2],
    "active",
    "Nguyễn Minh Anh",
    "2026-03-16",
    "2026-03-19",
  ),
  order(
    "MIRA-260317-03",
    initialProducts[5],
    "reserved",
    "Phạm Hà My",
    "2026-03-25",
    "2026-03-27",
  ),
  order(
    "MIRA-260317-04",
    initialProducts[6],
    "active",
    "Lê Thu Trang",
    "2026-03-17",
    "2026-03-20",
  ),
  order(
    "MIRA-260312-05",
    initialProducts[0],
    "completed",
    "Đỗ Bảo Ngọc",
    "2026-03-12",
    "2026-03-14",
    229000,
    "2026-03-14T17:30:00.000Z",
  ),
  order(
    "MIRA-260305-06",
    initialProducts[3],
    "completed",
    "Vũ Minh Châu",
    "2026-03-05",
    "2026-03-06",
    209000,
    "2026-03-06T18:00:00.000Z",
  ),
  order(
    "MIRA-260214-07",
    initialProducts[4],
    "completed",
    "Hoàng Khánh Linh",
    "2026-02-12",
    "2026-02-14",
    329000,
    "2026-02-14T16:20:00.000Z",
  ),
  order(
    "MIRA-260118-08",
    initialProducts[7],
    "completed",
    "Nguyễn Thùy Dương",
    "2026-01-16",
    "2026-01-18",
    259000,
    "2026-01-18T19:00:00.000Z",
  ),
]
