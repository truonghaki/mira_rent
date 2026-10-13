import type { BackendCommands } from "@/services/contracts";
import type { MiraClient } from "./client";
import { backendError } from "./errors";
import { imagesPayload, productPayload } from "./mappers";
export function createBackendCommands(client: MiraClient): BackendCommands {
    return {
        saveProduct: async (product, version) => {
            const { error } = await client.rpc("save_product", { p_product: productPayload(product), p_images: imagesPayload(product.images), p_expected_version: version ?? undefined });
            if (error)
                throw backendError(error);
        },
        archiveProduct: async (id, version) => { const { error } = await client.rpc("archive_product", { p_product_ref: id, p_expected_version: version }); if (error)
            throw backendError(error); },
        createRental: async (id, draft, direct, requestId) => {
            const { error } = await client.rpc("create_rental", { p_product_ref: id, p_rental_start_date: draft.rentalStartDate, p_expected_return_date: draft.expectedReturnDate,
                p_customer_name: draft.customerName, p_customer_phone: draft.customerPhone, p_deposit_amount: draft.depositAmount, p_notes: draft.notes, p_start_immediately: direct, p_request_id: requestId });
            if (error)
                throw backendError(error);
        },
        startRental: async (code, version, draft = {}) => {
            const payload = { ...(draft.customerName !== undefined ? { customer_name: draft.customerName } : {}),
                ...(draft.customerPhone !== undefined ? { customer_phone: draft.customerPhone } : {}),
                ...(draft.rentalStartDate !== undefined ? { rental_start_date: draft.rentalStartDate } : {}),
                ...(draft.expectedReturnDate !== undefined ? { expected_return_date: draft.expectedReturnDate } : {}),
                ...(draft.depositAmount !== undefined ? { deposit_amount: draft.depositAmount } : {}),
                ...(draft.notes !== undefined ? { notes: draft.notes } : {}) };
            const { error } = await client.rpc("start_rental", { p_order_code: code, p_expected_version: version, p_draft: payload });
            if (error)
                throw backendError(error);
        },
        cancelReservation: async (code, version) => { const { error } = await client.rpc("cancel_reservation", { p_order_code: code, p_expected_version: version }); if (error)
            throw backendError(error); },
        completeRental: async (code, version, draft) => {
            const { error } = await client.rpc("complete_rental", { p_order_code: code, p_expected_version: version, p_actual_return_date: draft.actualReturnDate,
                p_additional_charges: draft.additionalCharges, p_discount: draft.discount, p_actual_revenue: draft.actualRevenue, p_notes: draft.notes });
            if (error)
                throw backendError(error);
        },
        saveSettings: async (settings, version) => {
            const { error } = await client.rpc("save_shop_settings", { p_expected_version: version, p_settings: { name: settings.name, tagline: settings.tagline, owner_name: settings.owner,
                    phone: settings.phone, instagram_url: settings.instagramUrl, zalo_url: settings.zaloUrl, tiktok_url: settings.tiktokUrl, address: settings.address } });
            if (error)
                throw backendError(error);
        },
    };
}
