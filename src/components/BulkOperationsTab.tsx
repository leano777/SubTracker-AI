import { useState } from "react";
import {
  Upload,
  Download,
  FileText,
  Search,
  CheckCircle,
  AlertCircle,
  Copy,
  Trash2,
  Edit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import type { Subscription, PaymentCard } from "../types/subscription";
import { formatCurrency } from "../utils/helpers";

interface BulkOperationsTabProps {
  subscriptions: Subscription[];
  cards: PaymentCard[];
  onBulkEdit: (subscriptionIds: string[], updates: Partial<Subscription>) => void;
  onBulkDelete: (subscriptionIds: string[]) => void;
  onImport: (data: any) => void;
  onExport: (format: "json" | "csv") => void;
}

export function BulkOperationsTab({
  subscriptions,
  cards,
  onBulkEdit,
  onBulkDelete,
  onImport,
  onExport,
}: BulkOperationsTabProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [importData, setImportData] = useState("");
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [exportStatus, setExportStatus] = useState<"idle" | "success">("idle");

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    const matchesType = typeFilter === "all" || sub.subscriptionType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredSubscriptions.map((sub) => sub.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectSubscription = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((prevId) => prevId !== id));
    }
  };

  const handleBulkStatusChange = (newStatus: "active" | "cancelled" | "watchlist") => {
    onBulkEdit(selectedIds, { status: newStatus });
    setSelectedIds([]);
    setShowBulkActions(false);
  };

  const handleBulkTypeChange = (newType: "personal" | "business") => {
    onBulkEdit(selectedIds, { subscriptionType: newType });
    setSelectedIds([]);
    setShowBulkActions(false);
  };

  const handleBulkDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete ${selectedIds.length} subscriptions? This action cannot be undone.`
      )
    ) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
      setShowBulkActions(false);
    }
  };

  const handleExport = (format: "json" | "csv") => {
    onExport(format);
    setExportStatus("success");
    setTimeout(() => setExportStatus("idle"), 3000);
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importData);
      onImport(data);
      setImportStatus("success");
      setImportData("");
      setTimeout(() => setImportStatus("idle"), 3000);
    } catch (error) {
      setImportStatus("error");
      setTimeout(() => setImportStatus("idle"), 3000);
    }
  };

  const copyShareableData = async () => {
    const shareData = {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter((sub) => sub.status === "active").length,
      monthlyTotal: subscriptions
        .filter((sub) => sub.status === "active")
        .reduce((total, sub) => {
          const monthlyCost =
            sub.billingCycle === "monthly"
              ? sub.cost
              : sub.billingCycle === "quarterly"
                ? sub.cost / 3
                : sub.cost / 12;
          return total + monthlyCost;
        }, 0),
      categories: [...new Set(subscriptions.map((sub) => sub.category))],
      topServices: subscriptions
        .filter((sub) => sub.status === "active")
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5)
        .map((sub) => ({ name: sub.name, cost: sub.cost })),
    };

    const shareText = `📊 My Subscription Summary

💰 Monthly Total: ${formatCurrency(shareData.monthlyTotal)}
📱 Active: ${shareData.activeSubscriptions}/${shareData.totalSubscriptions} subscriptions
📂 ${shareData.categories.length} categories tracked

🔝 Top 5 Services:
${shareData.topServices.map((service) => `• ${service.name}: ${formatCurrency(service.cost)}`).join("\n")}

