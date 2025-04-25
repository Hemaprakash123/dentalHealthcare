import { FaFileUpload } from 'react-icons/fa';
import { useState, useRef } from "react";
import axios from 'axios';

function Statement(props) {
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [transactions, setTransactions] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({
    success: false,
    error: false,
    message: ''
  });
  const fileInputRef = useRef(null);

  const handleFile = async () => {
    if (!selectedPdf) {
      setUploadStatus({
        success: false,
        error: true,
        message: 'No PDF selected'
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus({ success: false, error: false, message: '' });

      const reader = new FileReader();
      reader.onloadend = async () => {
        const fileData = reader.result.split(',')[1];
        const filename = selectedPdf.name.replace("C:\\fakepath\\", "");
        
        try {
          const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/en/uploadstatement`, { 
            file: fileData, 
            filename: filename 
          });
          const transactionsData = response.data.data;
          
          try{
            const jsonData=JSON.parse(transactionsData)
            setTransactions(jsonData);
          }
          catch (error){
            try{
              const baseString = transactionsData.substring(0, transactionsData.lastIndexOf(']')) + ']';
              const closedString = baseString + '}';
              const jsonData=JSON.parse(closedString);
              setTransactions(jsonData);
            }
            catch (repairError){
              try{
                const baseString = transactionsData.substring(0, transactionsData.lastIndexOf('{'));
                const lastStatementEnd = baseString.lastIndexOf('}');
                const completedString = baseString.substring(0, lastStatementEnd + 1) + ']}';
                
                const jsondata= JSON.parse(completedString);
                setTransactions(jsondata);
              }
              catch(finalError){
                console.error('Could not completely repair the JSON string');

              }
            }
            

          }
          
          setUploadStatus({
            success: true,
            error: false,
            message: 'PDF uploaded successfully!'
          });
          
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setSelectedPdf(null);
          setPdfName('');
        } catch (error) {
          console.log("error is",error)
          setUploadStatus({
            success: false,
            error: true,
            message: error.response?.data?.message || 'Upload failed. Please try again.'
          });
        }
      };
      
      reader.readAsDataURL(selectedPdf);
    } catch (error) {
      setUploadStatus({
        success: false,
        error: true,
        message: 'Error processing file'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePdfUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedPdf(file);
      setPdfName(file.name);
      setUploadStatus({ success: false, error: false, message: '' });
    } else {
      setSelectedPdf(null);
      setPdfName('');
      setUploadStatus({
        success: false,
        error: true,
        message: 'Please upload a valid PDF file'
      });
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Calculate total debit and credit
  const calculateTotals = () => {
    if (!transactions?.statements || !Array.isArray(transactions.statements)) 
      return { totalDebit: 0, totalCredit: 0 };

    const totalDebit = transactions.statements
      .filter(transaction => transaction.is_debit)
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalCredit = transactions.statements
      .filter(transaction => !transaction.is_debit)
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return { totalDebit, totalCredit };
  };

  const { totalDebit, totalCredit } = calculateTotals();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center space-x-4 mb-4">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handlePdfUpload}
          accept=".pdf"
        />
        
        <button
          onClick={triggerFileInput}
          className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          <FaFileUpload className="mr-2" />
          Select PDF
        </button>

        {pdfName && (
          <span className="text-sm text-gray-600 truncate max-w-[200px]">
            {pdfName}
          </span>
        )}

        <button
          onClick={handleFile}
          disabled={!selectedPdf || isUploading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {uploadStatus.error && (
        <div className="mt-2 text-red-600 text-sm">
          {uploadStatus.message}
        </div>
      )}
      {uploadStatus.success && (
        <div className="mt-2 text-green-600 text-sm">
          {uploadStatus.message}
        </div>
      )}

      {transactions && transactions.statements && (
        <div className="mt-6">
          <div className="mb-4 flex justify-between items-center">
            <div className="text-lg font-semibold">
              Statement Validity: 
              <span className={`ml-2 ${transactions.is_valid ? 'text-green-600' : 'text-red-600'}`}>
                {transactions.is_valid ? 'Valid' : 'Invalid'}
              </span>
            </div>
            <div className="flex space-x-4">
              <div className="bg-green-100 p-3 rounded-md">
                <span className="font-semibold">Total Credit: </span>
                <span className="text-green-700">₹{totalCredit.toFixed(2)}</span>
              </div>
              <div className="bg-red-100 p-3 rounded-md">
                <span className="font-semibold">Total Debit: </span>
                <span className="text-red-700">₹{totalDebit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Expense Name</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center">Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.statements && transactions.statements.map((transaction, index) => (
                  <tr 
                    key={index} 
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3">{transaction.name_of_expense}</td>
                    <td className="p-3 text-right">
                      <span className={transaction.is_debit ? 'text-red-600' : 'text-green-600'}>
                        ₹{transaction.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span 
                        className={`px-2 py-1 rounded-full text-xs ${
                          transaction.is_debit 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {transaction.is_debit ? 'Debit' : 'Credit'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Statement;