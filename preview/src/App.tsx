import { useState } from "react";
import { AppSidebar, type View } from "@/components/layout/AppSidebar";
import { Toaster } from "@/components/ui/sonner";
import { ComponentGallery } from "@/components/gallery/ComponentGallery";
import { DashboardBlock } from "@/components/blocks/DashboardBlock";
import { SettingsBlock } from "@/components/blocks/SettingsBlock";
import { AuthBlock } from "@/components/blocks/AuthBlock";
import { MarketingBlock } from "@/components/blocks/MarketingBlock";

function ActiveView({ view }: { view: View }) {
  switch (view) {
    case "components":
      return <ComponentGallery />;
    case "dashboard":
      return <DashboardBlock />;
    case "settings":
      return <SettingsBlock />;
    case "auth":
      return <AuthBlock />;
    case "marketing":
      return <MarketingBlock />;
  }
}

export default function App() {
  const [activeView, setActiveView] = useState<View>("components");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar activeView={activeView} onViewChange={setActiveView} />

      <main className="flex-1 overflow-y-auto">
        <ActiveView view={activeView} />
      </main>
      <Toaster />
    </div>
  );
}
