import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Phone, Calendar, ExternalLink, X, Clock, Check } from 'lucide-react';
import axios from "axios";
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './patient/Navbar';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>
    {children}
  </div>
);
const Button = ({ children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md transition-colors ${className}`}
  >
    {children}
  </button>
);


const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Appointment Booking Modal
const AppointmentModal = ({ isOpen, onClose, doctor }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = async () => {
    try {
      // Add your API call here to save the appointment
      // const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/appointments`, {
      //   doctorId: doctor.id,
      //   date: selectedDate,
      //   time: selectedTime
      // });
      
      setIsConfirmed(true);
      setStep(3);
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 9; i <= 17; i++) {
      slots.push(`${i}:00`);
      slots.push(`${i}:30`);
    }
    return slots;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Select Date</h3>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border rounded-md mb-4"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <Button 
              onClick={() => setStep(2)}
              className="w-full bg-blue-500 text-white hover:bg-blue-600"
              disabled={!selectedDate}
            >
              Next
            </Button>
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Select Time</h3>
            <div className="grid grid-cols-3 gap-2 mb-4 max-h-48 overflow-y-auto">
              {generateTimeSlots().map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-2 rounded-md ${
                    selectedTime === time
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 hover:bg-gray-200"
              >
                Back
              </Button>
              <Button 
                onClick={handleConfirm}
                className="flex-1 bg-blue-500 text-white hover:bg-blue-600"
                disabled={!selectedTime}
              >
                Confirm
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="text-center">
            <div className="mb-4">
              <Check className="w-16 h-16 text-green-500 mx-auto mb-2" />
              <h3 className="text-xl font-semibold">Appointment Confirmed!</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <p className="font-medium">{doctor.doctor_name}</p>
              <p className="text-gray-600">{selectedDate}</p>
              <p className="text-gray-600">{selectedTime}</p>
            </div>
            <Button 
              onClick={onClose}
              className="w-full bg-blue-500 text-white hover:bg-blue-600"
            >
              Done
            </Button>
          </div>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Book Appointment</h2>
        <p className="text-gray-600">with {doctor?.doctor_name}</p>
      </div>
      {renderStep()}
    </Modal>
  );
};

const DoctorCard = ({ doctor }) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const openInMaps = () => {
    const mapUrl = `https://www.google.com/maps?q=${doctor.locality_latitude},${doctor.locality_longitude}`;
    window.open(mapUrl, '_blank');
  };

  return (
    <Card className="w-full mb-4 hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <img 
              src={doctor.image_url || "/api/placeholder/150/150"} 
              alt={doctor.doctor_name} 
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-100"
            />
            <span className="ml-4 text-sm text-green-500 font-semibold bg-green-100 px-2 py-1 rounded-full">
                 Verified
            </span>
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-blue-800">{doctor.doctor_name}</h3>
                <p className="text-gray-600 mb-2">{doctor.specialization}</p>
              </div>
              <Button 
                onClick={() => setIsBookingOpen(true)}
                className="bg-blue-500 text-white hover:bg-blue-600 flex items-center"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </div>

            <Button 
              onClick={openInMaps} 
              className="text-gray-500 hover:text-blue-500 flex items-center mb-2 hover:bg-gray-50 rounded-md"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {doctor.locality && doctor.city 
                ? <span>{doctor.locality}, {doctor.city}</span> 
                : <></> }
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>

            <div className="flex items-center space-x-4 mb-3">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-gray-600">4.5</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">10+ years exp.</span>
            </div>

            <div className="bg-gray-50 p-3 rounded-md mt-2">
              <p className="text-gray-700 line-clamp-2">{doctor.summary}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                Online Booking Available
              </span>
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm">
                Video Consultation
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <AppointmentModal 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        doctor={doctor}
      />
    </Card>
  );
};

const HospitalApp = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [coordi, setcoordi] = useState([]);

  const [specialization, setspecialization] = useState('');
  const location = useLocation();
  useEffect(() => {
    if (location.state.specialist) {
        const a =location.state.specialist
        fetchDoctorData(a); 
    }
  }, [location.state]);
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported by your browser');
        return;
      }
  
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };
  
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates = [
            position.coords.latitude,
            position.coords.longitude
          ];
          resolve(coordinates);
        },
        (error) => {
          let errorMessage;
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "User denied the request for Geolocation.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "The request to get user location timed out.";
              break;
            default:
              errorMessage = "An unknown error occurred.";
          }
          reject(errorMessage);
        },
        options
      );
    });
  };
  
  const fetchDoctorData = async (a) => {
    try {
      const coordinates = await getUserLocation();
      console.log('Coordinates:', coordinates);
      const requestData = {
        spec: a,
        loc: 'hyderabad',
        coordy:coordinates,
        flag:true
      };
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/en/consult`, requestData);
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    }
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    
    const filtered = doctors.filter(doctor => 
      doctor.doctor_name.toLowerCase().includes(searchTerm) ||
      doctor.specialization.toLowerCase().includes(searchTerm) ||
      (doctor.city && doctor.city.toLowerCase().includes(searchTerm)) ||
      (doctor.locality && doctor.locality.toLowerCase().includes(searchTerm))
    );
    
    setFilteredDoctors(filtered);
  };

  const displayedDoctors = searchTerm ? filteredDoctors : doctors;

  return (
    <>
    <Navbar isDoctor={false}/>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-6">Find Your Doctor</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by doctor name, specialization, or location..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </header>

        {displayedDoctors.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">No doctors found matching your search criteria.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedDoctors.map((doctor, index) => (
              <DoctorCard key={index} doctor={doctor} />
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default HospitalApp;