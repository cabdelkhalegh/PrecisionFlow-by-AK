'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-yellow-500 selection:text-black">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-slate-950/50 backdrop-blur-xl fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦖</span>
            <span className="font-bold text-lg tracking-tight text-white">AgencyOS</span>
            <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium border border-yellow-500/20">
              BETA
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/login">
              <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold border-none">
                Get Access
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-yellow-500/20 blur-[120px] rounded-full pointer-events-none opacity-30" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            Stop Coordinating.<br />
            Start Commanding.
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The operating system for high-performance influencer agencies. 
            Replace chaos, WhatsApp, and spreadsheets with a single source of truth.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold border-none w-full sm:w-auto">
                Request Founder Access
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-white/10 hover:bg-white/5 text-white w-full sm:w-auto">
              View Demo Board
            </Button>
          </div>
          
          <p className="mt-6 text-sm text-slate-500">
            🔒 Only 5 spots available for Pilot Program.
          </p>
        </div>
      </section>

      {/* Feature Grid (The Value Prop) */}
      <section className="py-24 bg-slate-900/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-500/50 transition-colors group">
              <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                📋
              </div>
              <h3 className="text-xl font-bold text-white mb-3">The Command Center</h3>
              <p className="text-slate-400 leading-relaxed">
                A unified Kanban board for every campaign. See exactly who is proposed, approved, drafting, or live. No more guessing.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-500/50 transition-colors group">
              <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                💰
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Real-Time Financials</h3>
              <p className="text-slate-400 leading-relaxed">
                Track budget vs. committed spend instantly. Know your margin before the campaign ends, not after.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-500/50 transition-colors group">
              <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                🤖
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Gatekeeper</h3>
              <p className="text-slate-400 leading-relaxed">
                Automated brief compliance. Our AI checks drafts against your rules before you even see them. (Coming Soon)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Footer */}
      <footer className="py-12 border-t border-white/10 text-center">
        <p className="text-slate-500 text-sm">
          © 2026 AgencyOS (Ubuntu TiKiT). Built by Godzilla AI.
        </p>
      </footer>
    </div>
  );
}
