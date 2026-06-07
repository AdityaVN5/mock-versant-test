import { useState, FormEvent } from 'react';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'vrst_admin' && password.trim() === 'xR9$mB4#wP2!sT1y') {
      onLogin();
    } else {
      setError('Invalid credentials. Please use vrst_admin / xR9$mB4#wP2!sT1y');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white p-12 border border-neutral-200 space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif italic tracking-tight text-[#171717]">Sign In</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Mock Versant Assessment</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#171717]" htmlFor="username">Username</label>
            <input 
              id="username"
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-200 text-sm focus:outline-none focus:border-black transition-colors bg-[var(--color-neutral-base)]"
              placeholder="Enter username"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#171717]" htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-200 text-sm focus:outline-none focus:border-black transition-colors bg-[var(--color-neutral-base)]"
              placeholder="Enter password"
            />
          </div>
          
          {error && <p className="text-[11px] font-bold uppercase tracking-wider text-red-500">{error}</p>}
          
          <button 
            type="submit" 
            className="w-full flex justify-center mt-8 py-4 px-4 text-[11px] font-bold text-white bg-black hover:opacity-90 uppercase tracking-[0.2em] transition-all"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}
