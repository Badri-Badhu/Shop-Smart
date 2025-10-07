import React from "react";
import "./loader.css";

export default function Loader({
  size = 140,
  color = "#1FD6DC",
  cycle = "3.93s",
}) {
  return (
    <div className="loader-overlay">
      <div
        className="loader-wrap"
        aria-label="Loading"
        style={{
          "--loader-size": `${size}px`,
          "--loader-color": color,
          "--loader-cycle": cycle,
        }}
      >
        <svg
          className="loader-svg"
          viewBox="0 0 120 120"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-hidden="true"
        >
          {/* Cart outline */}
          <g strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(0,-5)">
            <path
              className="loader-solid"
              d="M20 35 h32 a4 4 0 0 1 4 4
                 M20 35 l4 18 h49
                 M88 53 l6-20
                 M31 67 h48"
            />
            <path
              className="loader-ghost"
              d="M20 35 h32 a4 4 0 0 1 4 4
                 M20 35 l4 18 h49
                 M88 53 l6-20
                 M31 67 h48"
            />
            <path
              className="loader-sweep"
              d="M20 35 h32 a4 4 0 0 1 4 4
                 M20 35 l4 18 h49
                 M88 53 l6-20
                 M31 67 h48"
            />
          </g>

          
          <g fill="none">
            <circle className="vrl-wheel-background" cx="40" cy="82" r="12" strokeWidth="6" />
            <circle className="vrl-wheel-animated" cx="40" cy="82" r="12" />
            <circle className="vrl-wheel-background" cx="74" cy="82" r="12" />
            <circle className="vrl-wheel-animated" cx="74" cy="82" r="12" />
          </g>
        </svg>
      </div>
    </div>
  );
}
