import type { ProviderRequest, ProviderResponse } from "../types/provider.js";

export interface Provider {
  readonly name: string;
  generate(request: ProviderRequest): Promise<ProviderResponse>;
}
