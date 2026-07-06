import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { data } = await authApi.register(form);
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name',     type: 'text',     label: 'Full Name',    placeholder: 'Your full name',       icon: 'person' },
    { key: 'phone',    type: 'text',     label: 'Phone',         placeholder: '+91 9999 999999',      icon: 'phone' },
    { key: 'email',    type: 'email',    label: 'Email Address', placeholder: 'name@business.com',    icon: 'mail' },
    { key: 'password', type: 'password', label: 'Password',      placeholder: '••••••••',              icon: 'lock' },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-[1200px] bg-surface-white grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-2xl min-h-[700px] rounded-lg border border-outline-variant">

        {/* Branding panel */}
        <section className="relative hidden md:flex flex-col justify-between p-12 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD7viTHK6D9Ljg8f96aW7BusUuJN-q3AFR-ofZtWJ22ihWdLIm6ppmXBe1LTx9H9hITWVRWG1DH0LsahzhuYCYYZnCusodC8ABIE0J0io_faMSzlX5MBHEnQ_Gv9L5fPVtDXa4dq92BytYbpdzqyTpkD--gN-4gO8S__oJR2qVgUeojuxtjpcRkntXPp35FGdlNhsfFD6DSAdpMtf0PxbwW8_rgPx')" }}></div>
            <div className="absolute inset-0 industrial-overlay"></div>
          </div>
          <div className="relative z-10">
            <h1 className="font-headline-lg text-headline-lg text-on-primary tracking-tight">Kulswamini Enterprises</h1>
            <p className="font-label-md text-label-md text-on-primary-container mt-2 opacity-80">PRECISION DISTRIBUTION HUB</p>
          </div>
          <div className="relative z-10 mt-auto">
            <blockquote className="border-l-2 border-primary-fixed pl-6">
              <p className="font-display-lg text-display-lg text-on-primary mb-4 italic">Join our network.</p>
              <cite className="font-label-md text-label-md text-on-primary uppercase tracking-widest block opacity-70">Automotive &amp; Industrial Solutions</cite>
            </blockquote>
          </div>
        </section>

        {/* Form panel */}
        <section className="flex flex-col justify-center p-8 md:p-16 lg:p-20 bg-surface-white">
          <div className="mb-10 text-center md:text-left">
            <h2 className="font-headline-lg text-primary mb-2">Business Registration</h2>
            <p className="font-body-md text-on-surface-variant">Apply for a Bergen Fluid distribution account. Your account requires admin approval.</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-error-container text-on-error-container rounded-lg border border-error/20 error-shake">
              <span className="material-symbols-outlined">warning</span>
              <p className="font-label-md text-label-md">{error}</p>
            </div>
          )}
          {message && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-[#e8f5e9] text-[#2e7d32] rounded-lg border border-[#a5d6a7]">
              <span className="material-symbols-outlined">check_circle</span>
              <p className="font-label-md text-label-md">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map(({ key, type, label, placeholder, icon }) => (
              <div key={key} className="space-y-1">
                <label htmlFor={key} className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{label}</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">{icon}</span>
                  <input
                    id={key}
                    type={type}
                    required
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-body-md outline-none transition-all"
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-on-primary font-label-md text-label-md uppercase tracking-widest rounded-lg hover:bg-steel-blue transition-colors duration-300 shadow-md flex items-center justify-center gap-2"
            >
              {loading ? 'Submitting...' : (
                <>Submit Application <span className="material-symbols-outlined">description</span></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-outline-variant text-center">
            <p className="font-body-md text-on-surface-variant">
              Already registered? <Link to="/login" className="text-primary font-bold hover:underline transition-all ml-1">Sign in here</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
