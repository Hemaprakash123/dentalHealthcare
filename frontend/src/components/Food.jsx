import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Apple, AlertTriangle, Clock, Coffee, Sun, Sunset, Moon } from 'lucide-react';
import Navbar from './patient/Navbar';
import { useLocation } from 'react-router-dom';

const DietGuidelines = () => {
  const location = useLocation();
  const data = location.state?.prompt;
  const [isDoctor, setIsDoctor] = useState();
  const [activeTab, setActiveTab] = useState('foods-to-eat');

  useEffect(() => {
    setIsDoctor(localStorage.getItem("isDoctor"));
  }, []);

  const tabs = [
    { id: 'foods-to-eat', label: 'Foods to Eat', icon: <Apple className="w-5 h-5" /> },
    { id: 'foods-to-avoid', label: 'Foods to Avoid', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'meal-timings', label: 'Meal Timings', icon: <Clock className="w-5 h-5" /> },
  ];

  const getMealIcon = (time) => {
    switch(time) {
      case 'morning': return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'afternoon': return <Coffee className="w-5 h-5 text-orange-500" />;
      case 'evening': return <Sunset className="w-5 h-5 text-pink-500" />;
      case 'night': return <Moon className="w-5 h-5 text-blue-500" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  // Helper function to split comma-separated strings into arrays
  const stringToList = (str) => str.split(',').map(item => item.trim());

  // Helper function to split text into points
  const textToPoints = (text) => {
    if (!text) return [];
    // Split by periods, filter out empty strings, and clean up each point
    return text.split('.')
      .map(point => point.trim())
      .filter(point => point.length > 0);
  };

  return (
    <div>
      <Navbar isDoctor={isDoctor} />
      
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
              🍽️ Dietary Guidelines
            </h2>
            
            <div className="flex justify-center space-x-4 mb-8 border-b">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-blue-500'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'foods-to-eat' && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <Apple className="w-5 h-5" />
                      Recommended Foods
                    </h3>
                    <ul className="list-disc ml-6 text-gray-800 font-bold">
                      {stringToList(data["Foods to Eat"]["Recommended-Food"]).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                    <p className="text-gray-600 mt-4">{data["Foods to Eat"]["Diet-Explanation"]}</p>
                  </div>
                </div>
              )}

              {activeTab === 'foods-to-avoid' && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Foods to Avoid
                    </h3>
                    <ul className="list-disc ml-6 text-gray-800 font-bold">
                      {stringToList(data["Foods to Avoid"]["Avoid_food"]).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                    <p className="text-gray-600 mt-4">{data["Foods to Avoid"]["Diet-Explanation"]}</p>
                  </div>
                </div>
              )}

              {activeTab === 'meal-timings' && (
                <div className="grid gap-6">
                  {Object.entries(data["Meal Timings"]).map(([time, info]) => (
                    <div key={time} className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
                        {getMealIcon(time)}
                        <span className="capitalize">{time}</span>
                      </h3>
                      <p className="text-gray-600 mb-2">{info["Diet-Explanation"]}</p>
                      <ul className="list-disc ml-6 text-gray-800 font-bold">
                        {stringToList(info["Recommended-Food"]).map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Health-Specific Guidelines</h2>
          <div className="space-y-6">
            {Object.entries(data["health-Specific guidlines"]).map(([category, content]) => (
              <div key={category} className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-700 mb-3 capitalize">
                  {category.replace(/-/g, ' ')}
                </h3>
                <ul className="list-disc ml-6 space-y-2">
                  {textToPoints(content).map((point, index) => (
                    <li key={index} className="text-gray-700">{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DietGuidelines;