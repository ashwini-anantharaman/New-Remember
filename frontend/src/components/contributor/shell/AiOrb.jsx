import Image from "next/image";

export default function AiOrb({ className = "" }) {
  return (
    <div
      className={`relative flex size-[300px] shrink-0 items-center justify-center overflow-hidden rounded-full p-2.5 ${className}`}
      aria-hidden="true"
    >
      <Image
        src="/brand/ai-orb-gradient.png"
        alt=""
        fill
        className="object-cover"
        sizes="300px"
        unoptimized
      />
    </div>
  );
}
