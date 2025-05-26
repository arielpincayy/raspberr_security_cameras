import { useState, useEffect, useRef } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, X, Camera as CameraIcon } from 'lucide-react';
import { mockCameras } from '../data/mockCameras';
import { Camera } from '../types';
import { useAlert } from '../contexts/AlertContext';
import CameraStream from '../components/ui/CameraStream';

// Tiempo en milisegundos para marcar como offline si el archivo no cambia
const OFFLINE_TIMEOUT_MS = 8000;
const HEARTBEAT_INTERVAL_MS = 5000;

const CameraCard = ({ camera }: { camera: Camera }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Estado para controlar si la cámara está online (usando heartbeat)
  const [isOnline, setIsOnline] = useState(camera.status === 'online');
  const [lastModified, setLastModified] = useState<Date | null>(null);

  // Heartbeat para checar si el stream sigue activo
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let abortController = new AbortController();

    const checkHeartbeat = async () => {
      try {
        const res = await fetch(camera.streamUrl, { method: 'HEAD', signal: abortController.signal });
        const dateStr = res.headers.get('Last-Modified');
        if (dateStr) {
          const modDate = new Date(dateStr);
          if (!lastModified || modDate > lastModified) {
            setLastModified(modDate);
            setIsOnline(true);
          } else {
            // Si no ha cambiado en más de OFFLINE_TIMEOUT_MS, marcamos como offline
            if (Date.now() - modDate.getTime() > OFFLINE_TIMEOUT_MS) {
              setIsOnline(false);
            }
          }
        } else {
          setIsOnline(false);
        }
      } catch (e) {
        setIsOnline(false);
      }
    };

    // Corre inmediatamente y luego cada X segundos
    checkHeartbeat();
    interval = setInterval(checkHeartbeat, HEARTBEAT_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      abortController.abort();
    };
    // eslint-disable-next-line
  }, [camera.streamUrl, lastModified]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const statusColor = isOnline ? 'bg-success' : 'bg-destructive';
  const statusText = isOnline ? 'Online' : 'Offline';

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-background' : 'relative'}`}>
      {isFullscreen && (
        <div className="absolute top-4 right-4 z-10">
          <button
            className="btn btn-destructive"
            onClick={toggleFullscreen}
          >
            Exit Fullscreen
          </button>
        </div>
      )}

      <div
        className={`bg-card rounded-lg border border-border overflow-hidden ${isFullscreen ? 'h-full' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          <div className={`relative ${isFullscreen ? 'h-full' : 'h-[200px]'}`}>
            {isOnline && camera.streamUrl ? (
              <CameraStream
                src={camera.streamUrl}
              />
            ) : (
              <div className="w-full h-full bg-black flex items-center justify-center text-white opacity-60">
                Offline
              </div>
            )}

            {/* Simulate live feed */}
            {isOnline && (
              <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 rounded-md text-white text-xs flex items-center">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusColor} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${statusColor}`}></span>
                </span>
                LIVE
              </div>
            )}

            {/* Status overlay */}
            <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 rounded-md text-white text-xs flex items-center">
              <span className={`inline-block w-2 h-2 rounded-full mr-1 ${statusColor}`}></span>
              {statusText}
            </div>

            {/* Camera info overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h3 className="text-white font-medium truncate">{camera.name}</h3>
              <p className="text-white/80 text-sm truncate">{camera.ipAddress}</p>
            </div>
          </div>

          {(isHovered || isFullscreen) && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <button
                onClick={toggleFullscreen}
                className="btn btn-primary"
              >
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </button>
            </div>
          )}

          {!isOnline && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="bg-card p-4 rounded-md max-w-xs text-center">
                <CameraIcon className="h-8 w-8 text-destructive mx-auto mb-2" />
                <h4 className="font-medium">Connection Lost</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Attempting to reconnect...
                </p>
              </div>
            </div>
          )}
        </div>

        {!isFullscreen && (
          <div className="p-3 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Resolution: {camera.resolution}</p>
                <p className="text-xs text-muted-foreground">Type: {camera.type === 'ptz' ? 'PTZ' : 'Fixed'}</p>
              </div>
              <button
                onClick={toggleFullscreen}
                className="btn btn-ghost text-xs"
              >
                Expand
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CamerasPage = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'online' | 'offline' | ''>('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const { showAlert } = useAlert();

  const locations = Array.from(new Set(mockCameras.map(c => c.location)));

  useEffect(() => {
    const fetchCameras = async () => {
      setLoading(true);

      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        let filteredCameras = mockCameras.filter(cam => {
          let matches = true;
          if (searchTerm) {
            matches = matches && (
              cam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              cam.location.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          if (selectedStatus) {
            matches = matches && cam.status === selectedStatus;
          }
          if (selectedLocation) {
            matches = matches && cam.location === selectedLocation;
          }
          return matches;
        });
        setCameras(filteredCameras);
      } catch (error) {
        showAlert({
          type: 'error',
          message: 'Failed to load cameras. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, [searchTerm, selectedStatus, selectedLocation, showAlert]);

  const handleClearFilters = () => {
    setSelectedStatus('');
    setSelectedLocation('');
  };

  const onlineCount = cameras.filter(c => c.status === 'online').length;
  const totalCameras = cameras.length;
  const activeFiltersCount = [selectedStatus, selectedLocation].filter(Boolean).length;

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Live Cameras</h1>
        <p className="text-muted-foreground">
          {onlineCount} of {totalCameras} cameras online
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search cameras by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className="btn btn-secondary flex items-center gap-2"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="ml-1 bg-white bg-opacity-20 text-xs rounded-full px-2 py-0.5">
              {activeFiltersCount}
            </span>
          )}
          {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 bg-card border border-border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Filter Cameras</h3>
            <button
              className="text-muted-foreground hover:text-foreground text-sm flex items-center"
              onClick={handleClearFilters}
            >
              <X className="h-3 w-3 mr-1" />
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="input"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'online' | 'offline' | '')}
              >
                <option value="">All Statuses</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <select
                className="input"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : cameras.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-muted-foreground">No cameras found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cameras.map((camera) => (
            <CameraCard key={camera.id} camera={camera} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CamerasPage;
