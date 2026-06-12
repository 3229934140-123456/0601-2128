import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  includeMargin?: boolean;
}

export const QRCodeDisplay = ({ value, size = 200, includeMargin = true }: QRCodeDisplayProps) => {
  return (
    <div className="inline-block p-4 bg-white rounded-xl shadow-lg">
      <QRCodeCanvas
        value={value}
        size={size}
        level="H"
        includeMargin={includeMargin}
        bgColor="#ffffff"
        fgColor="#1a1a1a"
      />
    </div>
  );
};
