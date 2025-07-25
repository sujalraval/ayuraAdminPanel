import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminLogin() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value.trim()
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // CORS-compatible fetch configuration
            const res = await fetch('https://ayuras.life/api/v1/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    // Remove any custom headers that might trigger preflight issues
                },
                credentials: 'include', // ✅ CRITICAL: Enable cookies/sessions for CORS
                mode: 'cors', // ✅ Explicitly set CORS mode
                body: JSON.stringify(formData)
            });

            // ✅ Better error handling for network issues
            if (!res) {
                throw new Error('Network error: Unable to connect to server');
            }

            const data = await res.json();
            console.log('Login response:', data);

            if (!res.ok) {
                if (res.status === 401) {
                    throw new Error('Invalid credentials');
                } else if (res.status === 403) {
                    throw new Error('Account is deactivated or CORS policy violation');
                } else if (res.status === 0 || res.status >= 500) {
                    throw new Error('Server error. Please try again later.');
                } else {
                    throw new Error(data.message || `HTTP Error: ${res.status}`);
                }
            }

            if (!data.token || !data.admin) {
                throw new Error('Invalid response format from server');
            }

            // Store the token and admin data
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminData', JSON.stringify({
                id: data.admin.id,
                role: data.admin.role,
                email: data.admin.email,
                name: data.admin.name,
                permissions: data.admin.permissions || []
            }));

            // ✅ Store token expiry if provided
            if (data.expiresIn) {
                const expiryTime = new Date().getTime() + (data.expiresIn * 1000);
                localStorage.setItem('adminTokenExpiry', expiryTime.toString());
            }

            toast.success('Login successful!');

            // Redirect based on role
            if (data.admin.role === 'superadmin') {
                navigate('/admin/dashboard');
            } else if (data.admin.role === 'admin') {
                navigate('/admin/orders');
            } else {
                navigate('/admin/lab-tests');
            }

        } catch (err) {
            console.error('Login error:', err);

            // ✅ Better error handling for different error types
            let errorMessage = 'Login failed. Please try again.';

            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                errorMessage = 'Network error: Please check your internet connection and try again.';
            } else if (err.message.includes('CORS')) {
                errorMessage = 'Server configuration error. Please contact support.';
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Admin Log In
                    </h2>
                    {/* ✅ Add environment indicator for debugging */}
                    {process.env.NODE_ENV === 'development' && (
                        <p className="text-center text-sm text-gray-500 mt-2">
                            API: https://ayuras.life/api/v1
                        </p>
                    )}
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-200 ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
