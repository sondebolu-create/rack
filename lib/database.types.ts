export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      order_fulfillments: {
        Row: {
          id: string
          order_id: string
          shop_id: string
          status: Database["public"]["Enums"]["fulfillment_status"]
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          shop_id: string
          status?: Database["public"]["Enums"]["fulfillment_status"]
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          shop_id?: string
          status?: Database["public"]["Enums"]["fulfillment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_fulfillments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_fulfillments_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          colour_name: string
          id: string
          order_id: string
          product_name: string
          quantity: number
          shop_id: string
          size: Database["public"]["Enums"]["size"]
          unit_price_minor: number
          variant_id: string | null
        }
        Insert: {
          colour_name: string
          id?: string
          order_id: string
          product_name: string
          quantity: number
          shop_id: string
          size: Database["public"]["Enums"]["size"]
          unit_price_minor: number
          variant_id?: string | null
        }
        Update: {
          colour_name?: string
          id?: string
          order_id?: string
          product_name?: string
          quantity?: number
          shop_id?: string
          size?: Database["public"]["Enums"]["size"]
          unit_price_minor?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          delivery_address: string
          delivery_city: string
          delivery_name: string
          delivery_phone: string
          id: string
          order_number: number
          shopper_id: string
          status: Database["public"]["Enums"]["order_status"]
          total_minor: number
        }
        Insert: {
          created_at?: string
          currency?: string
          delivery_address: string
          delivery_city: string
          delivery_name: string
          delivery_phone: string
          id?: string
          order_number?: never
          shopper_id: string
          status?: Database["public"]["Enums"]["order_status"]
          total_minor: number
        }
        Update: {
          created_at?: string
          currency?: string
          delivery_address?: string
          delivery_city?: string
          delivery_name?: string
          delivery_phone?: string
          id?: string
          order_number?: never
          shopper_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_minor?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_shopper_id_fkey"
            columns: ["shopper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: string
          id: string
          position: number
          product_id: string
          url: string
        }
        Insert: {
          alt?: string
          id?: string
          position?: number
          product_id: string
          url: string
        }
        Update: {
          alt?: string
          id?: string
          position?: number
          product_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          colour_hex: string
          colour_name: string
          id: string
          product_id: string
          size: Database["public"]["Enums"]["size"]
          sku: string | null
          stock: number
        }
        Insert: {
          colour_hex: string
          colour_name: string
          id?: string
          product_id: string
          size: Database["public"]["Enums"]["size"]
          sku?: string | null
          stock?: number
        }
        Update: {
          colour_hex?: string
          colour_name?: string
          id?: string
          product_id?: string
          size?: Database["public"]["Enums"]["size"]
          sku?: string | null
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          currency: string
          description: string | null
          featured: boolean
          gender: Database["public"]["Enums"]["gender_focus"]
          id: string
          name: string
          price_minor: number
          shop_id: string
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          currency?: string
          description?: string | null
          featured?: boolean
          gender?: Database["public"]["Enums"]["gender_focus"]
          id?: string
          name: string
          price_minor: number
          shop_id: string
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          currency?: string
          description?: string | null
          featured?: boolean
          gender?: Database["public"]["Enums"]["gender_focus"]
          id?: string
          name?: string
          price_minor?: number
          shop_id?: string
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          city?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      shops: {
        Row: {
          banner_url: string | null
          categories: string[]
          city: string | null
          created_at: string
          description: string | null
          featured: boolean
          gender_focus: Database["public"]["Enums"]["gender_focus"]
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          slug: string
          status: Database["public"]["Enums"]["shop_status"]
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          categories?: string[]
          city?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          gender_focus?: Database["public"]["Enums"]["gender_focus"]
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          slug: string
          status?: Database["public"]["Enums"]["shop_status"]
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          categories?: string[]
          city?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          gender_focus?: Database["public"]["Enums"]["gender_focus"]
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          slug?: string
          status?: Database["public"]["Enums"]["shop_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shops_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_applications: {
        Row: {
          business_name: string
          categories: string[]
          city: string
          created_at: string
          id: string
          instagram_handle: string | null
          note: string | null
          phone: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sample_photo_urls: string[]
          status: Database["public"]["Enums"]["application_status"]
          user_id: string
        }
        Insert: {
          business_name: string
          categories?: string[]
          city: string
          created_at?: string
          id?: string
          instagram_handle?: string | null
          note?: string | null
          phone: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sample_photo_urls?: string[]
          status?: Database["public"]["Enums"]["application_status"]
          user_id: string
        }
        Update: {
          business_name?: string
          categories?: string[]
          city?: string
          created_at?: string
          id?: string
          instagram_handle?: string | null
          note?: string | null
          phone?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sample_photo_urls?: string[]
          status?: Database["public"]["Enums"]["application_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          feature: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          feature?: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          feature?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_vendor: { Args: { application_id: string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_vendor: { Args: never; Returns: boolean }
      owns_order: { Args: { p_order_id: string }; Returns: boolean }
      owns_product: { Args: { p_product_id: string }; Returns: boolean }
      owns_shop: { Args: { p_shop_id: string }; Returns: boolean }
      owns_shop_folder: { Args: { p_folder: string }; Returns: boolean }
      place_order: { Args: { delivery: Json; items: Json }; Returns: string }
      product_is_public: { Args: { p_product_id: string }; Returns: boolean }
      vendor_has_order: { Args: { p_order_id: string }; Returns: boolean }
    }
    Enums: {
      application_status: "pending" | "approved" | "rejected"
      fulfillment_status:
        | "reserved"
        | "confirmed"
        | "shipped"
        | "delivered"
        | "cancelled"
      gender_focus: "women" | "men" | "both"
      order_status:
        | "pending_payment"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      product_status: "draft" | "published" | "archived"
      shop_status: "draft" | "live"
      size: "XS" | "S" | "M" | "L" | "XL" | "XXL"
      user_role: "shopper" | "vendor" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      application_status: ["pending", "approved", "rejected"],
      fulfillment_status: [
        "reserved",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      gender_focus: ["women", "men", "both"],
      order_status: [
        "pending_payment",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      product_status: ["draft", "published", "archived"],
      shop_status: ["draft", "live"],
      size: ["XS", "S", "M", "L", "XL", "XXL"],
      user_role: ["shopper", "vendor", "admin"],
    },
  },
} as const
