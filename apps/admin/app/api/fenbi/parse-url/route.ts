import { NextRequest, NextResponse } from "next/server";

// 设置较长的超时时间（5分钟）
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 获取 Authorization header
    const authHeader = request.headers.get("Authorization");

    // 转发请求到后端
    const response = await fetch("http://localhost:9000/api/v1/admin/fenbi/parse-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Parse URL API error:", error);
    return NextResponse.json({ code: -1, message: "请求失败", data: null }, { status: 500 });
  }
}
