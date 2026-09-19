export type PurchasableService = {
  active: boolean;
  isSurgical: boolean;
  requiresMedicalAssessment: boolean;
  requiresManualQuote: boolean;
  showPrice: boolean;
};

export function isPurchasable(service: PurchasableService) {
  return service.active && !service.isSurgical && !service.requiresMedicalAssessment && !service.requiresManualQuote && service.showPrice;
}
