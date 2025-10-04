"use client";

import React from "react";

interface ClientSectionProps {
  selectedQuote: {
    quotationnumber: string;
    companyname: string;
    address: string;
    contactnumber: string;
    emailaddress: string;
    contactperson: string;
  };
  today: string;
}

const ClientSection: React.FC<ClientSectionProps> = ({ selectedQuote, today }) => {
  return (
    <div className="space-y-4">
      {/* Header Image */}
      <div>
        <img
          src="/quote-header.png"
          alt="Quote Header"
          className="w-full object-cover"
        />
      </div>

      {/* Reference No & Date */}
      <div className="mt-2 text-right text-xs space-y-1">
        <div>
          Reference No:{" "}
          <span className="font-semibold">{selectedQuote.quotationnumber}</span>
        </div>
        <div>
          Date: <span className="font-semibold">{today}</span>
        </div>
      </div>

      {/* Company Info */}
      <div className="mt-4 text-xs space-y-1 border-t border-b pb-2">
        <div>
          Company Name:{" "}
          <span className="font-semibold text-center inline-block w-full">
            {selectedQuote.companyname}
          </span>
        </div>
        <div>
          Address:{" "}
          <span className="font-semibold text-center inline-block w-full uppercase">
            {selectedQuote.address}
          </span>
        </div>
        <div>
          Tel No:{" "}
          <span className="font-semibold text-center inline-block w-full">
            {selectedQuote.contactnumber}
          </span>
        </div>
        <div>
          Email Address:{" "}
          <span className="font-semibold text-center inline-block w-full">
            {selectedQuote.emailaddress}
          </span>
        </div>
      </div>

      {/* Attention & Subject */}
      <div className="mt-2 text-xs border-b pb-2">
        <div>
          Attention:{" "}
          <span className="font-semibold text-center inline-block w-full uppercase">
            {selectedQuote.contactperson}
          </span>
        </div>
        <div>
          Subject:{" "}
          <span className="font-semibold text-center inline-block w-full uppercase">
            {selectedQuote.companyname} - {selectedQuote.contactperson}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClientSection;