Managed with Subscription Tracker Pro ✨`;

    try {
      await navigator.clipboard.writeText(shareText);
      alert("Summary copied to clipboard!");
    } catch (err) {
      alert("Could not copy to clipboard");
    }
  };

  const calculateSelectionStats = () => {
    const selectedSubs = subscriptions.filter((sub) => selectedIds.includes(sub.id));
    const totalCost = selectedSubs.reduce((sum, sub) => {
      const monthlyCost =
        sub.billingCycle === "monthly"
          ? sub.cost
          : sub.billingCycle === "quarterly"
            ? sub.cost / 3
            : sub.cost / 12;
      return sum + monthlyCost;
    }, 0);

    return {
      count: selectedSubs.length,
      totalCost,
      activeCount: selectedSubs.filter((sub) => sub.status === "active").length,
    };
  };

  const selectionStats = calculateSelectionStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center space-x-2">
            <FileText className="w-6 h-6" />
            <span>Bulk Operations</span>
          </h2>
          <p className="text-muted-foreground">
            Import, export, and manage multiple subscriptions at once
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedIds.length > 0 && (
            <Button variant="outline" onClick={() => setShowBulkActions(!showBulkActions)}>
              <Edit className="w-4 h-4 mr-2" />
              Bulk Actions ({selectedIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {importStatus === "success" && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Data imported successfully!</AlertDescription>
        </Alert>
      )}

      {importStatus === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Import failed. Please check your data format and try again.
          </AlertDescription>
        </Alert>
      )}

      {exportStatus === "success" && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Data exported successfully!</AlertDescription>
        </Alert>
      )}

      {/* Bulk Actions Panel */}
      {showBulkActions && selectedIds.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">
              Bulk Actions - {selectionStats.count} selected
            </CardTitle>
            <CardDescription>
              Monthly cost: {formatCurrency(selectionStats.totalCost)} •{" "}
              {selectionStats.activeCount} active
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => handleBulkStatusChange("active")}>
                Mark as Active
              </Button>
              <Button size="sm" onClick={() => handleBulkStatusChange("cancelled")}>
                Mark as Cancelled
              </Button>
              <Button size="sm" onClick={() => handleBulkStatusChange("watchlist")}>
                Move to Watchlist
              </Button>
              <Button size="sm" onClick={() => handleBulkTypeChange("personal")}>
                Set as Personal
              </Button>
              <Button size="sm" onClick={() => handleBulkTypeChange("business")}>
                Set as Business
              </Button>
              <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="w-4 h-4 mr-1" />
                Delete Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import/Export Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Export Data</span>
            </CardTitle>
            <CardDescription>
              Download your subscription data for backup or analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() => handleExport("json")}
                className="h-auto p-4 flex-col items-start"
              >
                <div className="flex items-center space-x-2 mb-2 w-full">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Export as JSON</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  Complete backup with all data, settings, and metadata
                </p>
              </Button>

              <Button
                onClick={() => handleExport("csv")}
                variant="outline"
                className="h-auto p-4 flex-col items-start"
              >
                <div className="flex items-center space-x-2 mb-2 w-full">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Export as CSV</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  Spreadsheet format for analysis in Excel or Google Sheets
                </p>
              </Button>

              <Button
                onClick={copyShareableData}
                variant="outline"
                className="h-auto p-4 flex-col items-start"
              >
                <div className="flex items-center space-x-2 mb-2 w-full">
                  <Copy className="w-5 h-5" />
                  <span className="font-medium">Copy Summary</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  Shareable text summary for social media or messaging
                </p>
              </Button>
            </div>

            <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
              <p className="font-medium mb-1">Export includes:</p>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li>{subscriptions.length} subscriptions</li>
                <li>{cards.length} payment cards</li>
                <li>All settings and preferences</li>
                <li>Export metadata and timestamps</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Import Data</span>
            </CardTitle>
            <CardDescription>
              Import subscription data from a backup or external source
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="importData">Paste JSON Data</Label>
              <Textarea
                id="importData"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste your exported JSON data here..."
                rows={6}
                className="text-xs font-mono"
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleImport} disabled={!importData.trim()} className="flex-1">
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
              <Button variant="outline" onClick={() => setImportData("")}>
                Clear
              </Button>
            </div>

            <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
              <p className="font-medium mb-1">Import guidelines:</p>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li>Only JSON format is supported</li>
                <li>Data will be merged with existing entries</li>
                <li>Duplicate subscriptions may be created</li>
                <li>Service logos will be auto-generated</li>
                <li>Settings will be preserved unless overwritten</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selection and Filtering */}
      <Card>
        <CardHeader>
          <CardTitle>Select & Filter Subscriptions</CardTitle>
          <CardDescription>
            Use filters to find specific subscriptions, then select multiple items for bulk
            operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search subscriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="watchlist">Watchlist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleSelectAll(true)}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSelectAll(false)}>
                  Clear
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredSubscriptions.length} subscription
                {filteredSubscriptions.length !== 1 ? "s" : ""} found
                {selectedIds.length > 0 && ` • ${selectedIds.length} selected`}
              </p>
              {selectedIds.length > 0 && (
                <Badge variant="secondary">
                  {formatCurrency(selectionStats.totalCost)}/month selected
                </Badge>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto border rounded-lg">
              {filteredSubscriptions.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No subscriptions match your filters
                </div>
              ) : (
                <div className="divide-y">
                  {filteredSubscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="flex items-center space-x-3 p-3 hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={selectedIds.includes(subscription.id)}
                        onCheckedChange={(checked) =>
                          handleSelectSubscription(subscription.id, checked as boolean)
                        }
                      />
                      {subscription.logoUrl && (
                        <img src={subscription.logoUrl} alt="" className="w-6 h-6 rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{subscription.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(subscription.cost)}/{subscription.billingCycle} •{" "}
                          {subscription.category}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                          {subscription.status}
                        </Badge>
                        <Badge variant="outline">{subscription.subscriptionType}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Data Overview</CardTitle>
          <CardDescription>Current database statistics and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{subscriptions.length}</div>
              <div className="text-sm text-muted-foreground">Total Subscriptions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {subscriptions.filter((sub) => sub.status === "active").length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {[...new Set(subscriptions.map((sub) => sub.category))].length}
              </div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{cards.length}</div>
              <div className="text-sm text-muted-foreground">Payment Cards</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
