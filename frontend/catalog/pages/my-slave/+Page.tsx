import { MyOverlordsSection } from "@/components/myoverlords/MyOverlordsSection";
import { MySlaveSection } from "@/components/myslave/MySlaveSection";
import { MySlaveTutorial } from "@/components/tutorial/tutorials";

export default function Page() {
  return (
    <div className="relative flex flex-col items-start justify-between gap-8 px-4 py-8 md:flex-row md:px-12">
      <MySlaveTutorial className="self-end md:absolute md:top-4 md:right-12" />

      {/* Left side: slave profile */}
      <div className="w-full shrink-0 md:w-[400px]">
        <MySlaveSection />
      </div>

      {/* Right side: overlords carousel */}
      <div className="w-full flex-1">
        <MyOverlordsSection />
      </div>
    </div>
  );
}
