import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") || "";
  const lang = searchParams.get("lang") || "en";

  if (!city) {
    return NextResponse.json(
      { error: "city query parameter is required" },
      { status: 400 }
    );
  }

  // 🔥 搜尋要吃所有語言
  const where = {
    OR: [
      {
        nameEn: {
          startsWith: city ,
        },
      },
      {
        altNames: {
          some: {
            name: {
              startsWith: city,
            },
          },
        },
      },
    ],
  };

  const cities = await prisma.city.findMany({
    where,
    take: 10,
    include: {
      altNames: {
        where:
          lang === "en"
            ? undefined
            : lang === "zh-TW"
            ? { OR: [{ lang: "zh-TW" }, { lang: "zh" }] }
            : { lang },
      },
    },
  });
  

      
  const result = cities.map((c) => {
    // 🔥 顯示名字依 lang 選擇
    const localizedName =
      lang === "en"
        ? c.nameEn
        : c.altNames[0]?.name ?? c.nameEn; // fallback

    // 🔥 國家名稱依 lang
    let countryName = c.countryNameEn;
    if (lang === "zh-TW") countryName = c.countryNameZhTW ?? countryName;
    if (lang === "ja") countryName = c.countryNameJa ?? countryName;

    return {
      name: localizedName,
      country: countryName,
    };
  });

  return NextResponse.json(result);
}
