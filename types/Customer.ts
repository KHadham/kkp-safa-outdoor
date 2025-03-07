interface Customer {
  address: string;
  createdAt: {
    seconds: number;
  };
  updatedAt: {
    seconds: number;
  };
  doc_ktp: string;
  doc_npwp: string;
  doc_person: string;
  doc_sim: string;
  fullName: string;
  id: string;
  lastRent: {
    seconds: number;
  };
  rentCount: number;
  rentIncome: string;
  createdById: string;
  createdByName: string;
  updateById: string;
  updateByName: string;
  phone: string;
  rentStatus: string;
}
