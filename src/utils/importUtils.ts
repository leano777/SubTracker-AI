import { Subscription, PaymentCard } from "../types/subscription";
import { generateFavicon } from "./faviconUtils";

// CSV column mappings
const CSV_MAPPINGS = {
  name: ["name", "service", "subscription", "title", "service_name"],
  cost: ["cost", "price", "amount", "monthly_cost", "fee"],
  billingCycle: ["billing_cycle", "cycle", "frequency", "billing", "period"],
  nextPayment: ["next_payment", "due_date", "renewal_date", "payment_date"],
  category: ["category", "type", "service_type"],
  subscriptionType: ["subscription_type", "account_type"],
  description: ["description", "notes", "memo"],
  billingUrl: ["billing_url", "url", "website", "link"],
  status: ["status", "state", "active"],
};

export interface ImportPreview {
  subscriptions: Array<Subscription & { _importId: string; _errors?: string[] }>;
  cards: Array<PaymentCard & { _importId: string; _errors?: string[] }>;
  errors: string[];
  warnings: string[];
  duplicates: Array<{ type: "subscription" | "card"; existing: any; imported: any }>;
}

export interface ImportResult {
  success: boolean;
  imported: {
    subscriptions: number;
    cards: number;
  };
  errors: string[];
  warnings: string[];
}

// Utility to normalize field names for CSV mapping
function normalizeFieldName(field: string): string {
  return field
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

// Find best matching column for a field
function findColumnMapping(headers: string[], targetField: keyof typeof CSV_MAPPINGS): number {
  const possibleNames = CSV_MAPPINGS[targetField];

  for (const header of headers) {
    const normalized = normalizeFieldName(header);
    if (possibleNames.some((name) => normalized.includes(name) || name.includes(normalized))) {
      return headers.indexOf(header);
    }
  }

  // Exact match fallback
  for (const header of headers) {
    if (possibleNames.includes(normalizeFieldName(header))) {
      return headers.indexOf(header);
    }
  }

  return -1;
}

// Parse CSV content
function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.split("\n").filter((line) => line.trim());
  if (lines.length === 0) {
    throw new Error("Empty CSV file");
  }

  // Parse CSV with proper quote handling
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  };

  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map((line) => parseCSVLine(line));

  return { headers, rows };
}

// Validate and normalize subscription data
function validateSubscription(
  data: any,
  index: number
): { subscription: Subscription; errors: string[] } {
  const errors: string[] = [];
  const subscription: Partial<Subscription> = {};

  // Required fields
  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    errors.push(`Row ${index + 1}: Missing or invalid name`);
  } else {
    subscription.name = data.name.trim();
  }

  // Cost validation
  const cost = parseFloat(data.cost);
  if (isNaN(cost) || cost < 0) {
    errors.push(`Row ${index + 1}: Invalid cost value`);
  } else {
    subscription.cost = cost;
  }

  // Billing cycle validation
  const validCycles = ["monthly", "quarterly", "yearly", "variable"];
  const billingCycle = data.billingCycle?.toLowerCase();
  if (!billingCycle || !validCycles.includes(billingCycle)) {
    subscription.billingCycle = "monthly"; // Default
  } else {
    subscription.billingCycle = billingCycle as Subscription["billingCycle"];
  }

  // Date validation
  if (data.nextPayment) {
    const date = new Date(data.nextPayment);
    if (isNaN(date.getTime())) {
      errors.push(`Row ${index + 1}: Invalid next payment date`);
    } else {
      subscription.nextPayment = date.toISOString().split("T")[0];
    }
  } else {
    subscription.nextPayment = new Date().toISOString().split("T")[0];
  }

  // Optional fields with defaults
  subscription.category = data.category || "Other";
  subscription.subscriptionType = data.subscriptionType === "business" ? "business" : "personal";
  subscription.description = data.description || "";
  subscription.billingUrl = data.billingUrl || "";
  subscription.planType = "paid";
  subscription.isActive = true;
  subscription.dateAdded = new Date().toISOString().split("T")[0];

  // Status validation
  const validStatuses = ["active", "cancelled", "watchlist"];
  if (data.status && validStatuses.includes(data.status.toLowerCase())) {
    subscription.status = data.status.toLowerCase() as Subscription["status"];
    if (subscription.status === "cancelled") {
      subscription.isActive = false;
      subscription.dateCancelled = new Date().toISOString().split("T")[0];
    }
  } else {
    subscription.status = "active";
  }

  // Generate logo URL
  subscription.logoUrl = generateFavicon(subscription.name || "");

  // Generate unique ID
  subscription.id = Date.now().toString() + Math.random().toString(36).substring(2, 11);

  return {
    subscription: subscription as Subscription,
    errors,
  };
}

