export class BackendError extends Error {
    constructor(public code: string, message: string, public retryable = false) {
        super(message);
        this.name = "BackendError";
    }
}
export function backendError(value: unknown): BackendError {
    if (value instanceof BackendError)
        return value;
    const error = value && typeof value === "object" ? value as Record<string, unknown> : {};
    const code = typeof error.code === "string" ? error.code : "NETWORK_ERROR";
    const detail = typeof error.message === "string" ? error.message : "";
    if (code === "40001")
        return new BackendError("VERSION_CONFLICT", "Dữ liệu đã thay đổi. Vui lòng tải lại và kiểm tra trước khi lưu.");
    if (code === "42501")
        return new BackendError("ADMIN_REQUIRED", "Tài khoản không có quyền quản trị cửa hàng.");
    if (detail === "PRODUCT_UNAVAILABLE" || detail === "PRODUCT_HAS_OPEN_RENTAL")
        return new BackendError(detail, "Sản phẩm đang có lịch đặt hoặc đang thuê. Vui lòng kiểm tra lại.");
    if (code === "P0002")
        return new BackendError("NOT_FOUND", "Không tìm thấy sản phẩm hoặc đơn thuê.");
    if (code === "23505")
        return new BackendError("CONFLICT", "Sản phẩm hoặc yêu cầu đã tồn tại. Vui lòng kiểm tra lại.");
    if (code === "22023" || code === "23514" || code === "22P02")
        return new BackendError("INVALID_INPUT", "Thông tin chưa hợp lệ. Vui lòng kiểm tra ngày, giá và hình ảnh.");
    if (code === "55000")
        return new BackendError("INVALID_STATE", "Trạng thái đã thay đổi hoặc đơn đã hoàn tất. Vui lòng tải lại.");
    if (code === "invalid_credentials")
        return new BackendError("INVALID_CREDENTIALS", "Email hoặc mật khẩu không đúng.");
    return new BackendError("BACKEND_UNAVAILABLE", "Không thể kết nối cửa hàng. Vui lòng thử lại.", true);
}
export function userMessage(error: unknown): string {
    if (error instanceof BackendError && error.code === "CONFIGURATION")
        return "Kết nối cửa hàng chưa được cấu hình. Vui lòng liên hệ quản trị.";
    return error instanceof BackendError ? error.message : "Không thể đồng bộ dữ liệu. Vui lòng thử lại.";
}
