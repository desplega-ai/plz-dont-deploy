import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // Using Nominatim (OpenStreetMap) API for geocoding
    // Nominatim requires a User-Agent header per their usage policy
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          'User-Agent': 'FinanceTrackerApp/1.0 (testing platform)',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const results = await response.json();

    return NextResponse.json(results);
  } catch (error) {
    console.error("Location search error:", error);
    return NextResponse.json(
      { error: "Failed to search location" },
      { status: 500 }
    );
  }
}
