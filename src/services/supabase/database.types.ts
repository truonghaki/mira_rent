// Generated from public schema introspection after migrations 01 -> 04.
// Regenerate against the deployed project before changing its schema; do not hand-edit.
export type Json = string | number | boolean | null | {
    [key: string]: Json | undefined;
} | Json[];
export type Database = {
    public: {
        Tables: {
            "products": {
                Row: {
                    "id": string;
                    "legacy_id": string | null;
                    "slug": string;
                    "name": string;
                    "category": Database["public"]["Enums"]["mira_product_category"];
                    "original_price": number;
                    "first_day_price": number;
                    "additional_day_price": number;
                    "description": string;
                    "sizes": string[];
                    "colors": string[];
                    "material": string;
                    "accessories": string;
                    "cover_image_id": string | null;
                    "is_featured": boolean;
                    "version": number;
                    "created_at": string;
                    "updated_at": string;
                    "deleted_at": string | null;
                };
                Insert: {
                    "id"?: string;
                    "legacy_id"?: string | null;
                    "slug": string;
                    "name": string;
                    "category"?: Database["public"]["Enums"]["mira_product_category"];
                    "original_price"?: number;
                    "first_day_price": number;
                    "additional_day_price": number;
                    "description"?: string;
                    "sizes"?: string[];
                    "colors"?: string[];
                    "material"?: string;
                    "accessories"?: string;
                    "cover_image_id"?: string | null;
                    "is_featured"?: boolean;
                    "version"?: number;
                    "created_at"?: string;
                    "updated_at"?: string;
                    "deleted_at"?: string | null;
                };
                Update: {
                    "id"?: string;
                    "legacy_id"?: string | null;
                    "slug"?: string;
                    "name"?: string;
                    "category"?: Database["public"]["Enums"]["mira_product_category"];
                    "original_price"?: number;
                    "first_day_price"?: number;
                    "additional_day_price"?: number;
                    "description"?: string;
                    "sizes"?: string[];
                    "colors"?: string[];
                    "material"?: string;
                    "accessories"?: string;
                    "cover_image_id"?: string | null;
                    "is_featured"?: boolean;
                    "version"?: number;
                    "created_at"?: string;
                    "updated_at"?: string;
                    "deleted_at"?: string | null;
                };
                Relationships: [
                    {
                        "columns": [
                            "id",
                            "cover_image_id"
                        ];
                        "isOneToOne": false;
                        "foreignKeyName": "cover_belongs_to_product";
                        "referencedColumns": [
                            "product_id",
                            "id"
                        ];
                        "referencedRelation": "product_images";
                    }
                ];
            };
            "rental_events": {
                Row: {
                    "id": number;
                    "order_id": string;
                    "actor_user_id": string | null;
                    "from_status": Database["public"]["Enums"]["mira_rental_status"] | null;
                    "to_status": Database["public"]["Enums"]["mira_rental_status"];
                    "occurred_at": string;
                    "details": Json;
                };
                Insert: {
                    "id"?: never;
                    "order_id": string;
                    "actor_user_id"?: string | null;
                    "from_status"?: Database["public"]["Enums"]["mira_rental_status"] | null;
                    "to_status": Database["public"]["Enums"]["mira_rental_status"];
                    "occurred_at"?: string;
                    "details"?: Json;
                };
                Update: {
                    "id"?: never;
                    "order_id"?: string;
                    "actor_user_id"?: string | null;
                    "from_status"?: Database["public"]["Enums"]["mira_rental_status"] | null;
                    "to_status"?: Database["public"]["Enums"]["mira_rental_status"];
                    "occurred_at"?: string;
                    "details"?: Json;
                };
                Relationships: [
                    {
                        "columns": [
                            "order_id"
                        ];
                        "isOneToOne": false;
                        "foreignKeyName": "rental_events_order_id_fkey";
                        "referencedColumns": [
                            "id"
                        ];
                        "referencedRelation": "rental_orders";
                    }
                ];
            };
            "rental_orders": {
                Row: {
                    "id": string;
                    "order_code": string;
                    "create_request_id": string;
                    "create_request_payload": Json;
                    "product_id": string;
                    "snapshot_cover_image_id": string | null;
                    "product_snapshot": Json;
                    "customer_name": string;
                    "customer_phone": string;
                    "rental_start_date": string;
                    "expected_return_date": string;
                    "actual_return_date": string | null;
                    "first_day_price_snapshot": number;
                    "additional_day_price_snapshot": number;
                    "rental_days": number | null;
                    "suggested_price": number | null;
                    "deposit_amount": number;
                    "additional_charges": number;
                    "discount": number;
                    "actual_revenue": number;
                    "status": Database["public"]["Enums"]["mira_rental_status"];
                    "notes": string;
                    "version": number;
                    "created_at": string;
                    "updated_at": string;
                    "started_at": string | null;
                    "completed_at": string | null;
                    "cancelled_at": string | null;
                    "created_by": string | null;
                    "completed_by": string | null;
                };
                Insert: {
                    "id"?: string;
                    "order_code"?: string;
                    "create_request_id"?: string;
                    "create_request_payload"?: Json;
                    "product_id": string;
                    "snapshot_cover_image_id"?: string | null;
                    "product_snapshot": Json;
                    "customer_name"?: string;
                    "customer_phone"?: string;
                    "rental_start_date": string;
                    "expected_return_date": string;
                    "actual_return_date"?: string | null;
                    "first_day_price_snapshot": number;
                    "additional_day_price_snapshot": number;
                    "rental_days"?: never;
                    "suggested_price"?: never;
                    "deposit_amount"?: number;
                    "additional_charges"?: number;
                    "discount"?: number;
                    "actual_revenue"?: number;
                    "status"?: Database["public"]["Enums"]["mira_rental_status"];
                    "notes"?: string;
                    "version"?: number;
                    "created_at"?: string;
                    "updated_at"?: string;
                    "started_at"?: string | null;
                    "completed_at"?: string | null;
                    "cancelled_at"?: string | null;
                    "created_by"?: string | null;
                    "completed_by"?: string | null;
                };
                Update: {
                    "id"?: string;
                    "order_code"?: string;
                    "create_request_id"?: string;
                    "create_request_payload"?: Json;
                    "product_id"?: string;
                    "snapshot_cover_image_id"?: string | null;
                    "product_snapshot"?: Json;
                    "customer_name"?: string;
                    "customer_phone"?: string;
                    "rental_start_date"?: string;
                    "expected_return_date"?: string;
                    "actual_return_date"?: string | null;
                    "first_day_price_snapshot"?: number;
                    "additional_day_price_snapshot"?: number;
                    "rental_days"?: never;
                    "suggested_price"?: never;
                    "deposit_amount"?: number;
                    "additional_charges"?: number;
                    "discount"?: number;
                    "actual_revenue"?: number;
                    "status"?: Database["public"]["Enums"]["mira_rental_status"];
                    "notes"?: string;
                    "version"?: number;
                    "created_at"?: string;
                    "updated_at"?: string;
                    "started_at"?: string | null;
                    "completed_at"?: string | null;
                    "cancelled_at"?: string | null;
                    "created_by"?: string | null;
                    "completed_by"?: string | null;
                };
                Relationships: [
                    {
                        "columns": [
                            "product_id"
                        ];
                        "isOneToOne": false;
                        "foreignKeyName": "rental_orders_product_id_fkey";
                        "referencedColumns": [
                            "id"
                        ];
                        "referencedRelation": "products";
                    },
                    {
                        "columns": [
                            "product_id",
                            "snapshot_cover_image_id"
                        ];
                        "isOneToOne": false;
                        "foreignKeyName": "rental_orders_product_id_snapshot_cover_image_id_fkey";
                        "referencedColumns": [
                            "product_id",
                            "id"
                        ];
                        "referencedRelation": "product_images";
                    }
                ];
            };
            "shop_settings": {
                Row: {
                    "id": boolean;
                    "name": string;
                    "tagline": string;
                    "owner_name": string;
                    "phone": string;
                    "instagram_url": string;
                    "zalo_url": string;
                    "tiktok_url": string;
                    "address": string;
                    "version": number;
                    "updated_at": string;
                };
                Insert: {
                    "id"?: boolean;
                    "name"?: string;
                    "tagline"?: string;
                    "owner_name"?: string;
                    "phone"?: string;
                    "instagram_url"?: string;
                    "zalo_url"?: string;
                    "tiktok_url"?: string;
                    "address"?: string;
                    "version"?: number;
                    "updated_at"?: string;
                };
                Update: {
                    "id"?: boolean;
                    "name"?: string;
                    "tagline"?: string;
                    "owner_name"?: string;
                    "phone"?: string;
                    "instagram_url"?: string;
                    "zalo_url"?: string;
                    "tiktok_url"?: string;
                    "address"?: string;
                    "version"?: number;
                    "updated_at"?: string;
                };
                Relationships: [
                ];
            };
            "product_images": {
                Row: {
                    "id": string;
                    "product_id": string;
                    "display_name": string;
                    "storage_path": string | null;
                    "external_url": string | null;
                    "sort_order": number;
                    "created_at": string;
                    "deleted_at": string | null;
                };
                Insert: {
                    "id"?: string;
                    "product_id": string;
                    "display_name"?: string;
                    "storage_path"?: string | null;
                    "external_url"?: string | null;
                    "sort_order"?: number;
                    "created_at"?: string;
                    "deleted_at"?: string | null;
                };
                Update: {
                    "id"?: string;
                    "product_id"?: string;
                    "display_name"?: string;
                    "storage_path"?: string | null;
                    "external_url"?: string | null;
                    "sort_order"?: number;
                    "created_at"?: string;
                    "deleted_at"?: string | null;
                };
                Relationships: [
                    {
                        "columns": [
                            "product_id"
                        ];
                        "isOneToOne": false;
                        "foreignKeyName": "product_images_product_id_fkey";
                        "referencedColumns": [
                            "id"
                        ];
                        "referencedRelation": "products";
                    }
                ];
            };
        };
        Views: {
            "rental_history": {
                Row: {
                    "id": string | null;
                    "order_code": string | null;
                    "create_request_id": string | null;
                    "create_request_payload": Json | null;
                    "product_id": string | null;
                    "snapshot_cover_image_id": string | null;
                    "product_snapshot": Json | null;
                    "customer_name": string | null;
                    "customer_phone": string | null;
                    "rental_start_date": string | null;
                    "expected_return_date": string | null;
                    "actual_return_date": string | null;
                    "first_day_price_snapshot": number | null;
                    "additional_day_price_snapshot": number | null;
                    "rental_days": number | null;
                    "suggested_price": number | null;
                    "deposit_amount": number | null;
                    "additional_charges": number | null;
                    "discount": number | null;
                    "actual_revenue": number | null;
                    "status": Database["public"]["Enums"]["mira_rental_status"] | null;
                    "notes": string | null;
                    "version": number | null;
                    "created_at": string | null;
                    "updated_at": string | null;
                    "started_at": string | null;
                    "completed_at": string | null;
                    "cancelled_at": string | null;
                    "created_by": string | null;
                    "completed_by": string | null;
                };
                Relationships: [
                ];
            };
            "product_catalog": {
                Row: {
                    "id": string | null;
                    "legacy_id": string | null;
                    "slug": string | null;
                    "name": string | null;
                    "category": Database["public"]["Enums"]["mira_product_category"] | null;
                    "original_price": number | null;
                    "first_day_price": number | null;
                    "additional_day_price": number | null;
                    "description": string | null;
                    "sizes": string[] | null;
                    "colors": string[] | null;
                    "material": string | null;
                    "accessories": string | null;
                    "cover_image_id": string | null;
                    "is_featured": boolean | null;
                    "version": number | null;
                    "created_at": string | null;
                    "updated_at": string | null;
                    "deleted_at": string | null;
                    "frontend_id": string | null;
                    "status": Database["public"]["Enums"]["mira_product_availability"] | null;
                };
                Relationships: [
                ];
            };
            "revenue_by_month": {
                Row: {
                    "month": string | null;
                    "completed_orders": number | null;
                    "revenue": number | null;
                    "average_revenue": number | null;
                };
                Relationships: [
                ];
            };
        };
        Functions: {
            "save_product": {
                Args: {
                    "p_product": Json;
                    "p_images": Json;
                    "p_expected_version"?: number;
                };
                Returns: Database["public"]["Tables"]["products"]["Row"];
            };
            "start_rental": {
                Args: {
                    "p_order_code": string;
                    "p_expected_version": number;
                    "p_draft"?: Json;
                };
                Returns: Database["public"]["Tables"]["rental_orders"]["Row"];
            };
            "create_rental": {
                Args: {
                    "p_product_ref": string;
                    "p_rental_start_date": string;
                    "p_expected_return_date": string;
                    "p_customer_name"?: string;
                    "p_customer_phone"?: string;
                    "p_deposit_amount"?: number;
                    "p_notes"?: string;
                    "p_start_immediately"?: boolean;
                    "p_request_id"?: string;
                };
                Returns: Database["public"]["Tables"]["rental_orders"]["Row"];
            };
            "archive_product": {
                Args: {
                    "p_product_ref": string;
                    "p_expected_version": number;
                };
                Returns: Database["public"]["Tables"]["products"]["Row"];
            };
            "complete_rental": {
                Args: {
                    "p_order_code": string;
                    "p_expected_version": number;
                    "p_actual_return_date": string;
                    "p_additional_charges"?: number;
                    "p_discount"?: number;
                    "p_actual_revenue"?: number;
                    "p_notes"?: string;
                };
                Returns: Database["public"]["Tables"]["rental_orders"]["Row"];
            };
            "get_admin_access": {
                Args: {};
                Returns: Json;
            };
            "cancel_reservation": {
                Args: {
                    "p_order_code": string;
                    "p_expected_version": number;
                };
                Returns: Database["public"]["Tables"]["rental_orders"]["Row"];
            };
            "load_shop_snapshot": {
                Args: {
                    "p_admin"?: boolean;
                };
                Returns: Json;
            };
            "save_shop_settings": {
                Args: {
                    "p_settings": Json;
                    "p_expected_version": number;
                };
                Returns: Database["public"]["Tables"]["shop_settings"]["Row"];
            };
            "product_availability": {
                Args: {
                    "p_product_id": string;
                };
                Returns: Database["public"]["Enums"]["mira_product_availability"];
            };
        };
        Enums: {
            "mira_rental_status": "reserved" | "active" | "completed" | "cancelled";
            "mira_product_category": "Áo dài" | "Váy" | "Khác";
            "mira_product_availability": "available" | "reserved" | "rented";
        };
        CompositeTypes: Record<string, never>;
    };
};
