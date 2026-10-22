import { handler } from "./handler.ts";

// Điểm vào của gói Functions. Plugin đóng gói thư mục này thành runtime/app.zip,
// logical name = "app", runtime = "edge", authMode = "anonymous".
// Deno.serve nhận (request) -> Response, không dùng Express/startup lệnh.
Deno.serve(handler);
