import { Camera } from '../types';

const generateMockCameras = (count = 16): Camera[] => {
  const locations = [
    'Main Entrance',
    'Parking Lot A',
    'Parking Lot B',
    'Server Room',
    'Reception Area',
    'Warehouse',
    'Executive Office',
    'Loading Dock',
    'Break Room',
    'Perimeter East',
    'Perimeter West',
    'Employee Entrance',
    'Hallway A',
    'Hallway B',
    'Conference Room',
    'Security Office',
  ];

  // Use images from Unsplash
  const imageUrls = [
    'https://images.unsplash.com/photo-1564182842519-8a3b2af3e228?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1531972111231-7482a960e109?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1591474200742-8e512e6f98f8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546801503-c539dae58157?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1577192132004-a5a42fce65fd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1520187044487-b2efff24fbb8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1536638851223-1ecb9e6ededd?auto=format&fit=crop&w=800&q=80',
  ];

  return Array.from({ length: count }, (_, i) => {
    const isOnline = Math.random() > 0.2; // 80% chance of being online
    return {
      id: `cam-${(i + 1).toString().padStart(2, '0')}`,
      name: locations[i % locations.length],
      location: locations[i % locations.length],
      status: isOnline ? 'online' : 'offline',
      lastUpdated: new Date(),
      resolution: '1080p',
      type: i % 3 === 0 ? 'ptz' : 'fixed',
      // Cycle through image URLs, repeating as needed
      imageUrl: imageUrls[i % imageUrls.length],
      ipAddress: `192.168.1.${100 + i}`,
      connectionLost: isOnline ? null : new Date(Date.now() - Math.floor(Math.random() * 600000))
    };
  });
};

export const mockCameras = generateMockCameras();

export const getCameraById = (id: string): Camera | undefined => {
  return mockCameras.find(camera => camera.id === id);
};

export const filterCameras = (
  searchTerm: string = '',
  status?: 'online' | 'offline',
  location?: string
): Camera[] => {
  return mockCameras.filter(camera => {
    // Filter by search term
    if (searchTerm && !camera.name.toLowerCase().includes(searchTerm.toLowerCase()) && !camera.id.includes(searchTerm)) {
      return false;
    }
    
    // Filter by status
    if (status && camera.status !== status) {
      return false;
    }
    
    // Filter by location
    if (location && camera.location !== location) {
      return false;
    }
    
    return true;
  });
};