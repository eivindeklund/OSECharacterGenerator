import { createContext, useContext } from "react";
import type { useCampaignManager } from "../hooks/useCampaignManager";

export type CampaignContextType = ReturnType<typeof useCampaignManager>;

const CampaignContext = createContext<CampaignContextType | null>(null);

export const CampaignProvider = CampaignContext.Provider;

export function useCampaign(): CampaignContextType {
  const ctx = useContext(CampaignContext);
  if (ctx === null) {
    throw new Error("useCampaign must be used inside a CampaignProvider");
  }
  return ctx;
}
