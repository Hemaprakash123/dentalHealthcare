import React,{ useState, useEffect, useRef } from "react";
import Editsvg from "./Editsvg";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import pdfjs from 'pdfjs-dist';
//import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { UserIcon } from 'lucide-react'

//pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;


export default function Doctoranalysis() {
  const precautionsRef = useRef(null);
  const [precautionsHeight, setPrecautionsHeight] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [pData, setPData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [reportPrecautions, setReportPrecautions] = useState([]);
  const [isVerify, setIsVerify] = useState(false);
  const [advice, setAdvice] = useState("");
  const [reportsDate, setReportsDate] = useState(null);
  const [url, setUrl] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [scale, setScale] = useState(1);
  const [pic, setPic] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [loaded, setloaded] = useState(false);


  useEffect(() => {
    setIsVisible(true);
  }, []);

  // useEffect(() => {
  //   const fetchImage = async () => {
  //     // Simulate async fetching if needed
  //     const imageUrl = `/en/image/${reportData.image}`;
  //     setPic(imageUrl);
  //   };
    
  //   fetchImage();
  // }, [reportData.image]);
  const canvasRef = useRef(null);
  const popupContentRef = useRef(null);
  const containerRef = useRef(null);



  useEffect(() => {
    const loadPdf = async () => {
      if (url) {
        try {
          const pdfData = await fetch(url).then((res) => res.arrayBuffer());
          const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
          setPdfDocument(pdf);
          renderPage(pdf, 1, canvasRef.current, 1);
        } catch (error) {
          console.error('Error loading PDF:', error);
        }
      }
    };

    loadPdf();
  }, [url]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && isPopupOpen && pdfDocument) {
        updateScale();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isPopupOpen, pdfDocument]);

  const updateScale = async () => {
    if (!pdfDocument || !containerRef.current) return;

    const page = await pdfDocument.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const containerWidth = containerRef.current.clientWidt
    const containerHeight = containerRef.current.clientHeight;

    const widthScale = containerWidth / viewport.width;
    const heightScale = containerHeight / viewport.height;
    const newScale = Math.min(widthScale, heightScale) * 2;

    setScale(newScale);
    renderAllPages(newScale);
  };

  const renderPage = async (pdf, pageNum, canvas, currentScale) => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: currentScale });
    canvas.height = viewport.height * 2;
    canvas.width = viewport.width * 2;
    const context = canvas.getContext('2d');
    context.scale(2, 2);

    await page.render({
      canvasContext: context,
      viewport: viewport,
      renderInteractiveForms: true,
      canvasFactory: {
        create: function (width, height) {
          const canvas = document.createElement('canvas');
          canvas.width = width * 2;
          canvas.height = height * 2;
          return canvas;
        },
        reset: function (canvasAndContext, width, height) {
          canvasAndContext.canvas.width = width * 2;
          canvasAndContext.canvas.height = height * 2;
        },
        destroy: function (canvasAndContext) {
          // no-op
        }
      }
    });
  };

  const renderAllPages = async (currentScale) => {
    if (!pdfDocument || !popupContentRef.current) return;

    popupContentRef.current.innerHTML = '';
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.style.marginBottom = '10px';
      await renderPage(pdfDocument, pageNum, canvas, currentScale);
      popupContentRef.current.appendChild(canvas);
    }
  };


  useEffect(() => {
    if (location.state) {
      const { id, pid, isDoctor, patientData } = location.state;
      setPatientId(pid);
      setReportId(id);
      setDoctor(isDoctor);
      setPData(patientData);
    }
  }, [location]);

  useEffect(() => {
    const fetchData = async () => {
      if (reportId && patientId) {
        try {
          await getReport();
          await getDates();
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchData();
  }, [reportId, patientId]);

  useEffect(() => {
    const loadPdfData = async () => {
      if (reportData) {
        try {
          await getUrl();
        } catch (error) {
          console.error("Error getting URL:", error);
        }
      }
    };

    loadPdfData();
  }, [reportData]);

  const openPopup = async () => {
    setIsPopupOpen(true);
    setTimeout(updateScale, 0);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    if (popupContentRef.current) {
      popupContentRef.current.innerHTML = '';
    }
  };

  async function getUrl() {
    try {
      setloaded(false);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/en/pdfid/${reportData.file}`, { responseType: 'arraybuffer' });
      const binaryData = new Uint8Array(response.data);
      const blob = new Blob([binaryData], { type: 'application/pdf' });
      let url = window.URL.createObjectURL(blob);
      setUrl(url);
      setloaded(true);


    } catch (error) {
      console.error("Error fetching report:", error);
    }
  }

  async function getReport() {
    try {
      console.log(reportId)
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/en/getreport/${reportId}`);
      console.log(response.data)
      console.log(response.data.image)
      setReportData(response.data);
      setReportPrecautions(response.data.precautions);
      setIsVerify(response.data.isVerified);
      setAdvice(response.data.doctorNotes || "");
    } catch (error) {
      console.error("Error fetching report:", error);
    }
  }

  async function getDates() {
    try {
      setloaded(false)
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/en/getprevreports`, { patientId, reportId });
      setReportsDate(response.data);
    } catch (error) {
      console.error("Error fetching dates:", error);
    }
  }

  const handleEditClick = () => {
    setIsEditing(!isEditing);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setReportPrecautions(e.target.value.split("\n"));
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  const handleVerifyClick = async () => {
    try {
      setIsVerify(true);
      const updatedReportData = { ...reportData, isVerified: true };
  
      // Send POST request
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/en/saveprecautions`, {
        reportId,
        precautions: reportPrecautions,
        doctorNotes: advice,
        patientId,
      });
  
      // Update report data state
      setReportData(response.data);
      console.log("Report verified successfully:", response);
  
      // Trigger success notification
      if (Notification.permission === "granted") {
        new Notification("Report Verified", {
          body: "The report has been successfully verified.",
          icon: "https://via.placeholder.com/50", // Replace with a relevant icon URL
        });
      }
      setTimeout(() => window.location.reload(),2000)
    } catch (error) {
      console.error("Error verifying report:", error);
  
      // Trigger error notification
      if (Notification.permission === "granted") {
        new Notification("Verification Failed", {
          body: "There was an error verifying the report. Please try again.",
          icon: "https://via.placeholder.com/50", // Replace with a relevant icon URL
        });
      }
    }
  };

  const handlePatient = (id) => {
    navigate('/doctoranalysis', {
      replace: true,
      state: { id, pid: patientId, isDoctor: doctor, patientData: pData }
    });
    window.scrollTo(0, 0);
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f9f9f9",
    fontFamily: "Arial, sans-serif",
  };

  const spinnerStyle = {
    width: "60px",
    height: "60px",
    border: "6px solid rgba(0, 0, 0, 0.1)",
    borderTop: "6px solid #3498db",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  };

  const dotsContainerStyle = {
    display: "flex",
    gap: "8px",
    marginTop: "20px",
  };

  const dotStyle = (delay) => ({
    width: "12px",
    height: "12px",
    backgroundColor: "#3498db",
    borderRadius: "50%",
    animation: `bounce 0.6s ease-in-out infinite`,
    animationDelay: delay,
  });

  const textStyle = {
    fontSize: "1.2em",
    color: "#555",
    marginTop: "10px",
  };

  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    }
  `;


  if (!reportData || !reportsDate || !pData || !loaded) {
    return  <div style={containerStyle}>
    <style>{keyframes}</style>
    <div style={dotsContainerStyle}>
      <div style={dotStyle("0s")}></div>
      <div style={dotStyle("0.2s")}></div>
      <div style={dotStyle("0.4s")}></div>
    </div>
    <div style={textStyle}>Loading, please wait...</div>
  </div>
  }
  const handleForumClick = () => {
    navigate('/Forum');  // Add this route in your router
  };

  // 
  const imagemetrics = reportData.imagemetrics;
  console.log("imagemetrics : ",imagemetrics);
  let metrics = [];
  

  if (imagemetrics && imagemetrics.length > 0) {
    metrics = imagemetrics.map(metric => {
      const [label, valueStr] = metric.split(': ');
      return {
        label,
        value: parseFloat(valueStr)
      };
    });
  }

  return (
    reportData && reportsDate && pData && url &&(
      <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden " style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
        <div className="layout-container flex h-full grow flex-col">
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f2f4] px-10 py-3">
            <div className="flex items-center gap-4 text-[#111418]">
              <div className="size-4">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path></svg>
              </div>
              <h2 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em]">Saanjh sahayak</h2>
            </div>
            <div className="flex flex-1 justify-end gap-8">
              <div className="flex items-center gap-9">
                {/* <a className="text-[#111418] text-sm font-medium leading-normal" href="#">Home</a> */}
                <a className="text-[#111418] text-sm font-medium leading-normal" href="#">Patients</a>
                {/* <a className="text-[#111418] text-sm font-medium leading-normal" href="#">Appointments</a> */}
                <a className="text-[#111418] text-sm font-medium leading-normal" href="#">Reports</a>
                {/* <a className="text-[#111418] text-sm font-medium leading-normal" href="#">Invoices</a> */}
                <button
           onClick={handleForumClick}
          className="flex items-center justify-center px-4 py-2 rounded-xl bg-[#e7eef4] text-[#0d151c] font-bold text-sm hover:bg-[#d8e3ed] transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M216,40H40A16,16,0,0,0,24,56V184a16,16,0,0,0,16,16H57.1l-1.77,13.3a16,16,0,0,0,4.41,13.31A15.93,15.93,0,0,0,71.87,232,16.4,16.4,0,0,0,74,231.81l43.48-15.49h98.56A16,16,0,0,0,232,200V56A16,16,0,0,0,216,40ZM40,56H216V184H112.79a16,16,0,0,0-5.41.94L72,197.34l1.87-14a16,16,0,0,0-16-17.31H40ZM80,144a12,12,0,1,1,12-12A12,12,0,0,1,80,144Zm48,0a12,12,0,1,1,12-12A12,12,0,0,1,128,144Zm48,0a12,12,0,1,1,12-12A12,12,0,0,1,176,144Z"/>
            </svg>
            Health Forum
          </div>
        </button>
              </div>
              <div className="flex gap-2">
                <button
                  className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 bg-[#f0f2f4] text-[#111418] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
                >
                  <div className="text-[#111418]" data-icon="MagnifyingGlass" data-size="20px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
                      ></path>
                    </svg>
                  </div>
                </button>
                <button
                  className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 bg-[#f0f2f4] text-[#111418] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
                >
                  <div className="text-[#111418]" data-icon="Bell" data-size="20px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"
                      ></path>
                    </svg>
                  </div>
                </button>
                <button
                  className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 bg-[#f0f2f4] text-[#111418] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
                >
                  <div className="text-[#111418]" data-icon="ChatCircleDots" data-size="20px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM84,116a12,12,0,1,0,12,12A12,12,0,0,0,84,116Zm88,0a12,12,0,1,0,12,12A12,12,0,0,0,172,116Zm60,12A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Zm-16,0A88,88,0,1,0,51.81,172.06a8,8,0,0,1,.66,6.54L40,216,77.4,203.53a7.85,7.85,0,0,1,2.53-.42,8,8,0,0,1,4,1.08A88,88,0,0,0,216,128Z"
                      ></path>
                    </svg>
                  </div>
                </button>
              </div>
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                style={{ backgroundImage: 'url("https://cdn.usegalileo.ai/stability/1c59f8b8-2f0d-4280-9e6d-75d6c0cee0d6.png")' }}
              ></div>
            </div>
          </header>
          <div className="px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <p className="text-[#111418] text-4xl font-black leading-tight tracking-[-0.033em] min-w-72 content-center">Patient Information</p>
              </div>
              <div className="flex p-4 @container">
                <div className="flex w-full flex-col gap-4 @[520px]:flex-row @[520px]:justify-between @[520px]:items-start">
                  <div className="flex gap-4">
                  <div className="bg-gray-200 rounded-full w-32 h-32 flex items-center justify-center">
                  <UserIcon className="text-gray-500 w-20 h-20" />
                </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em]">{pData.name}</p>
                      <p className="text-[#637588] text-base font-normal leading-normal">{pData.gender}, Age {calculateAge(pData.DOB)}</p>
                      <p className="text-[#637588] text-base font-normal leading-normal"> Blood Group: {pData.bloodGroup}</p>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Known Conditions</h3>
              <div className="flex gap-3 p-3 flex-wrap pr-4">
                {pData.chronics.map((condition, index) => (
                  <div key={index} className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-[#f0f2f4] pl-4 pr-4">
                    <p className="text-[#111418] text-sm font-medium leading-normal">{condition}</p>
                  </div>
                ))}
              </div>
              <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Current Report</h3>
              {isPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div ref={containerRef} className="bg-white rounded-lg w-3/4 max-w-4xl h-5/6 flex flex-col">
                    <div className="flex justify-between items-center p-4">
                      <h2 className="text-xl font-bold">PDF Viewer</h2>
                      <button
                        onClick={closePopup}
                        className="px-4 py-2 bg-red-500 text-white rounded"
                      >
                        Close
                      </button>
                    </div>
                    <div
                      ref={popupContentRef}
                      className="flex-grow overflow-y-auto scrollbar-hide p-4"
                      style={{
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none',
                      }}
                    >
                      {/* PDF pages will be rendered here */}
                      <iframe src={url} width="100%" height="500px" style={{ border: "none" }}></iframe>
                    </div>
                  </div>
                </div>
              )}
              <div onClick={openPopup}
                className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between hover:bg-slate-100 hover:scale-105 transition transform duration-300">
                <div className="flex items-center gap-4">
                  <div className="text-[#111418] flex items-center justify-center rounded-lg bg-[#f0f2f4] shrink-0 size-12" data-icon="File" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"
                      ></path>
                    </svg>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-[#111418] text-base font-medium leading-normal line-clamp-1">Test Report</p>
                    <p className="text-[#637588] text-sm font-normal leading-normal line-clamp-2">Report from 27 June 2024</p>
                  </div>
                </div>
                <div className="shrink-0">
                  <div className="text-[#111418] flex size-7 items-center justify-center" data-icon="CaretRight" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Analysis</h3>
              <div className="text-lg   tracking-[-0.020em] ">
                <p className="px-4 pb-2 pt-4">{reportData.summary}</p>
              </div>
              <img 
                className="profile-picturePC" 
                src={reportData.image || "https://res.cloudinary.com/djlgmbop9/image/upload/v1736072172/ghjs7zxoqmaopzamdztk.jpg"}
                alt="Profile Picture"
                style={{ width: '300px', height: 'auto' ,justifyContent:'center',alignItems:'center',margin:'auto'}} 
              />
              <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg" style={{justifyContent:'center',alignItems:'center',margin:'auto'}}>
                <style>
                  {`
                    @keyframes moveGradient {
                      0% { background-position: 0% 50%; }
                      50% { background-position: 100% 50%; }
                      100% { background-position: 0% 50%; }
                    }
                    
                    .animated-bar {
                      background: linear-gradient(
                        90deg, 
                        rgba(37, 99, 235, 1) 0%,
                        rgba(96, 165, 250, 1) 50%,
                        rgba(37, 99, 235, 1) 100%
                      );
                      background-size: 200% 100%;
                      animation: moveGradient 2s linear infinite;
                    }
                  `}
                </style>
                <h2 className="text-xl font-bold mb-4">Analysis Results</h2>
                <div className="space-y-3">
                  {metrics && metrics.length > 0 ? metrics.map((metric, index) => (
                    <div 
                      key={index} 
                      className="w-full transform transition-all duration-500 ease-out"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: `translateX(${isVisible ? 0 : -20}px)`,
                        transition: `all 500ms ${index * 100}ms ease-out`
                      }}
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-300">
                          {metric.label}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {(metric.value * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-700 ease-out animated-bar"
                          style={{
                            width: isVisible ? `${metric.value * 100}%` : '0%'
                          }}
                        />
                      </div>
                    </div>
                  )) : "Report Analysis yet to be done"}
                </div>
              </div>
              <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Precautions</h3>
              <div className="p-4 @container">
                <div
                  className="flex flex-1 items-start justify-between gap-4 rounded-xl border border-[#dce0e5] bg-white p-5 @[480px]:flex-row @[480px]:items-center"
                  style={{ height: precautionsHeight ? `${precautionsHeight + 20}px` : 'auto' }}
                >
                  <div className="flex flex-col gap-1 flex-1">
                    {(isEditing && !reportData.isVerified) ? (
                      <textarea
                        defaultValue={reportPrecautions.join("\n")}
                        className="border border-[#dce0e5] rounded-xl p-2 flex-1"
                        onChange={e => setReportPrecautions(e.target.value.split("\n"))}
                      />
                    ) : (
                      <ul
                        className="text-[#637588] text-base font-normal leading-normal flex-1"
                        ref={precautionsRef}
                      >
                        {reportPrecautions.map((precaution, index) => (
                          <li key={index}>{precaution}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    onClick={handleEditClick}
                    className={` ${isVerify ? 'hidden' : ''}  flex min-w-[60px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1b7ada] text-white text-sm font-medium leading-normal`}
                  >
                    {isEditing ? <span className="truncate">Save</span> : <Editsvg />}
                  </button>
                </div>
              </div>
              <h3 className={`text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4`} >Predictions</h3>
              <div className={`p-4 @container`}>
                <div className="flex flex-1  items-start justify-between gap-4 rounded-xl border border-[#dce0e5] bg-white p-5 @[480px]:flex-row @[480px]:items-center">
                  <div className="flex flex-col gap-1 flex-1">

                    <ul
                      className="text-[#637588] text-base font-normal leading-normal flex-1"
                      ref={precautionsRef}
                    >
                      {reportData.possibleDiseases.map((dis, index) => (
                        <li key={index}>{dis}</li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
              
              <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Doctor's Advice</h3>
              <div className={`flex max-w-[480px] flex-1 flex-wrap items-end gap-4 px-4 py-3`}>
                <label className="flex flex-col min-w-40 flex-1">
                  {!reportData.isVerified ? (
                    <textarea
                      defaultValue={reportData.doctorNotes}
                      className={`border border-[#dce0e5] rounded-xl p-2 flex-1`}
                      onChange={e => setAdvice(e.target.value)}
                    />
                  ) : (
                    <div className="text-[#637588] text-base font-normal leading-normal flex-1"
                      ref={precautionsRef}>
                      {reportData.doctorNotes}
                    </div>
                  )}
                </label>
              </div>
              <div className="flex px-4 py-3 justify-end">
                <button
                  onClick={handleVerifyClick}
                  className={`${reportData.isVerified ? 'hidden' : ''} flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1b7ada] text-white text-sm font-bold leading-normal tracking-[0.015em]`}

                >
                  <span className="truncate">verify</span>
                </button>
              </div>
              <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Previous Reports</h3>
              <div>
                {reportsDate.map((report, index) => (
                  <div
                    onClick={() => { handlePatient(report.file) }}
                    key={index}
                    className="flex items-center gap-4  px-4 min-h-[72px] py-2 justify-between cursor-pointer hover:bg-slate-100 hover:scale-105 transition transform duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-[#0d151c] flex items-center justify-center rounded-lg bg-[#e7eef4] shrink-0 size-12" data-icon="File" data-size="24px" data-weight="regular">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                          <path
                            d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"
                          ></path>
                        </svg>
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="text-[#0d151c] text-base font-medium leading-normal line-clamp-1">{report.date}</p>
                        <p className="text-[#49779c] text-sm font-normal leading-normal line-clamp-2">{report.specialistReq}</p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <div className="text-[#0d151c] flex size-7 items-center justify-center" data-icon="CaretRight" data-size="24px" data-weight="regular">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </div>
        </div>
      </div>
    )

  )
}
