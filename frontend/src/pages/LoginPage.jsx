import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('shopkeeper');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/shop/catalog');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-[1200px] bg-surface-white grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-2xl min-h-[700px] rounded-lg border border-outline-variant">
        {/* Branding Section */}
        <section className="relative hidden md:flex flex-col justify-between p-12 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD7viTHK6D9Ljg8f96aW7BusUuJN-q3AFR-ofZtWJ22ihWdLIm6ppmXBe1LTx9H9hITWVRWG1DH0LsahzhuYCYYZnCusodC8ABIE0J0io_faMSzlX5MBHEnQ_Gv9L5fPVtDXa4dq92BytYbpdzqyTpkD--gN-4gO8S__oJR2qVgUeojuxtjpcRkntXPp35FGdlNhsfFD6DSAdpMtf0PxbwW8_rgPx' )" }}></div>
            <div className="absolute inset-0 industrial-overlay"></div>
          </div>
          <div className="relative z-10">
            <h1 className="font-headline-lg text-headline-lg text-on-primary tracking-tight">Kulswamini Enterprises</h1>
            <p className="font-label-md text-label-md text-on-primary-container mt-2 opacity-80">PRECISION DISTRIBUTION HUB</p>
          </div>
          <div className="relative z-10 mt-auto">
            <blockquote className="border-l-2 border-primary-fixed pl-6">
              <p className="font-display-lg text-display-lg text-on-primary mb-4 italic">Reliability in every drop.</p>
              <cite className="font-label-md text-label-md text-on-primary uppercase tracking-widest block opacity-70">Automotive &amp; Industrial Solutions</cite>
            </blockquote>
          </div>
        </section>
        {/* Form Section */}
        <section className="flex flex-col justify-center p-8 md:p-16 lg:p-20 bg-surface-white">
          <div className="mb-10 text-center md:text-left">
            <h2 className="font-headline-lg text-primary mb-2">Portal Login</h2>
            <p className="font-body-md text-on-surface-variant">Enter your credentials to manage your distribution accounts.</p>
          </div>
          <div className="flex bg-surface-container p-1 rounded-lg mb-8" id="roleSelector">
            <button type="button"
                    className={role === 'shopkeeper' ? 'flex-1 py-2 font-label-md text-label-md rounded transition-all duration-200 bg-white text-primary shadow-sm' : 'flex-1 py-2 font-label-md text-label-md rounded transition-all duration-200 text-on-surface-variant hover:bg-surface-container-high'}
                    onClick={() => setRole('shopkeeper')}>Shopkeeper</button>
            <button type="button"
                    className={role === 'admin' ? 'flex-1 py-2 font-label-md text-label-md rounded transition-all duration-200 bg-white text-primary shadow-sm' : 'flex-1 py-2 font-label-md text-label-md rounded transition-all duration-200 text-on-surface-variant hover:bg-surface-container-high'}
                    onClick={() => setRole('admin')}>Admin</button>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label htmlFor="email" className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">email</span>
                <input id="email" type="email" required placeholder="name@business.com" value={email} onChange={e => setEmail(e.target.value)}
                       className="w-full pl-11 pr-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-body-md outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Password</label>
                <a href="#" className="font-label-sm text-primary hover:underline transition-all">Forgot?</a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                <input id="password" type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                       className="w-full pl-11 pr-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-body-md outline-none transition-all" />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-3 p-4 bg-error-container text-on-error-container rounded-lg border border-error/20 error-shake" id="errorMessage">
                <span className="material-symbols-outlined">warning</span>
                <p className="font-label-md text-label-md">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading}
                    className="w-full py-4 bg-primary text-on-primary font-label-md text-label-md uppercase tracking-widest rounded-lg hover:bg-steel-blue transition-colors duration-300 shadow-md flex items-center justify-center gap-2">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className="mt-8 pt-8 border-t border-outline-variant text-center">
            <p className="font-body-md text-on-surface-variant">
              Shopkeeper? <Link to="/register" className="text-primary font-bold hover:underline transition-all ml-1">Register here</Link>
            </p>
          </div>
          <div className="mt-auto pt-10 flex items-center justify-center gap-6 opacity-40">
            <span className="font-label-sm text-label-sm flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">verified</span> ISO Certified</span>
            <span className="font-label-sm text-label-sm flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">shield</span> Secure Access</span>
          </div>
        </section>
      </div>
    </div>
  );
}
