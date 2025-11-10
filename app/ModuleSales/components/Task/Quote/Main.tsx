"use client";

import React, { useState } from "react";
import Form from "./Form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface UserDetails {
  ReferenceID: string;
  Firstname: string;
  Lastname: string;
  Manager: string;
  TSM: string;
  Role: string;
  ContactNumber: string;
  profilePicture?: string;
}

interface QuoteItem {
  id: number;
  referenceid: string;
  manager: string;
  tsm: string;
  companyname: string;
  contactperson: string;
  contactnumber: string;
  emailaddress: string;
  address: string;
  quotationnumber: string;
  projectcategory: string;
  quotationamount: string;
}

interface QuoteProps {
  userDetails: UserDetails;
}

const Quote: React.FC<QuoteProps> = ({ userDetails }) => {
  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error("Please enter a quotation number");
      return;
    }

    const toastId = toast.loading("Searching...");

    setLoading(true);
    try {
      const res = await fetch(
        `/api/ModuleSales/Task/ActivityPlanner/FetchQuote?referenceid=${userDetails.ReferenceID}`
      );
      if (!res.ok) throw new Error("Failed to fetch data");

      const { data } = await res.json();

      const filtered = (data || []).filter(
        (q: QuoteItem) => q.quotationnumber === searchValue
      );

      if (filtered.length === 0) {
        toast.dismiss(toastId);
        toast("No matching quotation found");
      } else {
        toast.dismiss(toastId);
        toast.success("Quotation found");
      }

      setResults(filtered);
      setSelectedQuote(null);
      setShowForm(false);
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Error while fetching quotations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white p-4">
      <h2 className="text-lg font-semibold text-black mb-2">Quotation</h2>
      <p className="text-sm text-gray-500 mb-4">
        Search quotation numbers and generate activity forms.
      </p>

      {/* Search bar */}
      <div className="flex items-center gap-2 mb-4">
        <Input
          id="search-quotation"
          type="text"
          placeholder="Enter Quotation Number"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="text-xs"
        />
        <Button onClick={handleSearch} disabled={loading} className="text-xs" variant="default">
          {loading ? (
            <div className="flex items-center gap-2">
              <Spinner className="w-4 h-4" />
              Searching...
            </div>
          ) : (
            "Search"
          )}
        </Button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="border rounded p-3 mb-4 bg-gray-50">
          <h3 className="font-semibold text-xs mb-2">Results:</h3>
          <ul className="space-y-2">
            {results.map((q) => (
              <li
                key={q.id}
                onClick={() => setSelectedQuote(q)}
                className={`p-2 rounded cursor-pointer border ${
                  selectedQuote?.id === q.id
                    ? "bg-blue-100 border-blue-400"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                <p className="text-sm font-medium">Quotation #: {q.quotationnumber}</p>
                <p className="text-xs text-gray-500">{q.companyname}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Generate Button */}
      {selectedQuote && !showForm && (
        <div className="mb-4">
          <Button
            onClick={() => setShowForm(true)}
            className="text-xs"
            variant="default"
          >
            Generate
          </Button>
        </div>
      )}

      {/* Form */}
      {showForm && selectedQuote && (
        <Form selectedQuote={selectedQuote} userDetails={userDetails} />
      )}

    </div>
  );
};

export default Quote;
