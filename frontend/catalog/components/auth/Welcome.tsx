import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

// The frame is 3:2 like the slides (1536×1024). The square logo image is
// letterboxed on its own background colour instead of being cropped.
const SLIDES = [
  { src: "/catalog.png", fit: "contain" },
  { src: "/slide1.png", fit: "cover" },
  { src: "/slide2.png", fit: "cover" },
  { src: "/slide3.png", fit: "cover" },
  { src: "/slide4.png", fit: "cover" },
  { src: "/slide5.png", fit: "cover" },
] as const;

const AUTOPLAY_MS = 5000;

export function Welcome() {
  const [current, setCurrent] = useState(0);
  const length = SLIDES.length;

  const prevSlide = () => setCurrent((prev) => (prev === 0 ? length - 1 : prev - 1));
  const nextSlide = () => setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1));

  // Only runs in the browser, so the prerendered HTML always shows slide 1.
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1));
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [length]);

  return (
    <div className="w-full p-4 text-center sm:p-8">
      <h2 className="mb-4 text-3xl font-bold">Have a mice day!</h2>

      <div className="relative mx-auto aspect-[3/2] w-full max-w-[900px] overflow-hidden rounded-xl bg-[#2c2e30] shadow-md">
        <img
          src={SLIDES[current].src}
          alt={`Slide ${current + 1} of ${length}`}
          className={`block size-full ${
            SLIDES[current].fit === "contain" ? "object-contain" : "object-cover"
          }`}
        />
        <Button
          variant="secondary"
          size="icon"
          aria-label="Previous slide"
          onClick={prevSlide}
          className="absolute top-1/2 left-2 -translate-y-1/2 opacity-75 hover:opacity-100"
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Next slide"
          onClick={nextSlide}
          className="absolute top-1/2 right-2 -translate-y-1/2 opacity-75 hover:opacity-100"
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
