import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext'; // ✅ context import

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ get login method from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    const endpoint = isLogin ? 'login' : 'signup';

    try {
      const res = await fetch(`http://localhost:5001/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.msg || 'Something went wrong');
        return;
      }

      if (isLogin) {
        login(data.token, email); // ✅ use context to log in and sync state
        navigate('/');
      } else {
        setMsg('Signup successful! Please login.');
        setIsLogin(true);
      }
    } catch (err) {
      console.error(err);
      setMsg('Server error. Try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-10 rounded shadow-md w-full max-w-md min-h-[480px]">
        <h2 className="text-2xl font-bold text-center text-green-600 mb-6">
          {isLogin ? 'Login' : 'Signup'}
        </h2>

        {msg && (
          <div className="mb-4 text-sm text-red-500 text-center">{msg}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => alert('Forget password flow coming soon')}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          >
            {isLogin ? 'Login' : 'Signup'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setMsg('');
            }}
            className="text-green-600 underline"
          >
            {isLogin ? 'Signup' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

// new code 


