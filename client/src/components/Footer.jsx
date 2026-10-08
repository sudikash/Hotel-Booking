import { LogoIcon, InstagramIcon, XTwitterIcon, FacebookIcon, YouTubeIcon, LinkedInIcon, ArrowUpIcon } from './Icons.jsx'

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-[#0B1325] text-slate-300 pt-14 pb-10 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-10">
          {/* Brand Info (col-span-5) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <LogoIcon className="w-8 h-8" />
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-xl tracking-tight text-white">StayLuxe</span>
                  <span className="font-normal text-xl text-slate-400">Home</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Better Stays. Brighter Journeys.
              </p>
            </div>

            <p className="text-xs text-slate-500 hidden lg:block pt-10">
              © 2025 StayLuxe Home. All rights reserved.
            </p>
          </div>

          {/* Quick Links (col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="/" className="hover:text-white transition-colors">Home</a>
              </li>
              <li>
                <a href="/bookings" className="hover:text-white transition-colors">Orders</a>
              </li>
              <li>
                <a href="/profile" className="hover:text-white transition-colors">Profile</a>
              </li>
            </ul>
          </div>

          {/* Support (col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-wider">Support</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#help" className="hover:text-white transition-colors">Help Center</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">Contact Us</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors">Terms & Conditions</a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              </li>
            </ul>
          </div>

          {/* Follow Us (col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-wider">Follow Us</h4>
            <div className="flex items-center gap-4 text-slate-400">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-white transition-colors">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X (formerly Twitter)" className="hover:text-white transition-colors">
                <XTwitterIcon className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-white transition-colors">
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="hover:text-white transition-colors">
                <YouTubeIcon className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-white transition-colors">
                <LinkedInIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Mobile copyright & Scroll To Top */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/40 lg:border-none lg:pt-0">
          <p className="text-xs text-slate-500 lg:hidden">
            © 2025 StayLuxe Home. All rights reserved.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="ml-auto w-9 h-9 rounded-full bg-[#1b2640] hover:bg-[#25355a] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <ArrowUpIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  )
}
