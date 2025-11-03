"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

interface SingleTransactionMapProps {
  latitude: number;
  longitude: number;
  description: string;
  amount: number;
  type: string;
  locationName?: string;
}

// Component to update map center when coordinates change
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);

  return null;
}

export default function SingleTransactionMap({
  latitude,
  longitude,
  description,
  amount,
  type,
  locationName,
}: SingleTransactionMapProps) {
  const center: [number, number] = [latitude, longitude];

  // Create custom icon based on transaction type
  const icon = L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: ${type === "CREDIT" ? "#52c41a" : "#ff4d4f"};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
        font-weight: bold;
      ">
        ${type === "CREDIT" ? "+" : "-"}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));
  };

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100%", width: "100%"}}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />
        <Marker position={center} icon={icon}>
          <Popup>
            <div className="min-w-[150px]">
              <div className="font-semibold text-base mb-1">{description}</div>
              {locationName && (
                <div className="text-sm text-gray-600 mb-2">
                  📍 {locationName}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Amount:</span>
                <span
                  className={`text-sm font-bold ${
                    type === "CREDIT" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {type === "CREDIT" ? "+" : "-"}
                  {formatCurrency(amount)}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
