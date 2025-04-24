'use client';

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.username === 'tester' && formData.password === '123456') {
      // Set auth cookie
      Cookies.set('auth', 'true', { path: '/' });
      onLoginSuccess();
    } else {
      setError('Invalid username or password');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
  };

  useEffect(() => {
    setIsFormValid(formData.username.trim() !== '' && formData.password.trim() !== '');
  }, [formData]);

  return (
    <div className="min-h-screen bg-[#F8F9FE] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-[#4745D0] text-4xl font-bold mb-2">Aurora</h1>
        
          <p className="text-gray-600">
            Get data you can trust and the insights you need to take action and drive growth.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4745D0] focus:border-transparent transition-all text-gray-900"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4745D0] focus:border-transparent transition-all text-gray-900"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <button
                type="submit"
                disabled={!isFormValid}
                className="w-full bg-[#4745D0] text-white py-3 px-4 rounded-lg hover:bg-[#3d3bb7] focus:outline-none focus:ring-2 focus:ring-[#4745D0] focus:ring-offset-2 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#4745D0]"
              >
                Sign in
              </button>

              <button
                type="button"
                className="w-full bg-white text-[#4745D0] py-3 px-4 rounded-lg border-2 border-[#4745D0] hover:bg-[#F8F9FE] focus:outline-none focus:ring-2 focus:ring-[#4745D0] focus:ring-offset-2 transition-colors duration-200 font-medium"
                onClick={() => alert('Demo: Only tester/123456 credentials work')}
              >
                Create account
              </button>
            </div>
          </form>
        </div>

        <div className="text-center space-y-4">
    
          <p className="text-sm text-gray-600">
            Trusted by industry-leading companies around the world
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 