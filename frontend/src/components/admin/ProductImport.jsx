import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../../services';
import toast from 'react-hot-toast';
import { Upload, Download } from 'lucide-react';
import { fetchClients } from '../../redux/slices/clientsSlice';

const ProductImport = () => {
  const dispatch = useDispatch();
  const { list: clients, loading: clientsLoading } = useSelector((state) => state.clients);

  const [selectedClient, setSelectedClient] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Fetch clients on mount (Redux will handle caching)
    dispatch(fetchClients());
  }, [dispatch]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const handleUpload = async () => {
    if (!selectedClient || !file) {
      toast.error('Please select a client and file');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('clientId', selectedClient);

    try {
      const response = await api.post('/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(response.data.message);
      setFile(null);
    } catch (error) {
      toast.error('Failed to import products');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,description,price,currency,category,sku,stock,tags
"Royal Blue Silk Saree","Handwoven pure silk saree",8500,INR,Sarees,SS001,5,"silk,wedding,traditional"
"Cotton Kurta Set","Comfortable cotton kurta with palazzo",2499,INR,"Kurta Sets",CK002,12,"cotton,casual"`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product_import_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Import</h1>
        <p className="text-gray-600 mt-1">Bulk import products via CSV</p>
      </div>

      <div className="card mb-6">
        <div className="mb-6">
          <button onClick={downloadTemplate} className="btn-secondary">
            <Download className="w-4 h-4 mr-2 inline" />
            Download CSV Template
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Client
          </label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="input-field"
          >
            <option value="">-- Select a client --</option>
            {clients.map((client) => (
              <option key={client._id} value={client._id}>
                {client.businessName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="input-field"
          />
          {file && (
            <p className="text-sm text-gray-600 mt-2">Selected: {file.name}</p>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={!selectedClient || !file || uploading}
          className="btn-primary"
        >
          <Upload className="w-4 h-4 mr-2 inline" />
          {uploading ? 'Uploading...' : 'Import Products'}
        </button>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold mb-3">CSV Format Guide</h3>
        <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono">
          <p className="mb-2">Required columns:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>name - Product name</li>
            <li>description - Product description</li>
            <li>price - Price (number)</li>
            <li>currency - Currency code (USD, INR, etc.)</li>
          </ul>
          <p className="mt-3 mb-2">Optional columns:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>category - Product category</li>
            <li>sku - Stock keeping unit</li>
            <li>stock - Available quantity</li>
            <li>tags - Comma-separated tags</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductImport;
