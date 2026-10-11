export function validateDemoCredentials(
  email: string,
  password: string,
): string | null {
  return !email.includes("@") || password.length < 4
    ? "Vui lòng nhập email hợp lệ và mật khẩu tối thiểu 4 ký tự."
    : null
}
