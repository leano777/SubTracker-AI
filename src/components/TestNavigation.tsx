import React, { useState } from "react";

export const TestNavigation = () => {
  const [activeTab, setActiveTab] = useState("overview");

  console.log("TestNavigation render, activeTab:", activeTab);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "subscriptions", label: "Subscriptions" },
    { id: "planning", label: "Planning" },
    { id: "intelligence", label: "Intelligence" },
  ];

  const handleTabClick = (tabId: string) => {
    console.log("🔥 DIRECT TAB CLICK:", tabId);
    setActiveTab(tabId);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Test Navigation</h2>

      {/* Simple button navigation */}
      <div className="flex space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`px-4 py-2 rounded border ${
              activeTab === tab.id
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Active Tab: {activeTab}</h3>
        {activeTab === "overview" && <div>Overview Content - This is working!</div>}
        {activeTab === "subscriptions" && <div>Subscriptions Content - Navigation works!</div>}
        {activeTab === "planning" && <div>Planning Content - Success!</div>}
        {activeTab === "intelligence" && <div>Intelligence Content - Perfect!</div>}
      </div>
    </div>
  );
};
