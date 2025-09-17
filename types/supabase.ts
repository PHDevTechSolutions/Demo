export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: number;
          reference_id: string;
          company_name: string;
          contact_person: string;
          contact_number: string;
          email_address: string;
          type_client: string;
          address: string | null;
          last_added: string;
          status: string;
        };
        Insert: {
          id?: number;
          reference_id: string;
          company_name: string;
          contact_person: string;
          contact_number: string;
          email_address: string;
          type_client: string;
          address?: string | null;
          last_added?: string;
          status?: string;
        };
        Update: {
          reference_id?: string;
          company_name?: string;
          contact_person?: string;
          contact_number?: string;
          email_address?: string;
          type_client?: string;
          address?: string | null;
          last_added?: string;
          status?: string;
        };
      };
    };
    Views: {};
    Functions: {};
  };
}
