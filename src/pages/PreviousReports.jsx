import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  FileText,
  User,
  Clock,
  ChevronDown,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

function PreviousReports({ admin }) {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Production API configuration
  const API_BASE_URL = 'https://ayuras.life/api/v1';

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('adminToken');
  };

  // Fetch reports from production API
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const authToken = getAuthToken();

      if (!authToken) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/orders/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear tokens and redirect to login
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          localStorage.removeItem('adminData');
          localStorage.removeItem('adminRole');
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Filter only orders that have reports (report submitted or completed status)
        const ordersWithReports = data.orders.filter(order =>
          (order.status === 'report submitted' || order.status === 'completed') &&
          order.reportUrl
        );

        // Transform orders into report format
        const transformedReports = ordersWithReports.map(order => ({
          id: order._id,
          reportId: `RPT-${order._id.slice(-6).toUpperCase()}`,
          patientName: order.patientInfo.name,
          patientId: order.patientInfo.memberId || order.patientInfo.userId || 'N/A',
          testType: order.cartItems.map(item => item.testName).join(', '),
          labs: [...new Set(order.cartItems.map(item => item.lab))].join(', '),
          reportDate: order.createdAt,
          completedDate: order.updatedAt,
          status: order.status,
          priority: determinePriority(order),
          reportUrl: order.reportUrl,
          totalPrice: order.totalPrice,
          paymentMethod: order.paymentMethod,
          technicianNotes: order.technicianNotes
        }));

        setReports(transformedReports);
        setFilteredReports(transformedReports);
      } else {
        throw new Error(data.message || 'Failed to fetch reports');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message);

      // If authentication error, redirect to login
      if (err.message.includes('Authentication failed')) {
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Determine priority based on order characteristics
  const determinePriority = (order) => {
    const totalPrice = order.totalPrice || 0;
    const testCount = order.cartItems?.length || 0;

    if (totalPrice > 5000 || testCount > 5) return 'high';
    if (totalPrice > 2000 || testCount > 2) return 'normal';
    return 'normal';
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = reports;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.testType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.labs.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(report => report.status === selectedStatus);
    }

    // Date range filter
    if (selectedDateRange !== 'all') {
      const today = new Date();
      const filterDate = new Date();

      switch (selectedDateRange) {
        case 'today': {
          filterDate.setDate(today.getDate());
          break;
        }
        case 'week': {
          filterDate.setDate(today.getDate() - 7);
          break;
        }
        case 'month': {
          filterDate.setMonth(today.getMonth() - 1);
          break;
        }
        case 'quarter': {
          filterDate.setMonth(today.getMonth() - 3);
          break;
        }
        default:
          break;
      }

      filtered = filtered.filter(report =>
        new Date(report.completedDate) >= filterDate
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'date': {
          aValue = new Date(a.completedDate);
          bValue = new Date(b.completedDate);
          break;
        }
        case 'patient': {
          aValue = a.patientName.toLowerCase();
          bValue = b.patientName.toLowerCase();
          break;
        }
        case 'test': {
          aValue = a.testType.toLowerCase();
          bValue = b.testType.toLowerCase();
          break;
        }
        case 'priority': {
          const priorityOrder = { urgent: 3, high: 2, normal: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        }
        default: {
          aValue = a[sortBy];
          bValue = b[sortBy];
          break;
        }
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredReports(filtered);
  }, [reports, searchTerm, selectedStatus, selectedDateRange, sortBy, sortOrder]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'report submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = (report) => {
    if (report.reportUrl) {
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = report.reportUrl;
      link.download = `${report.reportId}_${report.patientName.replace(/\s+/g, '_')}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleView = (report) => {
    if (report.reportUrl) {
      window.open(report.reportUrl, '_blank');
    }
  };

  const handleExternalLink = (report) => {
    if (report.reportUrl) {
      window.open(report.reportUrl, '_blank');
    }
  };

  const handleRetry = () => {
    const authToken = getAuthToken();
    if (!authToken) {
      window.location.href = '/admin/login';
      return;
    }
    fetchReports();
  };

  const handleLoginRedirect = () => {
    window.location.href = '/admin/login';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        <span className="ml-3 text-gray-600">Loading reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Reports</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={handleRetry}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
          {error.includes('authentication') && (
            <button
              onClick={handleLoginRedirect}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Previous Reports</h1>
          <p className="text-gray-600 mt-1">View and manage all completed lab reports</p>
          {admin && (
            <p className="text-sm text-gray-500 mt-1">
              Logged in as: {admin.name || admin.email} ({admin.role || 'Admin'})
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchReports}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Refresh
          </button>
          <div className="text-sm text-gray-500">
            Total Reports: {filteredReports.length}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by patient name, report ID, test type, or lab..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="report submitted">Report Submitted</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="patient-asc">Patient A-Z</option>
              <option value="patient-desc">Patient Z-A</option>
              <option value="priority-desc">Priority High-Low</option>
              <option value="test-asc">Test Type A-Z</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Type & Labs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.reportId}</div>
                        <div className="text-sm text-gray-500">₹{report.totalPrice}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.patientName}</div>
                        <div className="text-sm text-gray-500">{report.patientId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={report.testType}>
                      {report.testType}
                    </div>
                    <div className="text-sm text-gray-500 max-w-xs truncate" title={report.labs}>
                      {report.labs}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(report.priority)}`}>
                      {report.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {new Date(report.completedDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(report)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                        title="View Report"
                        disabled={!report.reportUrl}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(report)}
                        className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50"
                        title="Download Report"
                        disabled={!report.reportUrl}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExternalLink(report)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-50"
                        title="Open External Link"
                        disabled={!report.reportUrl}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedStatus !== 'all' || selectedDateRange !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'No previous reports available yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Reports</p>
              <p className="text-lg font-semibold text-gray-900">{reports.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-lg font-semibold text-gray-900">
                {reports.filter(r => new Date(r.completedDate).getMonth() === new Date().getMonth()).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <User className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Unique Patients</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Set(reports.map(r => r.patientId)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Download className="w-8 h-8 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Available Downloads</p>
              <p className="text-lg font-semibold text-gray-900">{reports.filter(r => r.reportUrl).length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviousReports;
