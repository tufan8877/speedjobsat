import { MapPin, UserRound } from "lucide-react";

export default function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex h-10 w-8 shrink-0 items-center justify-center">
        <MapPin className="absolute h-10 w-10 fill-secondary text-secondary" strokeWidth={1.5} />
        <div className="relative -mt-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white">
          <UserRound className="h-3.5 w-3.5 fill-primary text-primary" strokeWidth={2} />
        </div>
      </div>
      <span className="font-title text-xl font-black uppercase leading-none tracking-tight text-primary sm:text-2xl">
        Speed<span className="text-secondary">Job</span>
        <span className="text-primary/70">.at</span>
      </span>
    </div>
  );
}
