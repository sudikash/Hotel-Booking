
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser,
  faLocationDot,
  faCalendarDays,
  faUsers,
  faMagnifyingGlass,
  faChevronDown,
  faArrowRight,
  faArrowUp,
  faBars,
  faXmark,
  faUpload,
  faWifi,
  faSnowflake,
  faBed,
  faUtensils,
  faWineGlass,
  faSpa,
  faTv,
  faDesktop,
  faLock,
  faMugHot,
  faCheck,
} from '@fortawesome/free-solid-svg-icons'
import {
  faInstagram,
  faXTwitter,
  faFacebook,
  faYoutube,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons'

/** Thin wrapper so callers can pass a Tailwind className for sizing/colour */
function FA({ icon, className = 'w-5 h-5', ...rest }) {
  return <FontAwesomeIcon icon={icon} className={className} {...rest} />
}

// ─── Brand / Logo 
export function LogoIcon({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="10" fill="#111c38" />
      <path d="M18 7L27 15.5H23V27H13V15.5H9L18 7Z" fill="white" fillOpacity="0.95" />
      <circle cx="18" cy="18" r="3" fill="#111c38" />
      <path d="M18 21.5L20.5 25H15.5L18 21.5Z" fill="#7c9deb" />
    </svg>
  )
}

// ─── Core UI Icons ────────────────────────────────────────────────────────────
export function UserIcon({ className = 'w-5 h-5' }) {
  return <FA icon={faUser} className={className} />
}

export function MapPinIcon({ className = 'w-5 h-5' }) {
  return <FA icon={faLocationDot} className={className} />
}

export function CalendarIcon({ className = 'w-5 h-5' }) {
  return <FA icon={faCalendarDays} className={className} />
}

export function GuestsIcon({ className = 'w-5 h-5' }) {
  return <FA icon={faUsers} className={className} />
}

export function SearchIcon({ className = 'w-4 h-4' }) {
  return <FA icon={faMagnifyingGlass} className={className} />
}

export function ChevronDownIcon({ className = 'w-4 h-4' }) {
  return <FA icon={faChevronDown} className={className} />
}

export function ArrowRightIcon({ className = 'w-4 h-4' }) {
  return <FA icon={faArrowRight} className={className} />
}

export function ArrowUpIcon({ className = 'w-4 h-4' }) {
  return <FA icon={faArrowUp} className={className} />
}

export function MenuIcon({ className = 'w-6 h-6' }) {
  return <FA icon={faBars} className={className} />
}

export function CloseIcon({ className = 'w-6 h-6' }) {
  return <FA icon={faXmark} className={className} />
}

export function UploadIcon({ className = 'w-6 h-6' }) {
  return <FA icon={faUpload} className={className} />
}

// ─── Font Awesome Amenity Icon Helper ─────────────────────────────────────────
export function AmenityFAIcon({ name, className = 'w-5 h-5 text-slate-700' }) {
  const lower = (name || '').toLowerCase()

  let icon = faCheck
  if (lower.includes('wifi') || lower.includes('internet')) icon = faWifi
  else if (lower.includes('ac') || lower.includes('air') || lower.includes('conditioning')) icon = faSnowflake
  else if (lower.includes('bed')) icon = faBed
  else if (lower.includes('kitchen')) icon = faUtensils
  else if (lower.includes('bar') || lower.includes('mini')) icon = faWineGlass
  else if (lower.includes('spa')) icon = faSpa
  else if (lower.includes('tv') || lower.includes('screen')) icon = faTv
  else if (lower.includes('desk') || lower.includes('work')) icon = faDesktop
  else if (lower.includes('safe') || lower.includes('lock')) icon = faLock
  else if (lower.includes('coffee') || lower.includes('maker') || lower.includes('kettle')) icon = faMugHot

  return <FA icon={icon} className={className} />
}

// ─── Social Icons (brands) ───────────────────────────────────────────────────
export function InstagramIcon({ className = 'w-5 h-5' }) {
  return <FA icon={faInstagram} className={className} />
}

export function XTwitterIcon({ className = 'w-5 h-5' }) {
  return <FA icon={faXTwitter} className={className} />
}

export function FacebookIcon({ className = 'w-5 h-5' }) {
  return <FA icon={faFacebook} className={className} />
}

export function YouTubeIcon({ className = 'w-5 h-5' }) {
  return <FA icon={faYoutube} className={className} />
}

export function LinkedInIcon({ className = 'w-5 h-5' }) {
  return <FA icon={faLinkedin} className={className} />
}
