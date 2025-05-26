import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '../data/mockEvents';
import { Event } from '../types';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Info, 
  Download, 
  CheckCircle, 
  AlertCircle,
  User,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';

const formatDateTime = (date: Date) => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const EventTypeLabel = ({ type }: { type: string }) => {
  const label = type.replace('_', ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
  return label;
};

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isReviewed, setIsReviewed] = useState(false);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  useEffect(() => {
    // Simulate API fetch
    const fetchEvent = async () => {
      setLoading(true);
      
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (!id) {
          throw new Error('Event ID is required');
        }
        
        const eventData = getEventById(id);
        
        if (!eventData) {
          throw new Error('Event not found');
        }
        
        setEvent(eventData);
        setIsReviewed(eventData.status === 'reviewed');
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load event');
        showAlert({ 
          type: 'error', 
          message: error instanceof Error ? error.message : 'Failed to load event'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [id]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleDownload = () => {
    showAlert({ 
      type: 'info', 
      message: 'Evidence download started. Files will be available shortly.'
    });
    
    // Simulate download
    setTimeout(() => {
      showAlert({ 
        type: 'success', 
        message: 'Evidence successfully downloaded.'
      });
    }, 3000);
  };

  const handleMarkAsReviewed = () => {
    // Simulate API call
    setLoading(true);
    
    setTimeout(() => {
      if (event) {
        const updatedEvent = { 
          ...event, 
          status: 'reviewed' as const,
          details: {
            ...event.details,
            reviewer: 'Current User',
            reviewTimestamp: new Date(),
            notes: 'Marked as reviewed by user.'
          }
        };
        
        setEvent(updatedEvent);
        setIsReviewed(true);
        setLoading(false);
        
        showAlert({ 
          type: 'success', 
          message: 'Event marked as reviewed successfully.'
        });
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Event</h2>
        <p className="text-muted-foreground mb-6">{error || 'Event not found'}</p>
        <button className="btn btn-primary" onClick={handleBack}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Header with back button */}
      <div className="mb-6">
        <button 
          className="flex items-center text-muted-foreground hover:text-foreground mb-4"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Events
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold mb-2 md:mb-0">Event Details: {event.id}</h1>
          
          <div className="flex space-x-3">
            <button
              className="btn btn-secondary"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Evidence
            </button>
            
            {!isReviewed && (
              <button
                className="btn btn-primary"
                onClick={handleMarkAsReviewed}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></span>
                    Processing...
                  </span>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Reviewed
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Event summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {/* Media section */}
          <div className="relative h-[300px] bg-black flex items-center justify-center">
            <img 
              src={event.imageUrl} 
              alt={`Event ${event.id}`} 
              className="h-full w-full object-cover"
            />
            
            {/* Status overlay */}
            <div className="absolute top-3 right-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                event.status === 'reviewed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
              }`}>
                {event.status === 'reviewed' ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Reviewed
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Pending Review
                  </>
                )}
              </span>
            </div>
          </div>
          
          {/* Event details */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              <EventTypeLabel type={event.type} />
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Timestamp</p>
                  <p className="font-medium">{formatDateTime(event.timestamp)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{event.location}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Coordinates</p>
                  <p className="font-medium">{event.details.coordinates}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="font-medium">{event.details.confidence}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{event.details.duration}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Review history */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Review History</h2>
            
            {event.status === 'reviewed' ? (
              <div className="space-y-6">
                <div className="flex items-start">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Reviewed By</p>
                    <p className="font-medium">{event.details.reviewer}</p>
                  </div>
                </div>
                
                {event.details.reviewTimestamp && (
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground">Review Date</p>
                      <p className="font-medium">{formatDateTime(event.details.reviewTimestamp)}</p>
                    </div>
                  </div>
                )}
                
                {event.details.notes && (
                  <div className="flex items-start">
                    <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="font-medium">{event.details.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Awaiting Review</h3>
                <p className="text-muted-foreground mb-6">
                  This event has not been reviewed yet. Click the button below to mark it as reviewed.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={handleMarkAsReviewed}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></span>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Reviewed
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;