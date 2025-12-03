import { PrismaClient } from "@prisma/client";
import fs from "fs";
import readline from "readline";

const prisma = new PrismaClient();

// ---------------------------------------------------
// STEP A: Load country info (from countryInfo.txt)
// ---------------------------------------------------
async function loadCountries() {
  console.log("Loading countries...");

  const fileStream = fs.createReadStream("prisma/data/countryInfo.txt");
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const map: Record<
    string,
    { geonameId: number; nameEn: string; nameZhTW?: string; nameJa?: string }
  > = {};

  for await (const line of rl) {
    if (line.startsWith("#")) continue; // Skip comments

    const cols = line.split("\t");
    const countryCode = cols[0];
    const geonameId = parseInt(cols[16]);
    const nameEn = cols[4];

    if (!countryCode || !geonameId) continue;

    map[countryCode] = {
      geonameId,
      nameEn,
      nameZhTW: undefined,
      nameJa: undefined,
    };
  }

  console.log(`Loaded ${Object.keys(map).length} countries`);
  return map;
}

// ---------------------------------------------------
// STEP B: Load cities (cities5000.txt)
// ---------------------------------------------------
async function loadCities(countryMap: any) {
  console.log("Loading cities...");

  const fileStream = fs.createReadStream("prisma/data/cities5000.txt");
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const batch: any[] = [];
  let count = 0;

  for await (const line of rl) {
    const cols = line.split("\t");

    const geonameId = parseInt(cols[0]);
    const nameEn = cols[1];
    const lat = parseFloat(cols[4]);
    const lng = parseFloat(cols[5]);
    const countryCode = cols[8];
    const population = parseInt(cols[14]) || 0;

    const country = countryMap[countryCode];

    batch.push({
      geonameId,
      nameEn,
      lat,
      lng,
      countryCode,
      countryNameEn: country ? country.nameEn : countryCode,
      countryNameZhTW: null,
      countryNameJa: null,
      population,
    });

    count++;

    if (batch.length === 2000) {
      await prisma.city.createMany({ data: batch, skipDuplicates: true });
      batch.length = 0;
      console.log(`Inserted ${count} cities...`);
    }
  }

  if (batch.length > 0) {
    await prisma.city.createMany({ data: batch, skipDuplicates: true });
  }

  console.log(`Cities loaded. Total: ${count}`);
}

// ---------------------------------------------------
// STEP C: Load alternateNames (only zh-TW + ja)
// Also fill country names (zh-TW, ja)
// ---------------------------------------------------
async function loadAlternateNames(countryMap: any) {
  console.log("Loading alternate names (zh-TW + ja)...");

  const cities = await prisma.city.findMany({
    select: { geonameId: true },
  });
  const cityIdSet = new Set(cities.map((c) => c.geonameId));

  const fileStream = fs.createReadStream("prisma/data/alternateNames.txt");
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const allowedLangs = new Set(["zh-TW", "zh", "ja"]);
  const batch: any[] = [];
  let count = 0;

  for await (const line of rl) {
    const cols = line.split("\t");

    const altId = parseInt(cols[0]);
    const geonameId = parseInt(cols[1]);
    const lang = cols[2];
    const name = cols[3];

    if (!allowedLangs.has(lang)) continue;

    // 🔥 是城市？(直接存 altNames)
    if (cityIdSet.has(geonameId)) {
      batch.push({ id: altId, geonameId, lang, name });
      count++;

      if (batch.length === 10000) {
        await prisma.cityAlternateName.createMany({
          data: batch,
          skipDuplicates: true,
        });
        batch.length = 0;
        console.log(`Inserted ${count} zh-TW/ja city names...`);
      }
    }

    // 🔥 是國家？（寫入 country map）
    for (const code in countryMap) {
      if (countryMap[code].geonameId === geonameId) {
        if (lang === "zh-TW") countryMap[code].nameZhTW = name;
        if (lang === "zh" && !countryMap[code].nameZhTW)
          countryMap[code].nameZhTW = name;
        if (lang === "ja") countryMap[code].nameJa = name;
      }
    }
  }

  if (batch.length > 0) {
    await prisma.cityAlternateName.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }

  console.log(`Alternate names loaded. Total city altNames: ${count}`);

  return countryMap;
}

// ---------------------------------------------------
// STEP D: Update cities with zh-TW / ja country names
// ---------------------------------------------------
async function updateCityCountries(countryMap: any) {
  console.log("Updating country i18n...");

  for (const code in countryMap) {
    const country = countryMap[code];

    await prisma.city.updateMany({
      where: { countryCode: code },
      data: {
        countryNameZhTW: country.nameZhTW ?? country.nameEn,
        countryNameJa: country.nameJa ?? country.nameEn,
      },
    });
  }

  console.log("Country names updated.");
}

// ---------------------------------------------------
// MAIN
// ---------------------------------------------------
async function main() {
  console.log("=== SEED START ===");

  const countryMap = await loadCountries();
  await loadCities(countryMap);

  const updatedCountryMap = await loadAlternateNames(countryMap);
  await updateCityCountries(updatedCountryMap);

  console.log("=== SEED COMPLETE ===");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
