"use client";

interface VietQRCodeProps {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  amount?: number;
  description?: string;
  size?: "compact" | "compact2" | "qr_only";
  className?: string;
}

/**
 * VietQRCode – Render VietQR image from img.vietqr.io
 *
 * Example URL:
 * https://img.vietqr.io/image/vietinbank-113366668888-compact2.jpg?amount=50000&addInfo=nap+tien&accountName=NGUYEN+VAN+A
 */
export default function VietQRCode({
  bankCode,
  accountNumber,
  accountName,
  amount,
  description,
  size = "compact2",
  className = "",
}: VietQRCodeProps) {
  const params = new URLSearchParams();
  if (amount && amount > 0) params.set("amount", amount.toString());
  if (description) params.set("addInfo", description);
  if (accountName) params.set("accountName", accountName);

  const query = params.toString();
  const src = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-${size}.jpg${query ? `?${query}` : ""}`;

  return (
    <img
      src={src}
      alt={`QR chuyển khoản ${bankCode.toUpperCase()} - ${accountNumber}`}
      className={`max-w-full object-contain ${className}`}
      style={{ imageRendering: "crisp-edges" }}
      onError={(e) => {
        // Fallback: show error state
        const target = e.currentTarget;
        target.style.display = "none";
        const parent = target.parentElement;
        if (parent && !parent.querySelector(".vietqr-error")) {
          const err = document.createElement("div");
          err.className =
            "vietqr-error flex flex-col items-center justify-center p-6 text-gray-500 text-sm text-center";
          err.innerHTML = `<span class="text-3xl mb-2">⚠️</span><span>Không thể tải mã QR.<br/>Vui lòng kiểm tra thông tin ngân hàng.</span>`;
          parent.appendChild(err);
        }
      }}
    />
  );
}
