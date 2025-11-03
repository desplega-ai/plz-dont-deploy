"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Transaction {
  id: string;
  amount: number;
  type: string;
  date: string;
  description: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  category?: {
    name: string;
    color: string;
  };
}

interface TransactionMapProps {
  transactions: Transaction[];
  centerLocation?: { lat: number; lng: number } | null;
}

// Custom component to add heatmap layer
function HeatmapLayer({ transactions }: TransactionMapProps) {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!transactions.length) return;

    // Remove existing heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // Prepare heatmap data: [lat, lng, intensity]
    const heatData = transactions
      .filter((t) => t.latitude && t.longitude && t.type === "DEBIT")
      .map((t) => {
        // Use amount as intensity (normalized)
        const intensity = Math.min(Math.abs(t.amount) / 100, 1);
        return [t.latitude!, t.longitude!, intensity];
      });

    if (heatData.length === 0) return;

    // Create heatmap layer
    heatLayerRef.current = (L as any).heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: "#52c41a",
        0.2: "#faad14",
        0.4: "#ff7a45",
        0.6: "#ff4d4f",
        0.8: "#cf1322",
        1.0: "#a8071a",
      },
    }).addTo(map);

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [transactions, map]);

  return null;
}

// Component to fit all markers in view
function FitBoundsToMarkers({ transactions }: TransactionMapProps) {
  const map = useMap();

  useEffect(() => {
    if (!transactions.length) return;

    // Get all valid coordinates
    const coordinates = transactions
      .filter((t) => t.latitude && t.longitude)
      .map((t) => [t.latitude!, t.longitude!] as [number, number]);

    if (coordinates.length === 0) return;

    // If only one transaction, center on it with reasonable zoom
    if (coordinates.length === 1) {
      map.setView(coordinates[0], 15);
      return;
    }

    // Create bounds from all coordinates
    const bounds = L.latLngBounds(coordinates);

    // Fit the map to show all markers with some padding
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [transactions, map]);

  return null;
}

// Component to handle centering on searched location
function CenterOnLocation({ centerLocation }: { centerLocation?: { lat: number; lng: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (centerLocation) {
      map.setView([centerLocation.lat, centerLocation.lng], 13, {
        animate: true,
        duration: 1,
      });
    }
  }, [centerLocation, map]);

  return null;
}

// Button component to fit view
function FitViewButton({ transactions }: TransactionMapProps) {
  const map = useMap();

  const handleFitView = () => {
    const coordinates = transactions
      .filter((t) => t.latitude && t.longitude)
      .map((t) => [t.latitude!, t.longitude!] as [number, number]);

    if (coordinates.length === 0) return;

    if (coordinates.length === 1) {
      map.setView(coordinates[0], 15);
      return;
    }

    const bounds = L.latLngBounds(coordinates);
    map.fitBounds(bounds, { padding: [50, 50] });
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 1000,
      }}
    >
      <button
        onClick={handleFitView}
        style={{
          backgroundColor: "white",
          border: "2px solid rgba(0,0,0,0.2)",
          borderRadius: "4px",
          padding: "8px 12px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
        title="Fit all transactions in view"
      >
        Fit View
      </button>
    </div>
  );
}

export default function TransactionMap({ transactions, centerLocation }: TransactionMapProps) {
  if (!transactions.length) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center bg-muted rounded-lg">
        <p className="text-muted-foreground">No transactions with location data to display</p>
      </div>
    );
  }

  // Calculate center from all transactions
  const avgLat =
    transactions.reduce((sum, t) => sum + (t.latitude || 0), 0) / transactions.length;
  const avgLng =
    transactions.reduce((sum, t) => sum + (t.longitude || 0), 0) / transactions.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden border relative">
      <MapContainer
        center={[avgLat, avgLng]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBoundsToMarkers transactions={transactions} />
        <CenterOnLocation centerLocation={centerLocation} />
        <FitViewButton transactions={transactions} />
        <HeatmapLayer transactions={transactions} />

        {transactions.map((transaction) => {
          if (!transaction.latitude || !transaction.longitude) return null;

          // Create custom icon based on transaction type
          const transactionLabel = `${transaction.description} - ${formatCurrency(transaction.amount)} (${formatDate(transaction.date)})`;
          const icon = L.divIcon({
            className: "custom-marker",
            html: `
              <div
                role="button"
                tabindex="0"
                aria-label="Transaction: ${transactionLabel.replace(/"/g, '&quot;')}"
                data-transaction-id="${transaction.id}"
                style="
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background-color: ${transaction.type === "CREDIT" ? "#52c41a" : "#ff4d4f"};
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 12px;
                  font-weight: bold;
                  cursor: pointer;
              ">
                ${transaction.type === "CREDIT" ? "+" : "-"}
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          return (
            <Marker
              key={transaction.id}
              position={[transaction.latitude, transaction.longitude]}
              icon={icon}
              title={transactionLabel}
              alt={`Transaction marker for ${transaction.description}`}
              eventHandlers={{
                click: (e) => {
                  // Zoom in to the clicked marker
                  e.target._map.setView(
                    [transaction.latitude!, transaction.longitude!],
                    16,
                    { animate: true }
                  );
                },
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="font-semibold text-base mb-1">
                    {transaction.description}
                  </div>
                  {transaction.locationName && (
                    <div className="text-sm text-gray-600 mb-2">
                      📍 {transaction.locationName}
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Amount:</span>
                    <span
                      className={`text-sm font-bold ${
                        transaction.type === "CREDIT" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.type === "CREDIT" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                  {transaction.category && (
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Category:</span>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: transaction.category.color }}
                        />
                        <span className="text-sm">{transaction.category.name}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Date:</span>
                    <span className="text-sm">{formatDate(transaction.date)}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
