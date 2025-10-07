import React, { useState, useEffect } from "react";
import InformationCard from "./InformationCard";
import CallActivityChart from "./Chart/CallActivityChart";
import ClienEngagementOverview from "./Chart/ClientEngagementOverview";
import DailyTimeMotionAnalysis from "./Chart/DailyTimeMotionAnalysis";
import DailyCallProductivityReport from "./Chart/DailyCallProductivityReport";
import QuotationProductivityOverview from "./Chart/QuotationProductivityOverview";
import SalesPerformanceSummary from "./Chart/SalesPerformanceSummary";
import DailyActivitySummary from "./Chart/DailyActivitySummary";

interface FormFieldsProps {
  Firstname: string;
  setFirstname: (value: string) => void;
  Lastname: string;
  setLastname: (value: string) => void;
  Email: string;
  setEmail: (value: string) => void;
  userName: string;
  setuserName: (value: string) => void;
  Status: string;
  setStatus: (value: string) => void;
  TargetQuota: string;
  setTargetQuota: (value: string) => void;
  ReferenceID: string;
  setReferenceID: (value: string) => void;
  editPost: any;
}

const INBOUND_ACTIVITIES = [
  "Inbound Call",
  "Bidding Preperation",
  "Client Meeting",
  "Site Visit",
  "Check/Read emails",
  "Viber Replies",
  "Follow Up",
  "Quotation Preparation",
  "FB-Marketplace",
];

