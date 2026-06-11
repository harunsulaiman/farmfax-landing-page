export type FarmerTab =
  | "dashboard"
  | "apply"
  | "history"
  | "repayment"
  | "inputs"
  | "yield"
  | "messages"
  | "profile";

export type SupplierTab =
  | "dashboard"
  | "products"
  | "orders"
  | "fulfill"
  | "messages"
  | "profile";

export type AdminTab =
  | "dashboard"
  | "products"
  | "orders"
  | "all-orders"
  | "users"
  | "messages"
  | "profile";

export function getFarmerNotificationTab(type: string): FarmerTab {
  switch (type) {
    case "ORDER_SUBMITTED":
    case "ORDER_APPROVED_FARMER":
    case "FULFILLMENT_ACCEPTED":
    case "FULFILLMENT_READY":
    case "CONFIRM_RECEIPT":
    case "ORDER_UPDATE":
    case "ORDER_NEW":
      return "inputs";
    case "LOAN_DISBURSED":
    case "LOAN_REPAID":
      return "repayment";
    case "ORDER_REJECTED":
      return "history";
    default:
      return "messages";
  }
}

export function getSupplierNotificationTab(type: string): SupplierTab {
  switch (type) {
    case "ORDER_APPROVED_SUPPLIER":
    case "ADMIN_ORDER":
    case "ORDER_NEW":
      return "fulfill";
    case "ORDER_COMPLETE":
      return "orders";
    case "PRODUCT_APPROVED":
    case "PRODUCT_REJECTED":
    case "PRODUCT_PENDING":
      return "products";
    case "SUPPLIER_VERIFIED":
      return "profile";
    default:
      return "messages";
  }
}

export function getAdminNotificationTab(type: string): AdminTab {
  switch (type) {
    case "REQUEST_SUBMITTED":
    case "ORDER_SUBMITTED":
    case "ADMIN_ORDER":
    case "ORDER_NEW":
      return "orders";
    case "PRODUCT_PENDING":
      return "products";
    case "ORDER_DISBURSED":
      return "all-orders";
    case "KYC_UPDATED":
      return "users";
    default:
      return "messages";
  }
}
