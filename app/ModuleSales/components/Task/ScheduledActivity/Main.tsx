import React from "react";
import MainCardTable from "./MainCardTable";

interface Post {
  id: string;
  companyname: string;
  contactperson: string;
  contactnumber: string;
  typeclient: string;
  activitystatus: string;
  ticketreferencenumber: string;
  date_created: string;
  date_updated: string | null;
  source: string;
  typeactivity: string;
  targetquota: string;
}

interface UserDetails {
  UserId: string;
  ReferenceID: string;
  Manager: string;
  TSM: string;
  TargetQuota: string;
}

interface UsersTableProps {
  posts: any[];
  userDetails: {
    UserId: string;
    Firstname: string;
    Lastname: string;
    Email: string;
    Role: string;
    Department: string;
    Company: string;
    TargetQuota: string;
    ReferenceID: string;
    Manager: string;
    TSM: string;
  };

  fetchAccount: () => void;
}

const Main: React.FC<UsersTableProps> = ({ posts, userDetails, fetchAccount }) => {
  return (
    <div className=" mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
        <section className="lg:col-span-4 bg-white rounded-xl">
          <MainCardTable posts={posts} userDetails={userDetails} fetchAccount={fetchAccount} />
        </section>
      </div>
    </div>
  );
};

export default Main;