const UserFormFields: React.FC<FormFieldsProps> = ({
  Firstname, setFirstname,
  Lastname, setLastname,
  Email, setEmail,
  userName, setuserName,
  Status, setStatus,
  TargetQuota, setTargetQuota,
  ReferenceID, setReferenceID,
  editPost,
}) => {

  // Date Range
  const [startdate, setStartdate] = useState("");
  const [enddate, setEnddate] = useState("");
  // Functions
  const [touchbaseData, setTouchbaseData] = useState<Record<string, number>>({});
  const [timeMotionData, setTimeMotionData] = useState({ inbound: 0, outbound: 0, others: 0 });
  const [callData, setCallData] = useState({ dailyInbound: 0, dailyOutbound: 0, dailySuccessful: 0, dailyUnsuccessful: 0, mtdInbound: 0, mtdOutbound: 0, mtdSuccessful: 0, mtdUnsuccessful: 0, });
  const [activityData, setActivityData] = useState<Record<string, number>>({});
  const [countsales, setCountsales] = useState<Record<string, number>>({});

  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    fetchProgressData();
  }, [ReferenceID]);

  useEffect(() => {
    fetchProgressData();
  }, [startdate, enddate]);

  const fetchProgressData = async () => {
    try {
      const response = await fetch(
        `/api/ModuleSales/Agents/SalesAssociateActivity/FetchProgress?referenceid=${encodeURIComponent(ReferenceID)}`
      );
      const data = await response.json();

      if (!data.success) {
        console.error("Failed to fetch progress data:", data.error);
        return;
      }

      const today = new Date();
      const startOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
      const startOfYear = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
      const endOfToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59));

      const filteredData = data.data.filter((item: any) => {
        const itemDate = new Date(item.date_created);
        const itemDateStr = itemDate.toISOString().split("T")[0];

        return (!startdate || itemDateStr >= startdate) &&
          (!enddate || itemDateStr <= enddate);
      });

      setTimeMotionData(computeTimeSpent(filteredData));
      setTouchbaseData(countTouchBase(filteredData));
      setCallData(computeCallSummary(filteredData));
      setActivityData(countActivities(filteredData));

      let totalActualSales = 0;
      let monthToDateSales = 0;
      let yearToDateSales = 0;

      filteredData.forEach((item: any) => {
        const actualSales = parseFloat(item.actualsales);
        if (isNaN(actualSales) || actualSales === 0) return;

        const itemDate = new Date(item.date_created);

        totalActualSales += actualSales;

        if (itemDate >= startOfYear && itemDate <= endOfToday) {
          yearToDateSales += actualSales;
        }

        if (itemDate >= startOfMonth && itemDate <= endOfToday) {
          monthToDateSales += actualSales;
        }
      });

      setCountsales({
        MonthToDateSales: monthToDateSales,
        YearToDateSales: yearToDateSales,
        TotalActualSales: totalActualSales,
      });

    } catch (error) {
      console.error("Error fetching progress data:", error);
    }
  };

  const countActivities = (data: any[]) =>
    data.reduce((acc: Record<string, number>, item) => {
      if (["Account Development", "Quotation Preparation"].includes(item.typeactivity)) {
        acc[item.typeactivity] = (acc[item.typeactivity] || 0) + 1;
      }
      return acc;
    }, {});

  const computeCallSummary = (data: any[]): {
    dailyInbound: number;
    dailyOutbound: number;
    dailySuccessful: number;
    dailyUnsuccessful: number;
    mtdInbound: number;
    mtdOutbound: number;
    mtdSuccessful: number;
    mtdUnsuccessful: number;
  } => {
    return data.reduce(
      (acc, item) => {
        const itemDate = item.date_created.split("T")[0];
        const itemMonth = item.date_created.slice(0, 7);

        const isWithinDateRange =
          (!startdate || itemDate >= startdate) && (!enddate || itemDate <= enddate);

        if (isWithinDateRange) {
          if (item.typeactivity === "Inbound Call") {
            acc.dailyInbound += 1;
          }
          if (item.typeactivity === "Outbound calls") {
            acc.dailyOutbound += 1;
          }
          if (item.callstatus === "Successful") {
            acc.dailySuccessful += 1;
          } else if (item.callstatus === "Unsuccessful") {
            acc.dailyUnsuccessful += 1;
          }

          acc.dailyOutbound = acc.dailySuccessful + acc.dailyUnsuccessful;
        }

        if (itemMonth === currentMonth) {
          if (item.typeactivity === "Inbound Call") {
            acc.mtdInbound += 1;
          }
          if (item.typeactivity === "Outbound calls") {
            acc.mtdOutbound += 1;
          }
          if (item.callstatus === "Successful") {
            acc.mtdSuccessful += 1;
          } else if (item.callstatus === "Unsuccessful") {
            acc.mtdUnsuccessful += 1;
          }

          acc.mtdOutbound = acc.mtdSuccessful + acc.mtdUnsuccessful;
        }

        return acc;
      },
      {
        dailyInbound: 0,
        dailyOutbound: 0,
        dailySuccessful: 0,
        dailyUnsuccessful: 0,
        mtdInbound: 0,
        mtdOutbound: 0,
        mtdSuccessful: 0,
        mtdUnsuccessful: 0,
      }
    );
  };

  const computeTimeSpent = (data: any[]) => {
    return data.reduce(
      (acc: { inbound: number; outbound: number; others: number } & Record<string, number>, item) => {
        if (item.startdate && item.enddate) {
          const duration = (new Date(item.enddate).getTime() - new Date(item.startdate).getTime()) / 1000;

          if (INBOUND_ACTIVITIES.includes(item.typeactivity)) {
            acc.inbound += duration;
          } else if (item.typeactivity === "Outbound calls") {
            acc.outbound += duration;
          } else {
            acc.others += duration;
          }

          const validActivities = new Set([
            "Customer Order",
            "Customer Inquiry Sales",
            "Follow Up",
            "FB-Marketplace",
            "After Sales-Refund",
            "After Sales-Repair/Replacement",
            "Quotation Preparation",
            "Sales Order Preparation",
            "Delivery Concern",
            "Accounting Concern",
            "Admin- Supplier Accreditation",
            "Admin- Credit Terms Application",
            "Inbound Call",
            "Outbound calls",
            "Site Visit",
            "Check/Read emails",
            "Bidding Preperation",
            "Viber Replies",
            "Technical Concern",
            "Sample Request",
            "Assisting Other Agent Clients",
            "Coordination of SO To Warehouse",
            "Coordination of SO to Orders",
            "Updating Reports",
            "Check/Read emails",
            "Documentation",
          ]);

          if (validActivities.has(item.typeactivity)) {
            acc[item.typeactivity] = (acc[item.typeactivity] || 0) + duration;
          }
        }
        return acc;
      },
      {
        inbound: 0,
        outbound: 0,
        others: 0,
      } as { inbound: number; outbound: number; others: number } & Record<string, number>
    );
  };

  const countTouchBase = (data: any[]) =>
    data.reduce((acc: Record<string, number>, item) => {
      if (item.source === "Outbound - Touchbase") {
        const key = `${item.typeclient}-${item.source}`;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});

  return (
    <>
      <div className="bg-white w-full max-width mx-auto mb-4">
        <div className="grid grid-cols-1 gap-6">
          <InformationCard
            Firstname={Firstname}
            Lastname={Lastname}
            ReferenceID={ReferenceID}
            Email={Email}
            userName={userName}
            Status={Status}
            TargetQuota={TargetQuota}
            startdate={startdate}
            enddate={enddate}
            setStatus={setStatus}
            setTargetQuota={setTargetQuota}
            setStartdate={setStartdate}
            setEnddate={setEnddate}
          />

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <CallActivityChart callData={callData} />
          <ClienEngagementOverview touchbaseData={touchbaseData} />
          <DailyCallProductivityReport callData={callData} />
          <DailyTimeMotionAnalysis timeMotionData={timeMotionData} />
          <QuotationProductivityOverview activityData={activityData} />
          <SalesPerformanceSummary countsales={countsales} />
          <DailyActivitySummary timeMotionData={timeMotionData} />
        </div>

      </div >
    </>
  );
};

export default UserFormFields;