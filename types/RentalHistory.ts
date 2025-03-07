interface RentalHistory {
  createdBy: string;
  createdById: string;
  createdAt: any;
  updatedBy: string;
  updatedById: string;
  updatedAt: any;
  customerId: string;
  destination: string;
  customerName: string | any;
  toolIds: string[];
  rentActualReturn: any;
  rentLateLength: any;
  id: string;
  itemsRentals: string;
  rentDate: any;
  rentLength: string;
  rentNominal: string;
  rentPerDay: string;
  status: string;
  rentReturn: any;
  items: {
    toolId: string;
    toolName: string;
    price: string;
    quantity: string;
    totalPrice: number;
  }[];
}
