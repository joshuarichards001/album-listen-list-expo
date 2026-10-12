export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3";
  };
  public: {
    Tables: {
      album_reviews: {
        Row: {
          album_id: number;
          created_at: string;
          id: number;
          note: string | null;
          rating: number | null;
          user_id: string;
        };
        Insert: {
          album_id: number;
          created_at?: string;
          id?: number;
          note?: string | null;
          rating?: number | null;
          user_id: string;
        };
        Update: {
          album_id?: number;
          created_at?: string;
          id?: number;
          note?: string | null;
          rating?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "album_review_album_id_fkey";
            columns: ["album_id"];
            isOneToOne: false;
            referencedRelation: "albums";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "album_review_album_id_fkey";
            columns: ["album_id"];
            isOneToOne: false;
            referencedRelation: "albums_and_reviews_in_list";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "album_reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      albums: {
        Row: {
          artist_name: string;
          artist_spotify_id: string | null;
          cover_art: string | null;
          created_at: string;
          id: number;
          name: string;
          release_date: string | null;
          spotify_id: string;
          total_tracks: number | null;
        };
        Insert: {
          artist_name: string;
          artist_spotify_id?: string | null;
          cover_art?: string | null;
          created_at?: string;
          id?: number;
          name: string;
          release_date?: string | null;
          spotify_id: string;
          total_tracks?: number | null;
        };
        Update: {
          artist_name?: string;
          artist_spotify_id?: string | null;
          cover_art?: string | null;
          created_at?: string;
          id?: number;
          name?: string;
          release_date?: string | null;
          spotify_id?: string;
          total_tracks?: number | null;
        };
        Relationships: [];
      };
      list_albums: {
        Row: {
          album_id: number;
          id: number;
          list_id: number;
          time_added: string;
        };
        Insert: {
          album_id: number;
          id?: number;
          list_id: number;
          time_added?: string;
        };
        Update: {
          album_id?: number;
          id?: number;
          list_id?: number;
          time_added?: string;
        };
        Relationships: [
          {
            foreignKeyName: "list_album_album_id_fkey";
            columns: ["album_id"];
            isOneToOne: false;
            referencedRelation: "albums";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "list_album_album_id_fkey";
            columns: ["album_id"];
            isOneToOne: false;
            referencedRelation: "albums_and_reviews_in_list";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "list_album_list_id_fkey";
            columns: ["list_id"];
            isOneToOne: false;
            referencedRelation: "lists";
            referencedColumns: ["id"];
          },
        ];
      };
      lists: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          public: boolean;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
          public?: boolean;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          public?: boolean;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lists_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      platform_preference_response: {
        Row: {
          created_at: string;
          id: number;
          response: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          response: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          response?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string;
          id: string;
          migrated: boolean;
          provider: string;
          provider_id: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          migrated?: boolean;
          provider: string;
          provider_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          migrated?: boolean;
          provider?: string;
          provider_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      albums_and_reviews_in_list: {
        Row: {
          artist_name: string | null;
          artist_spotify_id: string | null;
          cover_art: string | null;
          id: number | null;
          list_id: number | null;
          name: string | null;
          note: string | null;
          rating: number | null;
          release_date: string | null;
          review_date: string | null;
          spotify_id: string | null;
          time_added: string | null;
          total_tracks: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "list_album_list_id_fkey";
            columns: ["list_id"];
            isOneToOne: false;
            referencedRelation: "lists";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
