export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          reference_id: string;
          company_id?: number;
          companyname: string;
          contactperson?: string | null;
          contactnumber?: string | null;
          emailaddress?: string | null;
          typeclient?: string | null;
          address?: string | null;
          last_added: string;
        };
        Insert: {
          reference_id: string;
          company_id?: number;
          companyname: string;
          contactperson?: string | null;
          contactnumber?: string | null;
          emailaddress?: string | null;
          typeclient?: string | null;
          address?: string | null;
          last_added?: string;
        };
        Update: Partial<{
          reference_id: string;
          company_id: number;
          companyname: string;
          contactperson: string | null;
          contactnumber: string | null;
          emailaddress: string | null;
          typeclient: string | null;
          address: string | null;
          last_added: string;
        }>;
      };
    };
    Views: {};
    Functions: {};
  };
}
