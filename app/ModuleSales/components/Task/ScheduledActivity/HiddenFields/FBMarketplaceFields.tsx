import React, { useState } from "react";

interface FBMarketplaceFieldsProps {
    typecall: string;
    settypecall: (val: string) => void;
}

const FBMarketplaceFields: React.FC<FBMarketplaceFieldsProps> = ({
    typecall,
    settypecall,
}) => {
    return (
        <>
            <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                <label className="block text-xs font-bold mb-2">Type</label>
                <select
                    value={typecall}
                    onChange={(e) => settypecall(e.target.value)}
                    className="w-full px-3 py-2 border-b text-xs capitalize bg-white"
                >
                    <option value="">Select Type</option>
                    <option value="Posting">Posting</option>
                    <option value="Reply Message">Reply Message</option>
                </select>
            </div>
        </>
    );
};

export default FBMarketplaceFields;
