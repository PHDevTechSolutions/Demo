'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaGlobeAsia } from 'react-icons/fa';
import { BsCalendar2Week } from 'react-icons/bs';
import { v4 as uuidv4 } from 'uuid';

const Login: React.FC = () => {
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [Department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [lockUntil, setLockUntil] = useState<string | null>(null);
  const [formattedLockUntil, setFormattedLockUntil] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (lockUntil) {
      setFormattedLockUntil(new Date(lockUntil).toLocaleString());
    }
  }, [lockUntil]);

  // 🔊 Play sound helper
  const playSound = (file: string) => {
    const audio = new Audio(file);
    audio.play().catch((err) => {
      console.warn("Audio play prevented by browser:", err);
    });
  };

  // 🧩 Generate or get deviceId (saved in browser)
  const getDeviceId = () => {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  };

  // 📍 Get location if allowed
  const getLocation = async () => {
    if (!navigator.geolocation) return null;
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch {
      console.warn("User denied location access");
      return null;
    }
  };

  // 🧠 Login handler
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
        // 🔹 Block login if Status is Resigned or Terminated
        if (result.Status === "Resigned" || result.Status === "Terminated") {
          toast.error(`Your account is ${result.Status}. Login not allowed.`);
          playSound('/login-failed.mp3');
          setLoading(false);
          return;
        }

        if (result.Department !== Department) {
          toast.error('Department mismatch!');
          playSound('/login-failed.mp3');
          setLoading(false);
          return;
        }

        // ✅ Log login activity with location & deviceId
        const deviceId = getDeviceId();
        const location = await getLocation();

        await fetch('/api/log-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: Email,
            department: Department,
            status: 'login',
            timestamp: new Date().toISOString(),
            deviceId,
            location,
          }),
        });

        toast.success('Login successful!');
        playSound('/login.mp3');

        setTimeout(() => {
          if (result.Role === "Manager" && result.Department === "Sales") {
            router.push(`/ModuleSales/Sales/Dashboard?id=${encodeURIComponent(result.userId)}`);
          } else if (result.Department === "Sales") {
            router.push(`/ModuleSales/Sales/Task/ScheduledActivity?id=${encodeURIComponent(result.userId)}`);
          } else if (result.Department === "CSR") {
            router.push(`/ModuleCSR/CSR/Dashboard?id=${encodeURIComponent(result.userId)}`);
          } else {
            router.push(`/Module${result.Department}/${result.Department}/Dashboard?id=${encodeURIComponent(result.userId)}`);
          }
        }, 1000);

      } else {
        if (result.lockUntil) {
          setLockUntil(result.lockUntil);
          toast.error(`Account locked! Try again after ${new Date(result.lockUntil).toLocaleString()}.`);
          playSound('/reset.mp3');
        } else {
          toast.error(result.message || 'Login failed!');
          playSound('/reset.mp3');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred while logging in!');
      playSound('/login-failed.mp3');
    } finally {
      setLoading(false);
    }
  }, [Email, Password, Department, router]);

  // 🧱 UI
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-cover bg-left" style={{ backgroundImage: "url('/ecoshift-wallpaper.jpg')" }}>
      <div className="flex w-full max-w-4xl bg-white rounded-sm shadow-xl overflow-hidden">
        <ToastContainer
          position="bottom-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          className="text-xs z-[99999]"
          toastClassName="relative flex p-3 rounded-lg justify-between overflow-hidden cursor-pointer bg-white shadow-lg text-gray-800 text-xs"
          progressClassName="bg-gradient-to-r from-green-400 to-blue-500"
        />

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

          <div className="text-xs space-y-2">
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
            <p className="flex items-center gap-1">
              <BsCalendar2Week size={20} />
              For Site & Client Visit:
              <Link
                href="https://acculog.vercel.app/Login"
                className="underline text-green-700 hover:text-green-800"
              >
                Acculog
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
          <div className="absolute inset-0" />
        </div>

        {/* Full-page Welcome Modal */}
        {showWelcomeModal && (
          <div className="fixed inset-0 bg-white z-[100000] flex items-center justify-center transition-opacity duration-300">
            <h1 className="text-3xl font-bold text-gray-800">Welcome to Taskflow</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;