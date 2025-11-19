"use client";

import { QRCodeSVG } from "qrcode.react";

export default function QRCodeBox({ value }: { value: string }) {
  return (
    <div className="flex items-center justify-center p-4">
      <QRCodeSVG
        value={value}
        size={256}
        level="H"
        includeMargin={true}
      />
    </div>
  );
}
