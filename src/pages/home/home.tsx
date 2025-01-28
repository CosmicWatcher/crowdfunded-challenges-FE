import { CirclePlus } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import { SITE_PAGES } from "@/configs/routes";

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["rgb(0 77 179)", "rgb(116 80 62)", "rgb(109 40 217)"];
    let frame = 0;

    const animate = () => {
      frame++;
      ctx.fillStyle = "rgba(0,0,0,0.01)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < colors.length; i++) {
        const noiseX = Math.sin(frame * 0.05 + i * 2.1) * 0.3;
        const noiseY = Math.cos(frame * 0.07 + i * 1.7) * 0.3;

        const x =
          (Math.sin(frame * 0.1 + i + noiseX) * canvas.width) / 2 +
          canvas.width / 2 +
          Math.sin(frame * 0.03 + i * 3.2) * 100;

        const y =
          (Math.cos(frame * 0.15 + i + noiseY) * canvas.height) / 2 +
          canvas.height / 2 +
          Math.cos(frame * 0.04 + i * 2.8) * 100;

        const size = Math.sin(frame * 0.02 + i * 0.5) * 15 + 25;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = colors[i % colors.length];
        ctx.globalAlpha = 0.1;
        ctx.fill();
      }

      setTimeout(() => {
        requestAnimationFrame(animate);
      }, 1000 / 30);
    };

    animate();

    function handleResize() {
      if (!canvas) return;
      if (
        Math.abs(window.innerWidth - canvas.width) < 0.1 * canvas.width &&
        Math.abs(window.innerHeight - canvas.height) < 0.1 * canvas.height
      )
        return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative min-h-full">
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10"
      />
      <div className="flex items-center justify-center mt-[15vh] mb-auto">
        <div className="flex flex-col gap-[15vh] w-[80vw] max-w-[400px]">
          <Link href={SITE_PAGES.TASKS.CREATE}>
            <Button className="w-full h-[15vh] min-h-20 animate-glow-border backdrop-blur-sm bg-opacity-50">
              <CirclePlus className="size-9 mr-3 my-4 animate-button-pulse" />
              <p className="text-xl md:text-2xl font-bold">Create Task</p>
            </Button>
          </Link>
          <Link href={SITE_PAGES.TASKS.LIST}>
            <Button className="w-full h-[15vh] min-h-20 animate-glow-border backdrop-blur-sm bg-opacity-50">
              <p className="text-xl md:text-2xl font-bold">View Tasks</p>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
