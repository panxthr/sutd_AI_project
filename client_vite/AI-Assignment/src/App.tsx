import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

import {
  StationDataProvider,
  useStationData,
  stationData as importedStationData,
} from "./stationDataProvider";

// Define TypeScript interfaces
interface Coordinates {
  lat: number;
  lng: number;
}

interface GeocodeInfo {
  ADDRESS: string;
  [key: string]: any;
}

interface RevGeocodeResponse {
  GeocodeInfo: GeocodeInfo[];
  [key: string]: any;
}

interface Station {
  station_name: string;
  type: string;
  lat: number;
  lng: number;
  distance?: number;
}

const loadScript = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });

// MRT/LRT station data
const stationData: Station[] = [
  { station_name: "Jurong East", type: "MRT", lat: 1.333207, lng: 103.742308 },
  { station_name: "Bukit Batok", type: "MRT", lat: 1.349069, lng: 103.749596 },
  { station_name: "Bukit Gombak", type: "MRT", lat: 1.359043, lng: 103.751863 },
  {
    station_name: "Choa Chu Kang",
    type: "MRT",
    lat: 1.385417,
    lng: 103.744316,
  },
  { station_name: "Yew Tee", type: "MRT", lat: 1.397383, lng: 103.747523 },
  { station_name: "Kranji", type: "MRT", lat: 1.425302, lng: 103.762049 },
  { station_name: "Marsiling", type: "MRT", lat: 1.432579, lng: 103.77415 },
  { station_name: "Woodlands", type: "MRT", lat: 1.436984, lng: 103.786406 },
  { station_name: "Admiralty", type: "MRT", lat: 1.436984, lng: 103.786406 },
  { station_name: "Sembawang", type: "MRT", lat: 1.449133, lng: 103.82006 },
  { station_name: "Yishun", type: "MRT", lat: 1.429666, lng: 103.835044 },
  { station_name: "Khatib", type: "MRT", lat: 1.417423, lng: 103.832995 },
  { station_name: "Yio Chu Kang", type: "MRT", lat: 1.381765, lng: 103.844923 },
  { station_name: "Ang Mo Kio", type: "MRT", lat: 1.370025, lng: 103.849588 },
  { station_name: "Bishan", type: "MRT", lat: 1.35092, lng: 103.848206 },
  { station_name: "Braddell", type: "MRT", lat: 1.34055, lng: 103.847098 },
  { station_name: "Toa Payoh", type: "MRT", lat: 1.332405, lng: 103.847436 },
  { station_name: "Novena", type: "MRT", lat: 1.320089, lng: 103.843405 },
  { station_name: "Newton", type: "MRT", lat: 1.31383, lng: 103.838021 },
  { station_name: "Orchard", type: "MRT", lat: 1.304041, lng: 103.831792 },
  { station_name: "Somerset", type: "MRT", lat: 1.300508, lng: 103.838428 },
  { station_name: "Dhoby Ghaut", type: "MRT", lat: 1.299169, lng: 103.845799 },
  { station_name: "City Hall", type: "MRT", lat: 1.293119, lng: 103.852089 },
  { station_name: "Raffles Place", type: "MRT", lat: 1.284001, lng: 103.85155 },
  { station_name: "Marina Bay", type: "MRT", lat: 1.276481, lng: 103.854598 },
  {
    station_name: "Marina South Pier",
    type: "MRT",
    lat: 1.271422,
    lng: 103.863581,
  },
  { station_name: "Tuas Link", type: "MRT", lat: 1.340371, lng: 103.636866 },
  {
    station_name: "Tuas West Road",
    type: "MRT",
    lat: 1.330075,
    lng: 103.639636,
  },
  {
    station_name: "Tuas Crescent",
    type: "MRT",
    lat: 1.321091,
    lng: 103.649075,
  },
  { station_name: "Gul Circle", type: "MRT", lat: 1.319809, lng: 103.66083 },
  { station_name: "Joo Koon", type: "MRT", lat: 1.327826, lng: 103.678318 },
  { station_name: "Pioneer", type: "MRT", lat: 1.337645, lng: 103.69742 },
  { station_name: "Boon Lay", type: "MRT", lat: 1.33862, lng: 103.705817 },
  { station_name: "Lakeside", type: "MRT", lat: 1.344264, lng: 103.720797 },
  {
    station_name: "Chinese Garden",
    type: "MRT",
    lat: 1.342436,
    lng: 103.732582,
  },
  { station_name: "Clementi", type: "MRT", lat: 1.314925, lng: 103.765341 },
  { station_name: "Dover", type: "MRT", lat: 1.311414, lng: 103.778596 },
  { station_name: "Buona Vista", type: "MRT", lat: 1.307337, lng: 103.790046 },
  { station_name: "Commonwealth", type: "MRT", lat: 1.302439, lng: 103.798326 },
  { station_name: "Queenstown", type: "MRT", lat: 1.294867, lng: 103.805902 },
  { station_name: "Redhill", type: "MRT", lat: 1.289674, lng: 103.816787 },
  { station_name: "Tiong Bahru", type: "MRT", lat: 1.286555, lng: 103.826956 },
  { station_name: "Outram Park", type: "MRT", lat: 1.280319, lng: 103.839459 },
  {
    station_name: "Tanjong Pagar",
    type: "MRT",
    lat: 1.276385,
    lng: 103.846771,
  },
  { station_name: "Bugis", type: "MRT", lat: 1.300747, lng: 103.855873 },
  { station_name: "Lavender", type: "MRT", lat: 1.307577, lng: 103.863155 },
  { station_name: "Kallang", type: "MRT", lat: 1.311532, lng: 103.871372 },
  { station_name: "Aljunied", type: "MRT", lat: 1.316474, lng: 103.882762 },
  { station_name: "Paya Lebar", type: "MRT", lat: 1.318214, lng: 103.893133 },
  { station_name: "Eunos", type: "MRT", lat: 1.319809, lng: 103.902888 },
  { station_name: "Kembangan", type: "MRT", lat: 1.320998, lng: 103.913433 },
  { station_name: "Bedok", type: "MRT", lat: 1.324043, lng: 103.930205 },
  { station_name: "Tanah Merah", type: "MRT", lat: 1.327309, lng: 103.946479 },
  { station_name: "Simei", type: "MRT", lat: 1.343237, lng: 103.953343 },
  { station_name: "Tampines", type: "MRT", lat: 1.354467, lng: 103.943325 },
  { station_name: "Pasir Ris", type: "MRT", lat: 1.373234, lng: 103.949343 },
  { station_name: "Expo", type: "MRT", lat: 1.334479, lng: 103.961459 },
  {
    station_name: "Changi Airport",
    type: "MRT",
    lat: 1.357622,
    lng: 103.988487,
  },
  { station_name: "HarbourFront", type: "MRT", lat: 1.265453, lng: 103.820514 },
  { station_name: "Chinatown", type: "MRT", lat: 1.284566, lng: 103.843626 },
  { station_name: "Clarke Quay", type: "MRT", lat: 1.288949, lng: 103.847521 },
  { station_name: "Little India", type: "MRT", lat: 1.306691, lng: 103.849396 },
  { station_name: "Farrer Park", type: "MRT", lat: 1.312679, lng: 103.854872 },
  { station_name: "Boon Keng", type: "MRT", lat: 1.320091, lng: 103.861655 },
  { station_name: "Potong Pasir", type: "MRT", lat: 1.331316, lng: 103.868779 },
  { station_name: "Woodleigh", type: "MRT", lat: 1.339202, lng: 103.870727 },
  { station_name: "Serangoon", type: "MRT", lat: 1.349862, lng: 103.873635 },
  { station_name: "Kovan", type: "MRT", lat: 1.360207, lng: 103.885163 },
  { station_name: "Hougang", type: "MRT", lat: 1.371406, lng: 103.892533 },
  { station_name: "Buangkok", type: "MRT", lat: 1.382991, lng: 103.893347 },
  { station_name: "Sengkang", type: "MRT", lat: 1.391682, lng: 103.895475 },
  { station_name: "Punggol", type: "MRT", lat: 1.405191, lng: 103.902367 },
  { station_name: "Bras Basah", type: "MRT", lat: 1.296978, lng: 103.850715 },
  { station_name: "Esplanade", type: "MRT", lat: 1.293995, lng: 103.855396 },
  { station_name: "Promenade", type: "MRT", lat: 1.294063, lng: 103.860156 },
  {
    station_name: "Nicoll Highway",
    type: "MRT",
    lat: 1.300292,
    lng: 103.863449,
  },
  { station_name: "Stadium", type: "MRT", lat: 1.302847, lng: 103.875417 },
  { station_name: "Mountbatten", type: "MRT", lat: 1.306106, lng: 103.883175 },
  { station_name: "Dakota", type: "MRT", lat: 1.308474, lng: 103.888825 },
  { station_name: "MacPherson", type: "MRT", lat: 1.326769, lng: 103.889901 },
  { station_name: "Tai Seng", type: "MRT", lat: 1.33594, lng: 103.887706 },
  { station_name: "Bartley", type: "MRT", lat: 1.342923, lng: 103.87966 },
  { station_name: "Lorong Chuan", type: "MRT", lat: 1.35153, lng: 103.864957 },
  { station_name: "Marymount", type: "MRT", lat: 1.349089, lng: 103.839116 },
  { station_name: "Caldecott", type: "MRT", lat: 1.337649, lng: 103.839627 },
  {
    station_name: "Botanic Gardens",
    type: "MRT",
    lat: 1.322387,
    lng: 103.814905,
  },
  { station_name: "Farrer Road", type: "MRT", lat: 1.317606, lng: 103.807711 },
  {
    station_name: "Holland Village",
    type: "MRT",
    lat: 1.311189,
    lng: 103.796119,
  },
  { station_name: "one-north", type: "MRT", lat: 1.299854, lng: 103.787584 },
  { station_name: "Kent Ridge", type: "MRT", lat: 1.293629, lng: 103.784441 },
  {
    station_name: "Haw Par Villa",
    type: "MRT",
    lat: 1.283149,
    lng: 103.781991,
  },
  {
    station_name: "Pasir Panjang",
    type: "MRT",
    lat: 1.276111,
    lng: 103.791893,
  },
  { station_name: "Labrador Park", type: "MRT", lat: 1.27218, lng: 103.802557 },
  {
    station_name: "Telok Blangah",
    type: "MRT",
    lat: 1.270769,
    lng: 103.809878,
  },
  { station_name: "Bayfront", type: "MRT", lat: 1.281371, lng: 103.858998 },
  { station_name: "Bukit Panjang", type: "MRT", lat: 1.37834, lng: 103.762452 },
  { station_name: "Cashew", type: "MRT", lat: 1.369997, lng: 103.764569 },
  { station_name: "Hillview", type: "MRT", lat: 1.363185, lng: 103.767371 },
  { station_name: "Beauty World", type: "MRT", lat: 1.341607, lng: 103.775682 },
  {
    station_name: "King Albert Park",
    type: "MRT",
    lat: 1.335721,
    lng: 103.783203,
  },
  { station_name: "Sixth Avenue", type: "MRT", lat: 1.331221, lng: 103.79718 },
  { station_name: "Tan Kah Kee", type: "MRT", lat: 1.325826, lng: 103.807959 },
  { station_name: "Stevens", type: "MRT", lat: 1.320012, lng: 103.825964 },
  { station_name: "Rochor", type: "MRT", lat: 1.303601, lng: 103.852581 },
  { station_name: "Downtown", type: "MRT", lat: 1.27949, lng: 103.852802 },
  { station_name: "Telok Ayer", type: "MRT", lat: 1.282285, lng: 103.848584 },
  { station_name: "Fort Canning", type: "MRT", lat: 1.291631, lng: 103.844621 },
  { station_name: "Bencoolen", type: "MRT", lat: 1.298477, lng: 103.849984 },
  { station_name: "Jalan Besar", type: "MRT", lat: 1.305551, lng: 103.855443 },
  { station_name: "Bendemeer", type: "MRT", lat: 1.313674, lng: 103.863098 },
  {
    station_name: "Geylang Bahru",
    type: "MRT",
    lat: 1.321479,
    lng: 103.871457,
  },
  { station_name: "Mattar", type: "MRT", lat: 1.326878, lng: 103.883304 },
  { station_name: "Ubi", type: "MRT", lat: 1.330008, lng: 103.898911 },
  { station_name: "Kaki Bukit", type: "MRT", lat: 1.335076, lng: 103.909057 },
  { station_name: "Bedok North", type: "MRT", lat: 1.335268, lng: 103.918054 },
  {
    station_name: "Bedok Reservoir",
    type: "MRT",
    lat: 1.336595,
    lng: 103.93307,
  },
  {
    station_name: "Tampines West",
    type: "MRT",
    lat: 1.345583,
    lng: 103.938244,
  },
  { station_name: "Tampines East", type: "MRT", lat: 1.35631, lng: 103.955471 },
  { station_name: "Upper Changi", type: "MRT", lat: 1.342218, lng: 103.961505 },
  { station_name: "South View", type: "LRT", lat: 1.380299, lng: 103.745286 },
  { station_name: "Keat Hong", type: "LRT", lat: 1.378604, lng: 103.749058 },
  { station_name: "Teck Whye", type: "LRT", lat: 1.376738, lng: 103.753665 },
  { station_name: "Phoenix", type: "LRT", lat: 1.378798, lng: 103.758021 },
  { station_name: "Senja", type: "LRT", lat: 1.382852, lng: 103.762312 },
  { station_name: "Jelapang", type: "LRT", lat: 1.386703, lng: 103.764547 },
  { station_name: "Segar", type: "LRT", lat: 1.387713, lng: 103.769599 },
  { station_name: "Fajar", type: "LRT", lat: 1.384502, lng: 103.770862 },
  { station_name: "Bangkit", type: "LRT", lat: 1.380281, lng: 103.772576 },
  { station_name: "Pending", type: "LRT", lat: 1.376223, lng: 103.771277 },
  { station_name: "Petir", type: "LRT", lat: 1.377828, lng: 103.76655 },
  { station_name: "Compassvale", type: "LRT", lat: 1.394615, lng: 103.900443 },
  { station_name: "Rumbia", type: "LRT", lat: 1.391553, lng: 103.905947 },
  { station_name: "Bakau", type: "LRT", lat: 1.38804, lng: 103.905412 },
  { station_name: "Kangkar", type: "LRT", lat: 1.383957, lng: 103.90216 },
  { station_name: "Ranggung", type: "LRT", lat: 1.384116, lng: 103.897386 },
  { station_name: "Cheng Lim", type: "LRT", lat: 1.396332, lng: 103.89379 },
  { station_name: "Farmway", type: "LRT", lat: 1.397178, lng: 103.889168 },
  { station_name: "Kupang", type: "LRT", lat: 1.398271, lng: 103.881283 },
  { station_name: "Thanggam", type: "LRT", lat: 1.397378, lng: 103.87561 },
  { station_name: "Fernvale", type: "LRT", lat: 1.392033, lng: 103.876256 },
  { station_name: "Layar", type: "LRT", lat: 1.392141, lng: 103.880022 },
  { station_name: "Tongkang", type: "LRT", lat: 1.389519, lng: 103.885829 },
  { station_name: "Renjong", type: "LRT", lat: 1.386827, lng: 103.890541 },
  { station_name: "Cove", type: "LRT", lat: 1.399534, lng: 103.905792 },
  { station_name: "Meridian", type: "LRT", lat: 1.397002, lng: 103.908884 },
  { station_name: "Coral Edge", type: "LRT", lat: 1.39392, lng: 103.912633 },
  { station_name: "Riviera", type: "LRT", lat: 1.39454, lng: 103.916056 },
  { station_name: "Kadaloor", type: "LRT", lat: 1.399633, lng: 103.916536 },
  { station_name: "Oasis", type: "LRT", lat: 1.402304, lng: 103.912736 },
  { station_name: "Damai", type: "LRT", lat: 1.405293, lng: 103.908606 },
  { station_name: "Sam Kee", type: "LRT", lat: 1.409808, lng: 103.90492 },
  { station_name: "Teck Lee", type: "LRT", lat: 1.412783, lng: 103.906565 },
  { station_name: "Punggol Point", type: "LRT", lat: 1.416932, lng: 103.90668 },
  { station_name: "Samudera", type: "LRT", lat: 1.415955, lng: 103.902185 },
  { station_name: "Nibong", type: "LRT", lat: 1.411865, lng: 103.900321 },
  { station_name: "Sumang", type: "LRT", lat: 1.408501, lng: 103.898605 },
  { station_name: "Soo Teck", type: "LRT", lat: 1.405436, lng: 103.897287 },
];

