// app/not-found.js or pages/404.js
import Link from 'next/link';
import './not-found.css';
import UserNavbar from './user/Header';

export default function NotFound() {
  return (
    <div className="not-found-container">
      <UserNavbar></UserNavbar>
      <div className="not-found-content">
        <h1 className="not-found-title">
          Opps! you&apos;r on the wrong place.
        </h1>
        
        <p className="not-found-description">
          Can not find what you need? Take a moment and do a search below<br className="hidden md:block" />
          or start from our Homepage.
        </p>
        
        <Link 
          href="/"
          className="not-found-btn"
        >
          Back to home
        </Link>
        
        <div className="not-found-illustration">
          <svg 
            viewBox="0 0 800 600" 
            className="illustration-svg"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Sky background */}
            <rect width="800" height="600" fill="#f0f9ff"/>
            
            {/* Clouds */}
            <ellipse cx="150" cy="100" rx="40" ry="20" fill="#e0f2fe" opacity="0.7"/>
            <ellipse cx="180" cy="95" rx="50" ry="25" fill="#e0f2fe" opacity="0.7"/>
            <ellipse cx="600" cy="120" rx="45" ry="22" fill="#e0f2fe" opacity="0.7"/>
            <ellipse cx="630" cy="115" rx="55" ry="28" fill="#e0f2fe" opacity="0.7"/>
            
            {/* Ground */}
            <path d="M 0 450 Q 200 430 400 450 T 800 450 L 800 600 L 0 600 Z" fill="#bae6fd"/>
            
            {/* Road */}
            <rect x="0" y="500" width="800" height="4" fill="#94a3b8"/>
            
            {/* Left Trees */}
            <g className="tree-sway">
              <ellipse cx="180" cy="280" rx="60" ry="110" fill="#bae6fd"/>
              <ellipse cx="160" cy="300" rx="50" ry="90" fill="#7dd3fc"/>
              <line x1="180" y1="390" x2="165" y2="330" stroke="#64748b" strokeWidth="2"/>
              <line x1="180" y1="390" x2="175" y2="350" stroke="#64748b" strokeWidth="2"/>
            </g>
            
            <g className="tree-sway-delay-1">
              <ellipse cx="220" cy="250" rx="70" ry="120" fill="#bae6fd"/>
              <ellipse cx="200" cy="270" rx="55" ry="95" fill="#7dd3fc"/>
              <line x1="220" y1="370" x2="210" y2="310" stroke="#64748b" strokeWidth="2"/>
              <line x1="220" y1="370" x2="215" y2="330" stroke="#64748b" strokeWidth="2"/>
            </g>
            
            {/* Right Trees */}
            <g className="tree-sway-delay-2">
              <ellipse cx="600" cy="260" rx="65" ry="115" fill="#bae6fd"/>
              <ellipse cx="580" cy="280" rx="52" ry="92" fill="#7dd3fc"/>
              <line x1="600" y1="375" x2="590" y2="320" stroke="#64748b" strokeWidth="2"/>
              <line x1="600" y1="375" x2="595" y2="340" stroke="#64748b" strokeWidth="2"/>
            </g>
            
            <g className="tree-sway-delay-3">
              <ellipse cx="680" cy="240" rx="75" ry="125" fill="#bae6fd"/>
              <ellipse cx="660" cy="265" rx="58" ry="98" fill="#7dd3fc"/>
              <line x1="680" y1="365" x2="670" y2="305" stroke="#64748b" strokeWidth="2"/>
              <line x1="680" y1="365" x2="675" y2="325" stroke="#64748b" strokeWidth="2"/>
            </g>
            
            {/* Girl on Bike */}
            <g className="bike-animation">
              {/* Back wheel */}
              <circle cx="320" cy="480" r="45" fill="none" stroke="#1e293b" strokeWidth="6"/>
              <circle cx="320" cy="480" r="5" fill="#1e293b"/>
              
              {/* Front wheel */}
              <circle cx="480" cy="480" r="45" fill="none" stroke="#1e293b" strokeWidth="6"/>
              <circle cx="480" cy="480" r="5" fill="#1e293b"/>
              
              {/* Bike frame */}
              <line x1="320" y1="480" x2="380" y2="420" stroke="#f97316" strokeWidth="8" strokeLinecap="round"/>
              <line x1="380" y1="420" x2="420" y2="480" stroke="#f97316" strokeWidth="8" strokeLinecap="round"/>
              <line x1="420" y1="480" x2="480" y2="480" stroke="#f97316" strokeWidth="8" strokeLinecap="round"/>
              <line x1="380" y1="420" x2="450" y2="380" stroke="#f97316" strokeWidth="8" strokeLinecap="round"/>
              <line x1="450" y1="380" x2="480" y2="430" stroke="#f97316" strokeWidth="8" strokeLinecap="round"/>
              
              {/* Basket */}
              <rect x="460" y="360" width="40" height="30" fill="#fbbf24" rx="5"/>
              <line x1="460" y1="370" x2="500" y2="370" stroke="#f59e0b" strokeWidth="2"/>
              <line x1="460" y1="380" x2="500" y2="380" stroke="#f59e0b" strokeWidth="2"/>
              
              {/* Girl Legs */}
              <line x1="370" y1="440" x2="350" y2="480" stroke="#3b82f6" strokeWidth="12" strokeLinecap="round"/>
              <line x1="370" y1="440" x2="320" y2="470" stroke="#3b82f6" strokeWidth="12" strokeLinecap="round"/>
              
              {/* Body */}
              <ellipse cx="380" cy="400" rx="30" ry="45" fill="#60a5fa"/>
              
              {/* Arms */}
              <line x1="370" y1="390" x2="420" y2="400" stroke="#fca5a5" strokeWidth="10" strokeLinecap="round"/>
              <line x1="420" y1="400" x2="450" y2="390" stroke="#fca5a5" strokeWidth="10" strokeLinecap="round"/>
              
              {/* Scarf flowing */}
              <path d="M 390 370 Q 420 350 450 360 Q 470 365 490 355" fill="none" stroke="#f472b6" strokeWidth="6" strokeLinecap="round"/>
              <path d="M 395 375 Q 415 360 440 368" fill="none" stroke="#f472b6" strokeWidth="5" strokeLinecap="round"/>
              
              {/* Head */}
              <circle cx="380" cy="360" r="25" fill="#fca5a5"/>
              
              {/* Hair */}
              <path d="M 360 350 Q 350 340 360 330 Q 370 320 380 325 Q 390 320 400 330 Q 410 340 400 350" fill="#1e293b"/>
              <ellipse cx="400" cy="365" rx="30" ry="15" fill="#1e293b"/>
              
              {/* Face features */}
              <circle cx="372" cy="358" r="2" fill="#1e293b"/>
              <circle cx="388" cy="358" r="2" fill="#1e293b"/>
              <path d="M 375 368 Q 380 372 385 368" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round"/>
            </g>
            
            {/* Motion lines */}
            <line x1="530" y1="390" x2="560" y2="390" stroke="#f87171" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
            <line x1="535" y1="400" x2="555" y2="400" stroke="#f87171" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
            <line x1="540" y1="410" x2="565" y2="410" stroke="#f87171" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
          </svg>
        </div>
      </div>
    </div>
  );
}