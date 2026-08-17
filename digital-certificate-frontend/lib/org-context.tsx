"use client";

import { createContext, useContext } from "react";
import type { Organization } from "./api";

export const OrgContext = createContext<Organization | null>(null);

export function useOrg(): Organization | null {
  return useContext(OrgContext);
}
