"use client";

import React from "react";

interface SignatureSectionProps {
  userDetails: any;
  headDetails?: any;
  managerDetails?: any;
}

const SignatureSection: React.FC<SignatureSectionProps> = ({
  userDetails,
  headDetails,
  managerDetails,
}) => {
  return (
    <div className="mt-4 grid grid-cols-4 gap-4 text-xs">
      {/* Left Column */}
      <div className="col-span-2 w-full pr-4 space-y-6">
        <p className="italic font-semibold">Ecoshift Corporation</p>

        <div>
          <p className="font-semibold capitalize">
            {userDetails.Firstname} {userDetails.Lastname}
          </p>
          <div className="border-t border-black w-full max-w-xs my-1"></div>
          <p className="font-semibold">SALES REPRESENTATIVE</p>
          <p>Mobile No: {userDetails.ContactNumber || "-"}</p>
          <p>Email: {userDetails.Email || "-"}</p>
        </div>

        <div>
          <p>Approved By:</p>
          <p className="font-semibold mt-8 capitalize">
            {headDetails
              ? `${headDetails.Firstname} ${headDetails.Lastname}`
              : ""}
          </p>
          <div className="border-t border-black w-full max-w-xs my-1"></div>
          <p className="font-semibold">SALES MANAGER</p>
          <p>Mobile No: {headDetails ? `${headDetails.ContactNumber}` : ""}</p>
          <p>Email: {headDetails ? `${headDetails.Email}` : ""}</p>
        </div>

        <div>
          <p>Noted By:</p>
          <p className="font-semibold mt-8 capitalize">
            {managerDetails
              ? `${managerDetails.Firstname} ${managerDetails.Lastname}`
              : ""}
          </p>
          <div className="border-t border-black w-full max-w-xs my-1"></div>
          <p className="font-semibold">SALES HEAD B2B</p>
        </div>
      </div>

      {/* Right Column */}
      <div className="col-span-2 w-full pl-4 space-y-12 mt-8">
        <div className="mt-8">
          <div className="border-t border-black w-full max-w-sm my-1"></div>
          <p>COMPANY AUTHORIZED REPRESENTATIVE</p>
          <p>(PLEASE SIGN OVER PRINTED NAME)</p>
        </div>

        <div>
          <div className="border-t border-black w-full max-w-sm my-1"></div>
          <p>PAYMENT RELEASE DATE</p>
        </div>
      </div>
    </div>
  );
};

export default SignatureSection;
