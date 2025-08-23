import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LotteryProvider } from "./context/LotteryContext";
import HeaderWrapper from "./components/HeaderWrapper";
import Index from "./pages/Index";
import Rounds from "./pages/Rounds";
import Tickets from "./pages/Tickets";
import NFTDetails from "./pages/NFTDetails";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const App = () => (
  <LotteryProvider>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <HeaderWrapper />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/rounds" element={<Rounds />} />
          <Route path="/rounds/:roundId" element={<Rounds />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/nft/:tokenId" element={<NFTDetails />} />
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </LotteryProvider>
);

export default App;
