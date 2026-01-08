import { Link } from "react-router-dom";

const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <Link to="/" className={`flex items-center gap-3 ${className}`}>
      {/* SVG Logo based on the brand design */}
      <svg
        viewBox="0 0 60 60"
        className="h-12 w-12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Brain outline */}
        <path
          d="M30 8c-6 0-11 3-14 7.5C13 12 9 14 6 18c-3 4-4 9-2 14 2 5 6 8 11 9v3c0 4 3 8 7 9.5V45c-2-1-4-3-4-6v-4c-4-1-7-4-9-8-2-4-1-8 1-11 2-3 5-5 8-5 2-4 5-7 9-8V8z"
          className="fill-primary/20"
        />
        <path
          d="M30 8c6 0 11 3 14 7.5C47 12 51 14 54 18c3 4 4 9 2 14-2 5-6 8-11 9v3c0 4-3 8-7 9.5V45c2-1 4-3 4-6v-4c4-1 7-4 9-8 2-4 1-8-1-11-2-3-5-5-8-5-2-4-5-7-9-8V8z"
          className="fill-primary/20"
        />
        
        {/* Heart in center */}
        <path
          d="M30 18c-3-3-8-3-11 0-3 3-3 8 0 11l11 11 11-11c3-3 3-8 0-11-3-3-8-3-11 0z"
          className="fill-primary"
        />
        
        {/* Plant stem and leaves */}
        <path
          d="M30 25v18M26 30c-3-2-3-5 0-7M34 30c3-2 3-5 0-7M28 38c-2-1-3-4-1-6M32 38c2-1 3-4 1-6"
          className="stroke-primary-foreground"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      
      <div className="flex flex-col">
        <span className="text-lg font-serif font-bold tracking-wide text-primary leading-none">
          RESILIENT
        </span>
        <span className="text-lg font-serif font-bold tracking-[0.3em] text-primary leading-none">
          MIND
        </span>
      </div>
    </Link>
  );
};

export default Logo;
