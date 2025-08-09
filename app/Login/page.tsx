'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaGlobeAsia } from 'react-icons/fa';

const Login: React.FC = () => {
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [Department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);

  // Store raw lock date (ISO format)
  const [lockUntil, setLockUntil] = useState<string | null>(null);
  // Store formatted date (client-only)
  const [formattedLockUntil, setFormattedLockUntil] = useState<string | null>(null);

  const router = useRouter();

  // Format lockUntil date client-side only
  useEffect(() => {
    if (lockUntil) {
      setFormattedLockUntil(new Date(lockUntil).toLocaleString());
    }
  }, [lockUntil]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!Email || !Password || !Department) return toast.error('All fields are required!');

    setLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email, Password, Department }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.Department !== Department) {
          toast.error('Department mismatch!');
          setLoading(false);
          return;
        }

        // ✅ Log login activity
        await fetch('/api/log-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: Email,
            department: Department,
            status: 'login',
            timestamp: new Date().toISOString(),
          }),
        });

        toast.success('Login successful!');
        setTimeout(() => {
          router.push(`/Module${result.Department}/${result.Department}/Dashboard?id=${encodeURIComponent(result.userId)}`);
        }, 1000);
      } else {
        if (result.lockUntil) {
          setLockUntil(result.lockUntil); // store raw date string
          toast.error(`Account locked! Try again after ${new Date(result.lockUntil).toLocaleString()}.`);
        } else {
          toast.error(result.message || 'Login failed!');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred while logging in!');
    } finally {
      setLoading(false);
    }
  }, [Email, Password, Department, router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-cover bg-left" style={{ backgroundImage: "url('/ecoshift-wallpaper.jpg')" }}>
      <div className="flex w-full max-w-4xl bg-white rounded-sm shadow-xl overflow-hidden">
        <ToastContainer className="text-xs" />

        {/* Left Side - Login */}
        <div className="flex flex-col justify-center w-full md:w-1/2 p-8 mt-10">
          {formattedLockUntil && (
            <div className="mb-4 text-center">
              <p className="text-red-600 text-xs font-bold">
                Account locked! Try again after: {formattedLockUntil}
              </p>
            </div>
          )}

          <h1 className="mb-6 font-bold text-2xl text-gray-800">
            Log in to your account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              placeholder="Email"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border-b border-gray-300 text-xs focus:outline-none focus:border-green-700"
            />
            <input
              type="password"
              placeholder="Password"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border-b border-gray-300 text-xs focus:outline-none focus:border-green-700"
            />
            <select
              value={Department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 border-b border-gray-300 bg-white text-xs focus:outline-none focus:border-green-700"
            >
              <option value="">Select Department</option>
              <option value="CSR">CSR</option>
              <option value="Sales">Sales</option>
              <option value="BD">Business Development</option>
            </select>
            <button
              type="submit"
              className="w-full py-3 bg-green-800 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors duration-200 shadow-md"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-4 mb-3 text-[10px] italic text-gray-500">
            Enterprise Resource Planning - Developed By Taskflow Team
          </p>

          <div className="text-xs space-y-1">
            <p className="flex items-center gap-1">
              <FaGlobeAsia size={20} />
              Official Website:
              <Link
                href="https://www.ecoshiftcorp.com/"
                className="underline text-green-700 hover:text-green-800"
              >
                ecoshiftcorp.com
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:block w-1/2 relative">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/eco.png')" }}
          />
          <div className="absolute inset-0" /> {/* dark overlay */}
        </div>
      </div>
    </div>
  );
};

export default Login;