// Import CSV data
export function importCSVData(
  content: string,
  existingSubscriptions: Subscription[] = []
): ImportPreview {
  const preview: ImportPreview = {
    subscriptions: [],
    cards: [],
    errors: [],
    warnings: [],
    duplicates: [],
  };

  try {
    const { headers, rows } = parseCSV(content);

    // Find column mappings
    const columnMappings = {
      name: findColumnMapping(headers, "name"),
      cost: findColumnMapping(headers, "cost"),
      billingCycle: findColumnMapping(headers, "billingCycle"),
      nextPayment: findColumnMapping(headers, "nextPayment"),
      category: findColumnMapping(headers, "category"),
      subscriptionType: findColumnMapping(headers, "subscriptionType"),
      description: findColumnMapping(headers, "description"),
      billingUrl: findColumnMapping(headers, "billingUrl"),
      status: findColumnMapping(headers, "status"),
    };

    // Check for required columns
    if (columnMappings.name === -1) {
      preview.errors.push(
        'Required column "name" not found. Expected columns: name, service, subscription, or title'
      );
    }
    if (columnMappings.cost === -1) {
      preview.warnings.push("Cost column not found. Will use $0 as default.");
    }

    if (preview.errors.length > 0) {
      return preview;
    }

    // Process each row
    rows.forEach((row, index) => {
      if (row.length === 0 || row.every((cell) => !cell.trim())) {
        return; // Skip empty rows
      }

      // Extract data from row
      const rowData: any = {};
      Object.entries(columnMappings).forEach(([field, columnIndex]) => {
        if (columnIndex !== -1 && row[columnIndex] !== undefined) {
          rowData[field] = row[columnIndex];
        }
      });

      // Validate and create subscription
      const { subscription, errors } = validateSubscription(rowData, index);

      // Check for duplicates
      const existingDuplicate = existingSubscriptions.find(
        (sub) => sub.name.toLowerCase() === subscription.name.toLowerCase()
      );

      if (existingDuplicate) {
        preview.duplicates.push({
          type: "subscription",
          existing: existingDuplicate,
          imported: subscription,
        });
      }

      const importSubscription = {
        ...subscription,
        _importId: `import_${index}`,
        _errors: errors.length > 0 ? errors : undefined,
      };

      preview.subscriptions.push(importSubscription);
      preview.errors.push(...errors);
    });

    if (preview.subscriptions.length === 0) {
      preview.errors.push("No valid subscriptions found in CSV file");
    }
  } catch (error) {
    preview.errors.push(
      `Failed to parse CSV: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  return preview;
}

// Import JSON data
export function importJSONData(
  content: string,
  existingSubscriptions: Subscription[] = [],
  existingCards: PaymentCard[] = []
): ImportPreview {
  const preview: ImportPreview = {
    subscriptions: [],
    cards: [],
    errors: [],
    warnings: [],
    duplicates: [],
  };

  try {
    const data = JSON.parse(content);

    // Validate JSON structure
    if (typeof data !== "object" || data === null) {
      preview.errors.push("Invalid JSON format: Root must be an object");
      return preview;
    }

    // Process subscriptions
    if (data.subscriptions && Array.isArray(data.subscriptions)) {
      data.subscriptions.forEach((sub: any, index: number) => {
        try {
          // Validate required fields
          if (!sub.name) {
            preview.errors.push(`Subscription ${index + 1}: Missing name field`);
            return;
          }

          // Check for duplicates
          const existingDuplicate = existingSubscriptions.find(
            (existing) => existing.name.toLowerCase() === sub.name.toLowerCase()
          );

          if (existingDuplicate) {
            preview.duplicates.push({
              type: "subscription",
              existing: existingDuplicate,
              imported: sub,
            });
          }

          // Create normalized subscription
          const subscription: Subscription = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
            name: sub.name,
            cost: parseFloat(sub.cost) || 0,
            billingCycle: sub.billingCycle || "monthly",
            nextPayment: sub.nextPayment || new Date().toISOString().split("T")[0],
            category: sub.category || "Other",
            isActive: sub.isActive !== false,
            subscriptionType: sub.subscriptionType || "personal",
            planType: sub.planType || "paid",
            status: sub.status || "active",
            description: sub.description || "",
            billingUrl: sub.billingUrl || "",
            dateAdded: sub.dateAdded || new Date().toISOString().split("T")[0],
            logoUrl: sub.logoUrl || generateFavicon(sub.name),
            tags: sub.tags || [],
            priority: sub.priority,
            dateCancelled: sub.dateCancelled,
            watchlistNotes: sub.watchlistNotes,
            cardId: sub.cardId,
            variablePricing: sub.variablePricing,
          };

          preview.subscriptions.push({
            ...subscription,
            _importId: `import_sub_${index}`,
          });
        } catch (error) {
          preview.errors.push(
            `Subscription ${index + 1}: ${error instanceof Error ? error.message : "Invalid format"}`
          );
        }
      });
    }

    // Process payment cards
    if (data.cards && Array.isArray(data.cards)) {
      data.cards.forEach((card: any, index: number) => {
        try {
          if (!card.nickname) {
            preview.errors.push(`Card ${index + 1}: Missing nickname field`);
            return;
          }

          // Check for duplicates
          const existingDuplicate = existingCards.find(
            (existing) => existing.nickname.toLowerCase() === card.nickname.toLowerCase()
          );

          if (existingDuplicate) {
            preview.duplicates.push({
              type: "card",
              existing: existingDuplicate,
              imported: card,
            });
          }

          const paymentCard: PaymentCard = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
            nickname: card.nickname,
            lastFour: card.lastFour || "0000",
            type: card.type || "credit",
            issuer: card.issuer || "",
            color: card.color || "#3B82F6",
            isDefault: card.isDefault || false,
            dateAdded: card.dateAdded || new Date().toISOString().split("T")[0],
          };

          preview.cards.push({
            ...paymentCard,
            _importId: `import_card_${index}`,
          });
        } catch (error) {
          preview.errors.push(
            `Card ${index + 1}: ${error instanceof Error ? error.message : "Invalid format"}`
          );
        }
      });
    }

    // Add warnings for unrecognized formats
    if (!data.subscriptions && !data.cards) {
      preview.warnings.push(
        'No recognized data structure found. Expected "subscriptions" and/or "cards" arrays.'
      );
    }
  } catch (error) {
    preview.errors.push(
      `Failed to parse JSON: ${error instanceof Error ? error.message : "Invalid JSON format"}`
    );
  }

  return preview;
}

// Process import based on file type
export function processImportFile(
  file: File,
  existingSubscriptions: Subscription[] = [],
  existingCards: PaymentCard[] = []
): Promise<ImportPreview> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;

        if (file.name.toLowerCase().endsWith(".csv")) {
          resolve(importCSVData(content, existingSubscriptions));
        } else if (file.name.toLowerCase().endsWith(".json")) {
          resolve(importJSONData(content, existingSubscriptions, existingCards));
        } else {
          // Try to detect format by content
          const trimmed = content.trim();
          if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
            resolve(importJSONData(content, existingSubscriptions, existingCards));
          } else {
            resolve(importCSVData(content, existingSubscriptions));
          }
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}

// Apply import preview to actual data
export function applyImport(
  preview: ImportPreview,
  selectedSubscriptions: string[] = [],
  selectedCards: string[] = [],
  duplicateStrategy: "skip" | "replace" | "keep-both" = "skip"
): {
  subscriptions: Subscription[];
  cards: PaymentCard[];
  result: ImportResult;
} {
  const result: ImportResult = {
    success: true,
    imported: { subscriptions: 0, cards: 0 },
    errors: [],
    warnings: [],
  };

  // Filter selected items and remove errors/import metadata
  const subscriptions = preview.subscriptions
    .filter(
      (sub) => selectedSubscriptions.length === 0 || selectedSubscriptions.includes(sub._importId)
    )
    .filter((sub) => !sub._errors || sub._errors.length === 0)
    .map((sub) => {
      const { _importId, _errors, ...cleanSub } = sub;
      return cleanSub as Subscription;
    });

  const cards = preview.cards
    .filter((card) => selectedCards.length === 0 || selectedCards.includes(card._importId))
    .filter((card) => !card._errors || card._errors.length === 0)
    .map((card) => {
      const { _importId, _errors, ...cleanCard } = card;
      return cleanCard as PaymentCard;
    });

  result.imported.subscriptions = subscriptions.length;
  result.imported.cards = cards.length;

  // Handle duplicates based on strategy
  if (preview.duplicates.length > 0) {
    result.warnings.push(
      `${preview.duplicates.length} duplicates detected and handled according to your selection.`
    );
  }

  return {
    subscriptions,
    cards,
    result,
  };
}
