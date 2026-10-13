import assert from "node:assert/strict";
import test from "node:test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/services/supabase/database.types";
import { createSupabaseServices } from "@/services/supabase";
import { readBackendConfig } from "@/services/config";
import { BackendError, backendError } from "@/services/supabase/errors";
import { imagesPayload, productPayload } from "@/services/supabase/mappers";
import { createLazySupabaseServices } from "@/services/supabase/lazy";
import { shopTimestamp } from "@/utils/date";
import {filterRevenueOrders,revenueSummary} from "@/features/revenue/calculations";
import fixture from "./fixtures/backend-snapshot.json" with { type: "json" };
const config = { mode: "supabase" as const, url: "https://mira-test.supabase.co", key: "sb_publishable_test_public_key" };
function harness(admin = true) {
    const calls: {
        path: string;
        body: Record<string, unknown>;
    }[] = [];
    let fail: string | null = null;
    const user = { id: "10000000-0000-0000-0000-000000000003", aud: "authenticated", role: "authenticated", email: "test@example.invalid", app_metadata: {}, user_metadata: {}, created_at: "2026-03-18T12:00:00Z" };
    const token = [Buffer.from('{"alg":"HS256","typ":"JWT"}').toString("base64url"), Buffer.from(JSON.stringify({ sub: user.id, role: "authenticated", aud: "authenticated", exp: 4070908800, iat: 1773835200 })).toString("base64url"), "testsignature"].join(".");
    const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
    const mockFetch: typeof fetch = async (input, init) => {
        const path = new URL(typeof input === "string" || input instanceof URL ? input.toString() : input.url).pathname;
        const body: Record<string, unknown> = typeof init?.body === "string" ? JSON.parse(init.body) : {};
        calls.push({ path, body });
        if (path === "/auth/v1/token")
            return response({ access_token: token, refresh_token: "test-refresh", expires_in: 3600, token_type: "bearer", user });
        if (path === "/auth/v1/user")
            return response(user);
        if (path === "/auth/v1/logout")
            return new Response(null, { status: 204 });
        if (path.endsWith("/get_admin_access"))
            return response({ isAdmin: admin, role: admin ? "owner" : null });
        if (path.endsWith("/load_shop_snapshot")) {
            if (body.p_admin && !admin)
                return response({ code: "42501", message: "ADMIN_REQUIRED", details: null, hint: null }, 403);
            return response({ ...fixture, orders: body.p_admin ? fixture.orders : [] });
        }
        if (path.startsWith("/rest/v1/rpc/")) {
            if (fail)
                return response({ code: fail, message: fail === "40001" ? "VERSION_CONFLICT" : "private SQL detail", details: null, hint: null }, 409);
            return response(fixture.orders[0]);
        }
        if (path.startsWith("/storage/v1/object/"))
            return response({ Key: "uploaded", Id: "test" });
        throw new Error("Unexpected backend request: " + path);
    };
    const client = createClient<Database>(config.url, config.key, { global: { fetch: mockFetch }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    return { services: createSupabaseServices(config, client), calls, setFailure: (code: string | null) => { fail = code; } };
}
test("backend mode defaults to demo; live configuration never silently falls back", () => {
    assert.deepEqual(readBackendConfig({}), { mode: "demo" });
    assert.throws(() => readBackendConfig({ VITE_BACKEND_MODE: "supabase" }), BackendError);
    assert.throws(() => readBackendConfig({ VITE_BACKEND_MODE: "other" }), BackendError);
    assert.deepEqual(readBackendConfig({ VITE_BACKEND_MODE: "supabase", VITE_SUPABASE_URL: config.url, VITE_SUPABASE_PUBLISHABLE_KEY: config.key }), config);
});
test("browser configuration rejects service-role credentials", () => {
    const secret = ["header", Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url"), "signature"].join(".");
    for (const key of ["sb_secret_do_not_use", secret])
        assert.throws(() => readBackendConfig({ VITE_BACKEND_MODE: "supabase", VITE_SUPABASE_URL: config.url, VITE_SUPABASE_PUBLISHABLE_KEY: key }), BackendError);
});
test("public read has empty rental state and preserves legacy product routes", async () => {
    const { services, calls } = harness();
    const data = await services.reads.load(false);
    assert.equal(data.state.products.length, 8);
    assert.equal(data.state.orders.length, 0);
    assert.equal(data.state.products.find(p => p.id === "1")?.name, "Áo dài Chouchou");
    assert.equal(data.state.products.find(p => p.id === "2")?.status, "reserved");
    assert.match(data.productDatabaseIds["1"], /^[0-9a-f-]{36}$/);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].body.p_admin, false);
});
test("admin bootstrap maps order codes, snapshots and entity versions", async () => {
    const { services } = harness();
    const data = await services.reads.load(true);
    assert.equal(data.state.orders.length, 8);
    const order = data.state.orders.find(o => o.id === "MIRA-260312-05");
    assert.equal(order?.productId, "1");
    assert.equal(order?.actualRevenue, 229000);
    assert.equal(order?.depositAmount, 500000);
    assert.equal(data.orderVersions["MIRA-260312-05"], 1);
});
test("auth requires membership after password login and supports logout", async () => {
    const { services } = harness();
    assert.equal((await services.auth.getAccess()).isAdmin, false);
    await services.auth.signIn("test@example.invalid", "test-password");
    assert.equal((await services.auth.getAccess()).isAdmin, true);
    await services.auth.signOut();
    assert.equal((await services.auth.getAccess()).isAdmin, false);
});
test("ordinary account is refused admin login and its session is cleared", async () => {
    const { services } = harness(false);
    await assert.rejects(services.auth.signIn("test@example.invalid", "test-password"), (error: unknown) => error instanceof BackendError && error.code === "ADMIN_REQUIRED");
    assert.equal((await services.auth.getAccess()).signedIn, false);
    await assert.rejects(services.reads.load(true), BackendError);
});
test("metadata write strips status and uses expected version", async () => {
    const { services, calls } = harness();
    const data = await services.reads.load(false);
    const product = data.state.products[0];
    assert.equal("status" in (productPayload(product) as object), false);
    assert.equal("legacy_id" in (productPayload(product) as object), false);
    await services.commands.saveProduct(product, data.productVersions[product.id]);
    const call = calls.find(c => c.path.endsWith("/save_product"));
    assert.equal(call?.body.p_expected_version, data.productVersions[product.id]);
    assert.ok(Array.isArray(call?.body.p_images));
});
test("rental commands send stable request ID, dates and manual zero revenue", async () => {
    const { services, calls } = harness();
    const draft = { customerName: "Test", customerPhone: "", rentalStartDate: "2026-03-18", expectedReturnDate: "2026-03-20", depositAmount: 500000, notes: "" };
    const requestId = "40000000-0000-0000-0000-000000000001";
    await services.commands.createRental("1", draft, false, requestId);
    await services.commands.createRental("1", draft, false, requestId);
    const created = calls.filter(c => c.path.endsWith("/create_rental"));
    assert.deepEqual(created[0].body, created[1].body);
    assert.equal(created[0].body.p_request_id, requestId);
    assert.equal("p_suggested_price" in created[0].body, false);
    await services.commands.completeRental("MIRA-TEST", 2, { actualReturnDate: "2026-03-20", additionalCharges: 0, discount: 0, actualRevenue: 0, notes: "" });
    assert.equal(calls.find(c => c.path.endsWith("/complete_rental"))?.body.p_actual_revenue, 0);
});
test("all remaining writes use RPC with concurrency tokens", async () => {
    const { services, calls } = harness();
    await services.commands.archiveProduct("1", 3);
    await services.commands.startRental("MIRA-TEST", 2, { customerName: "", depositAmount: 0 });
    await services.commands.cancelReservation("MIRA-TEST", 2);
    const data = await services.reads.load(false);
    await services.commands.saveSettings(data.state.settings, data.settingsVersion);
    for (const name of ["archive_product", "start_rental", "cancel_reservation", "save_shop_settings"])
        assert.ok(calls.find(c => c.path.endsWith("/" + name)));
    assert.deepEqual(calls.find(c => c.path.endsWith("/start_rental"))?.body.p_draft, { customer_name: "", deposit_amount: 0 });
});
test("backend errors preserve conflicts and redact server details", async () => {
    const { services, setFailure } = harness();
    setFailure("40001");
    await assert.rejects(services.commands.archiveProduct("1", 1), (error: unknown) => error instanceof BackendError && error.code === "VERSION_CONFLICT");
    assert.equal(backendError({ code: "XX000", message: "private SQL password" }).message.includes("password"), false);
});
test("durable uploads use product UUID paths and metadata, not object URLs", async () => {
    const { services, calls } = harness();
    const productId = "20000000-0000-0000-0000-000000000001";
    const images = await services.imageStorage.upload([new File(["test-image"], "a.png", { type: "image/png" })], { productId });
    assert.equal(images.length, 1);
    assert.equal(images[0].temporary, undefined);
    assert.ok(images[0].storagePath?.startsWith("products/" + productId + "/"));
    assert.ok(images[0].url.startsWith(config.url));
    assert.deepEqual(imagesPayload(images), [{ id: images[0].id, display_name: "a.png", storage_path: images[0].storagePath }]);
    await services.imageStorage.remove(images[0].id);
    assert.ok(calls.filter(c => c.path.startsWith("/storage/v1/object/")).length >= 2);
});
test("uploads reject invalid context and unsupported images before network", async () => {
    const { services, calls } = harness();
    const file = new File(["bad"], "x.svg", { type: "image/svg+xml" });
    await assert.rejects(services.imageStorage.upload([file]), BackendError);
    await assert.rejects(services.imageStorage.upload([file], { productId: "20000000-0000-0000-0000-000000000001" }), BackendError);
    assert.equal(calls.length, 0);
});
test("live SDK initialization is lazy and shared by adapters", async () => {
    const { services } = harness();
    let count = 0;
    const lazy = createLazySupabaseServices(config, async () => { count++; return services; });
    assert.equal(count, 0);
    assert.equal(lazy.mode, "supabase");
    await lazy.reads.load(false);
    await lazy.auth.getAccess();
    assert.equal(count, 1);
});
test("auth subscription disposed before SDK loading is never registered", async () => {
    const { services } = harness();
    let subscriptions = 0;
    const original = services.auth.subscribe;
    services.auth.subscribe = listener => { subscriptions++; return original(listener); };
    let resolve!: (value: typeof services) => void;
    const lazy = createLazySupabaseServices(config, () => new Promise(result => { resolve = result; }));
    const unsubscribe = lazy.auth.subscribe(() => { });
    unsubscribe();
    resolve(services);
    await new Promise(result => setImmediate(result));
    assert.equal(subscriptions, 0);
});

test("live timestamps preserve the instant and show the Vietnam calendar date",()=>{
  const timestamp="2026-03-31T18:00:00.000Z"
  const mapped=shopTimestamp(timestamp)
  assert.equal(mapped.slice(0,10),"2026-04-01")
  assert.equal(new Date(mapped).getTime(),new Date(timestamp).getTime())
})
test("revenue filters and summaries agree with Vietnam month/year boundaries",async()=>{
  const data=await harness().services.reads.load(true)
  const order={...data.state.orders.find(o=>o.status==="completed")!,completedAt:shopTimestamp("2025-12-31T18:00:00Z"),actualRevenue:123000}
  const summary=revenueSummary([order],new Date("2026-01-01T12:00:00Z"))
  assert.equal(summary.annual,123000);assert.equal(summary.currentRevenue,123000)
  assert.equal(filterRevenueOrders([order],{month:"1",year:"2026"}).length,1)
  assert.equal(filterRevenueOrders([order],{month:"12",year:"2025"}).length,0)
})