// Function to calculate distance between two points using Haversine formula
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

const App: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // State variables
  const [address, setAddress] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [rooms, setRooms] = useState<number>(1);
  const [squareFeet, setSquareFeet] = useState<number>(500);
  const [selectedModel, setSelectedModel] = useState<string>("linear");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [estimatedRent, setEstimatedRent] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [nearestStation, setNearestStation] = useState<Station | null>(null);

  useEffect(() => {
    console.log("Addresss:", address);
  }, [address]);

  useEffect(() => {
    const initializeMap = async (): Promise<void> => {
      if (mapInstanceRef.current) return;

      try {
        // Load necessary scripts
        await loadScript("https://code.jquery.com/jquery-3.7.0.min.js");
        await loadScript(
          "https://www.onemap.gov.sg/web-assets/libs/leaflet/onemap-leaflet.js"
        );
        await loadScript(
          "https://www.onemap.gov.sg/web-assets/libs/leaflet/leaflet-tilejson.js"
        );

        const $ = (window as any).$;
        const L = (window as any).L;

        const sw = L.latLng(1.144, 103.535);
        const ne = L.latLng(1.494, 104.502);
        const bounds = L.latLngBounds(sw, ne);

        $.get(
          "https://www.onemap.gov.sg/maps/json/raster/tilejson/2.2.0/Default.json",
          function (data: any) {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.remove();
              mapInstanceRef.current = null;
            }

            const map = L.TileJSON.createMap("mapdiv", data);
            mapInstanceRef.current = map;

            map.setMaxBounds(bounds);
            map.setView([1.2868108, 103.8545349], 16);

            map.attributionControl.setPrefix(`
            <img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;" />
            <a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a> &copy; contributors |
            <a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>
          `);

            // Map click listener
            map.on("click", async (e: any) => {
              const { lat, lng } = e.latlng;
              console.log("Point clicked:", lat, lng);
              setCoordinates({ lat, lng });

              // Place or move marker
              if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
              } else {
                markerRef.current = L.marker([lat, lng], {
                  draggable: true,
                }).addTo(map);

                // Add drag end event to update coordinates when marker is dragged
                markerRef.current.on("dragend", function (event: any) {
                  const marker = event.target;
                  const position = marker.getLatLng();
                  setCoordinates({ lat: position.lat, lng: position.lng });
                  fetchAddress(position.lat, position.lng);
                  findNearestStation(position.lat, position.lng);
                });
              }

              fetchAddress(lat, lng);
              findNearestStation(lat, lng);
            });
          }
        );
      } catch (err) {
        console.error("Error initializing map:", err);
      }
    };

    initializeMap();
  }, []);

  const findNearestStation = (lat: number, lng: number): void => {
    // Calculate distance to each station
    const stationsWithDistance = stationData.map((station) => {
      const distance = calculateDistance(lat, lng, station.lat, station.lng);
      return { ...station, distance };
    });

    // Find the nearest station
    const nearest = stationsWithDistance.reduce((prev, curr) =>
      prev.distance! < curr.distance! ? prev : curr
    );

    setNearestStation(nearest);
  };

  const convertToSVY21 = (
    lat: number,
    lng: number
  ): { X: number; Y: number } => {
    // This is a very simplified conversion for demonstration
    // In production, you should use the actual SVY21 conversion formula or OneMap's conversion API
    // These constants are approximations for Singapore
    const a = 6378137.0; // WGS84 semi-major axis
    const f = 1.0 / 298.257223563; // WGS84 flattening
    const oLat = 1.366666; // SVY21 origin latitude
    const oLon = 103.833333; // SVY21 origin longitude
    const No = 38744.572; // False Northing
    const Eo = 28001.642; // False Easting
    const k = 1.0; // Scale factor

    // Very simplified conversion (this is not accurate for production)
    const x = (lng - oLon) * 111320 * Math.cos((lat * Math.PI) / 180) * k + Eo;
    const y = (lat - oLat) * 110574 * k + No;

    return { X: x, Y: y };
  };

  const fetchAddress = (lat: number, lng: number): void => {
    console.log("Fetching address for coordinates:", lat, lng);
    const svy21Coords = convertToSVY21(lat, lng);
    // New token and endpoint
    const token =
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI4M2Y2OTc2MGY1ZGE0YTJiMDM4MGY0MjYzOTY1OGMxMyIsImlzcyI6Imh0dHA6Ly9pbnRlcm5hbC1hbGItb20tcHJkZXppdC1pdC1uZXctMTYzMzc5OTU0Mi5hcC1zb3V0aGVhc3QtMS5lbGIuYW1hem9uYXdzLmNvbS9hcGkvdjIvdXNlci9wYXNzd29yZCIsImlhdCI6MTc0NTIxNDMwNCwiZXhwIjoxNzQ1NDczNTA0LCJuYmYiOjE3NDUyMTQzMDQsImp0aSI6IjJ2WDREeml0dk4yVGNiN3AiLCJ1c2VyX2lkIjo2OTI5LCJmb3JldmVyIjpmYWxzZX0.wfktWONDkXXST3o3YmM0zZDVcC3onpdwbXlqkVDOdTw";

    const url = `https://www.onemap.gov.sg/api/public/revgeocodexy?location=${svy21Coords.X},${svy21Coords.Y}&buffer=40&addressType=All&otherFeatures=N`;

    fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log("Response status:", response.status);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data: RevGeocodeResponse) => {
        if (data.GeocodeInfo && data.GeocodeInfo.length > 0) {
          console.log(data);
          const address =
            data.GeocodeInfo[0].BUILDINGNAME +
            " BLOCK " +
            data.GeocodeInfo[0].BLOCK;
          setAddress(address);
          console.log(address);
        } else {
          console.error("No address found for this location.");
          setAddress("Address not found.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setAddress("Error fetching address.");
      });
  };

  const getQuote = (): void => {
    if (!coordinates) {
      alert("Please select a location on the map first");
      return;
    }

    setIsLoading(true);

    // Simulate API call to prediction model
    setTimeout(() => {
      // Generate a realistic rental price based on inputs
      const basePrice = 1500;
      const roomMultiplier = rooms * 500;
      const sizeMultiplier = squareFeet * 0.5;

      // Different models would give slightly different results
      let modelAdjustment = 1.0;
      if (selectedModel === "xgboost") modelAdjustment = 1.05;
      if (selectedModel === "neural") modelAdjustment = 0.95;

      // Location factor (using coordinates)
      const locationFactor = ((coordinates.lat * 1000) % 0.3) + 0.85;

      // Time factor (more recent = higher rent)
      const dateObj = new Date(selectedDate + "-01");
      const currentDate = new Date();
      const monthsDiff =
        (dateObj.getFullYear() - currentDate.getFullYear()) * 12 +
        dateObj.getMonth() -
        currentDate.getMonth();
      const timeFactor = 1 + monthsDiff * 0.01; // 1% increase per month into the future

      // MRT proximity factor
      let mrtFactor = 1.0;
      if (nearestStation && nearestStation.distance) {
        // Higher rent for properties closer to MRT/LRT stations
        if (nearestStation.distance < 0.5) {
          mrtFactor = 1.15; // 15% premium for very close proximity (<500m)
        } else if (nearestStation.distance < 1) {
          mrtFactor = 1.1; // 10% premium for close proximity (<1km)
        } else if (nearestStation.distance < 2) {
          mrtFactor = 1.05; // 5% premium for moderate proximity (<2km)
        }
      }

      const calculatedRent = Math.round(
        (basePrice + roomMultiplier + sizeMultiplier) *
          modelAdjustment *
          locationFactor *
          timeFactor *
          mrtFactor
      );

      setEstimatedRent(calculatedRent);
      setIsLoading(false);
      setShowResults(true);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 opacity">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Singapore Rental Price Predictor</h1>
        <p className="text-sm">
          Select a location on the map and enter property details to estimate
          rental prices
        </p>
      </header>

      <div className="flex flex-col md:flex-row flex-1">
        {/* Map section */}
        <div className="w-full md:w-2/3 h-96 md:h-auto relative">
          <div
            id="mapdiv"
            ref={mapRef}
            className="h-full w-full rounded-lg shadow-md"
          />
          <div className="absolute bottom-4 left-4 bg-white p-2 rounded-md shadow-md max-w-sm">
            <p className="text-xs text-gray-500">
              Click anywhere on the map to select a location
            </p>
          </div>
        </div>

        {/* Controls section */}
        <div className="w-full md:w-1/3 p-4 bg-white shadow-md">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Property Details
            </h2>

            {address && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Selected Location
                </label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-800 text-sm break-words">{address}</p>
                  {coordinates && (
                    <p className="text-xs text-gray-500 mt-1">
                      Coordinates: {coordinates.lat.toFixed(6)},{" "}
                      {coordinates.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Number of Rooms
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    className={`w-10 h-10 rounded-full ${
                      rooms === num
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    } flex items-center justify-center font-bold`}
                    onClick={() => setRooms(num)}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Square Feet: {squareFeet}
              </label>
              <input
                type="range"
                min="300"
                max="3000"
                step="50"
                value={squareFeet}
                onChange={(e) => setSquareFeet(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>300</span>
                <span>3000</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Prediction Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="linear">Linear Regression</option>
                <option value="xgboost">XGBoost</option>
                <option value="neural">Neural Network</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Prediction Month
              </label>
              <input
                type="month"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().slice(0, 7)}
              />
            </div>

            <button
              onClick={getQuote}
              disabled={!coordinates || isLoading}
              className={`w-full py-3 px-4 font-bold rounded-lg ${
                !coordinates || isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              } transition-colors flex items-center justify-center`}
            >
              {isLoading ? (
                <>
                  <span className="mr-2">Processing</span>
                  <span className="animate-spin">⟳</span>
                </>
              ) : (
                "Get Rental Estimate"
              )}
            </button>
          </div>

          {/* Results section */}
          {showResults && estimatedRent && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-bold text-green-800">
                Estimated Monthly Rent
              </h3>
              <div className="text-3xl font-bold text-green-700 my-2">
                SGD ${estimatedRent.toLocaleString()}
              </div>
              <div className="text-xl text-green-700 mt-6 ">
                <p className="mb-1 tracking-wide">Based on your selections:</p>
                <ul className="list-disc pl-5 text-xl tracking-wide	">
                  <li>
                    {rooms} room{rooms > 1 ? "s" : ""}
                  </li>
                  <li>{squareFeet} square feet</li>
                  {nearestStation && (
                    <li>
                      {nearestStation.distance?.toFixed(2)} km to{" "}
                      {nearestStation.station_name} {nearestStation.type}
                    </li>
                  )}
                  <li>
                    Model:{" "}
                    {selectedModel === "linear"
                      ? "Linear Regression"
                      : selectedModel === "xgboost"
                      ? "XGBoost"
                      : "Neural Network"}
                  </li>
                  <li>
                    Prediction for:{" "}
                    {new Date(selectedDate + "-01").toLocaleDateString(
                      "en-US",
                      { month: "long", year: "numeric" }
                    )}
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="bg-gray-100 p-4 text-center text-gray-600 text-xs">
        <p>© 2025 Singapore Rental Price Predictor | Data powered by OneMap</p>
      </footer>
    </div>
  );
};

export default App;
