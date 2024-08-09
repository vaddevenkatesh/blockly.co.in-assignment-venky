import React, { useEffect, useState, useCallback } from 'react';
import {
  GoogleMap,
  withScriptjs,
  withGoogleMap,
  Marker,
  Polyline
} from 'react-google-maps';
import {
  Button,
  Card,
  Slider,
  Tooltip,
  Snackbar,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  MenuItem,
  Select
} from '@mui/material';
import '../../App.css'; 

const Map = ({ paths, stops }) => {
  const [progress, setProgress] = useState([]);
  const [speed, setSpeed] = useState(27); // 100 km/h
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  
  let initialDate;
  let interval = null;
  const icon1 = {
    url: "https://images.vexels.com/media/users/3/154573/isolated/preview/bd08e000a449288c914d851cb9dae110-hatchback-car-top-view-silhouette-by-vexels.png",
    scaledSize: new window.google.maps.Size(40, 40),
    anchor: new window.google.maps.Point(20, 20),
    scale: 0.7,
  };

  const center = Math.floor(paths.length / 2);
  const centerPathLat = paths[center]?.lat || 0;
  const centerPathLng = paths[center + 5]?.lng || 0;

  useEffect(() => {
    calculatePath();
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [paths]);

  const getDistance = () => {
    const differentInTime = (new Date() - initialDate) / 1000; // convert to seconds
    return differentInTime * speed; // d = v * t
  };

  const moveObject = () => {
    const distance = getDistance();
    if (!distance) return;

    const progressPoints = paths.filter(
      (coordinates) => coordinates.distance < distance
    );

    const nextLine = paths.find(
      (coordinates) => coordinates.distance > distance
    );

    if (!nextLine) {
      setProgress(progressPoints);
      window.clearInterval(interval);
      setSimulationStarted(false);
      setSnackbarMessage("Trip Completed! Thank you!");
      setSnackbarOpen(true);
      return;
    }

    const lastLine = progressPoints[progressPoints.length - 1];
    const lastLineLatLng = new window.google.maps.LatLng(
      lastLine.lat,
      lastLine.lng
    );
    const nextLineLatLng = new window.google.maps.LatLng(
      nextLine.lat,
      nextLine.lng
    );

    const totalDistance = nextLine.distance - lastLine.distance;
    const percentage = (distance - lastLine.distance) / totalDistance;

    const position = window.google.maps.geometry.spherical.interpolate(
      lastLineLatLng,
      nextLineLatLng,
      percentage
    );

    mapUpdate();
    setProgress(progressPoints.concat(position));
  };

  const calculatePath = () => {
    paths = paths.map((coordinates, i, array) => {
      if (i === 0) return { ...coordinates, distance: 0 };
      const { lat: lat1, lng: lng1 } = coordinates;
      const latLong1 = new window.google.maps.LatLng(lat1, lng1);

      const { lat: lat2, lng: lng2 } = array[0];
      const latLong2 = new window.google.maps.LatLng(lat2, lng2);

      const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
        latLong1,
        latLong2
      );

      return { ...coordinates, distance };
    });
  };

  const startSimulation = useCallback(() => {
    setLoading(true);
    if (interval) window.clearInterval(interval);
    setProgress([]);
    initialDate = new Date();
    interval = window.setInterval(moveObject, 1000);
    setSimulationStarted(true);
    setLoading(false);
  }, [interval, speed]);

  const resetSimulation = () => {
    if (interval) window.clearInterval(interval);
    setProgress([]);
    setSimulationStarted(false);
    setSnackbarMessage("Simulation Reset.");
    setSnackbarOpen(true);
  };

  const handleSpeedChange = (event, newValue) => {
    setSpeed(newValue);
  };

  const mapUpdate = () => {
    const distance = getDistance();
    if (!distance) return;

    let progressPoints = paths.filter(
      (coordinates) => coordinates.distance < distance
    );

    const nextLine = paths.find(
      (coordinates) => coordinates.distance > distance
    );

    let point1, point2;

    if (nextLine) {
      point1 = progressPoints[progressPoints.length - 1];
      point2 = nextLine;
    } else {
      point1 = progressPoints[progressPoints.length - 2];
      point2 = progressPoints[progressPoints.length - 1];
    }

    const point1LatLng = new window.google.maps.LatLng(point1.lat, point1.lng);
    const point2LatLng = new window.google.maps.LatLng(point2.lat, point2.lng);

    const angle = window.google.maps.geometry.spherical.computeHeading(
      point1LatLng,
      point2LatLng
    );
    const actualAngle = angle - 90;

    const marker = document.querySelector(`[src="${icon1.url}"]`);

    if (marker) {
      marker.style.transition = 'transform 0.5s ease'; // Add smooth rotation transition
      marker.style.transform = `rotate(${actualAngle}deg)`;
    }
  };

  const handleStopClick = (stop) => {
    setSelectedStop(stop);
    setSelectedMarker(stop);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedStop(null);
    setSelectedMarker(null);
  };

  return (
    <Card variant="outlined" className='map-card'>
      <div className='btnCont'>
        <Button
          variant="contained"
          onClick={startSimulation}
          disabled={simulationStarted}
          className='start-btn'
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : (simulationStarted ? "Simulation Running" : "Start Simulation")}
        </Button>
        <Button
          variant="contained"
          onClick={resetSimulation}
          color="secondary"
          className='reset-btn'
        >
          Reset Simulation
        </Button>
      </div>

      <div className='controls'>
        <Typography gutterBottom>Speed: {speed} km/h</Typography>
        <Tooltip title="Adjust Speed (km/h)">
          <Slider
            value={speed}
            onChange={handleSpeedChange}
            aria-labelledby="speed-slider"
            min={10}
            max={100}
            step={1}
            className='speed-slider'
          />
        </Tooltip>
      </div>

      <div className='gMapCont'>
        <GoogleMap
          defaultZoom={17}
          defaultCenter={{ lat: centerPathLat, lng: centerPathLng }}
          defaultOptions={{ 
            styles: [
              {
                featureType: 'all',
                stylers: [{ hue: '#ff4400' }, { saturation: -68 }, { lightness: -4 }, { gamma: 0.72 }]
              }
            ]
          }}
          className='google-map'
        >
          <Polyline
            path={paths}
            options={{
              strokeColor: "#0088FF",
              strokeWeight: 6,
              strokeOpacity: 0.6,
              defaultVisible: true,
            }}
          />

          {stops.data.map((stop, index) => (
            <Marker
              key={index}
              position={{ lat: stop.lat, lng: stop.lng }}
              title={stop.id}
              label={`${index + 1}`}
              onClick={() => handleStopClick(stop)}
              className={`stop-marker ${selectedMarker === stop ? 'highlighted' : ''}`}
            />
          ))}

          {progress.length > 0 && (
            <>
              <Polyline
                path={progress}
                options={{ strokeColor: "orange" }}
              />

              <Marker
                icon={icon1}
                position={progress[progress.length - 1]}
                className='animated-marker'
              />
            </>
          )}
        </GoogleMap>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => setSnackbarOpen(false)}
          >
            ×
          </IconButton>
        }
      />

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Stop Details</DialogTitle>
        <DialogContent>
          {selectedStop && (
            <>
              <Typography><strong>ID:</strong> {selectedStop.id}</Typography>
              <Typography><strong>Latitude:</strong> {selectedStop.lat}</Typography>
              <Typography><strong>Longitude:</strong> {selectedStop.lng}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default withScriptjs(withGoogleMap(Map));
