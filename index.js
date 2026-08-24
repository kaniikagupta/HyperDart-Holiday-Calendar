const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export default {
  async fetch(request) {

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: CORS_HEADERS,
      });
    }

    const url = new URL(request.url);

    if (url.pathname === "/search") {
      const rawQuery = url.searchParams.get("query") || "";
      const query = rawQuery.trim();

      if (!query) {
        return new Response(
          JSON.stringify({
            error: "Query parameter is required",
          }),
          {
            status: 400,
            headers: CORS_HEADERS,
          }
        );
      }

      const countryMap = {
        "united states of america": {
          code: "US",
          name: "United States",
        },

        "united states": {
          code: "US",
          name: "United States",
        },

        usa: {
          code: "US",
          name: "United States",
        },

        us: {
          code: "US",
          name: "United States",
        },

        "united kingdom": {
          code: "GB",
          name: "United Kingdom",
        },

        uk: {
          code: "GB",
          name: "United Kingdom",
        },

        britain: {
          code: "GB",
          name: "United Kingdom",
        },

        pakistan: {
          code: "PK",
          name: "Pakistan",
        },

        switzerland: {
          code: "CH",
          name: "Switzerland",
        },

        netherlands: {
          code: "NL",
          name: "Netherlands",
        },

        singapore: {
          code: "SG",
          name: "Singapore",
        },

        australia: {
          code: "AU",
          name: "Australia",
        },

        germany: {
          code: "DE",
          name: "Germany",
        },

        canada: {
          code: "CA",
          name: "Canada",
        },

        france: {
          code: "FR",
          name: "France",
        },

        brazil: {
          code: "BR",
          name: "Brazil",
        },

        mexico: {
          code: "MX",
          name: "Mexico",
        },

        spain: {
          code: "ES",
          name: "Spain",
        },

        italy: {
          code: "IT",
          name: "Italy",
        },

        japan: {
          code: "JP",
          name: "Japan",
        },

        china: {
          code: "CN",
          name: "China",
        },

        india: {
          code: "IN",
          name: "India",
        },
      };

      const monthMap = {
        january: 1,
        jan: 1,

        february: 2,
        feb: 2,

        march: 3,
        mar: 3,

        april: 4,
        apr: 4,

        may: 5,

        june: 6,
        jun: 6,

        july: 7,
        jul: 7,

        august: 8,
        aug: 8,

        september: 9,
        sep: 9,
        sept: 9,

        october: 10,
        oct: 10,

        november: 11,
        nov: 11,

        december: 12,
        dec: 12,
      };

      const now = new Date();

      const lowerQuery = query.toLowerCase();


      let year = now.getFullYear();

      const yearMatch = query.match(/\b(20\d{2})\b/);

      if (yearMatch) {
        year = parseInt(yearMatch[1], 10);
      } else if (/\bthis year\b/i.test(query)) {
        year = now.getFullYear();
      } else if (/\bnext year\b/i.test(query)) {
        year = now.getFullYear() + 1;
      } else if (/\blast year\b/i.test(query)) {
        year = now.getFullYear() - 1;
      }

      let countryCode = null;
      let countryName = null;


      const sortedCountries = Object.entries(countryMap).sort(
        ([a], [b]) => b.length - a.length
      );

      for (const [key, value] of sortedCountries) {
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const regex = new RegExp(`\\b${escapedKey}\\b`, "i");

        if (regex.test(lowerQuery)) {
          countryCode = value.code;
          countryName = value.name;
          break;
        }
      }

      if (!countryCode) {
        const extracted = lowerQuery.match(
          /(?:in|for)\s+([a-z]+(?:\s+[a-z]+)*)/i
        );

        if (
          extracted &&
          extracted[1] &&
          extracted[1].trim() !== "public"
        ) {
          countryName = extracted[1]
            .trim()
            .replace(/\b\w/g, (c) => c.toUpperCase());

          countryCode = countryName.substring(0, 2).toUpperCase();
        } else {
          countryCode = "US";
          countryName = "United States";
        }
      }

      const classificationRegex =
        /\b(public|bank|school|authorities|optional|observance)\s+holidays?\b|\b(public|bank|school|authorities|optional|observance)\b/i;

      const typeMatch = query.match(classificationRegex);

      const requestedType = typeMatch
        ? (typeMatch[1] || typeMatch[2]).toLowerCase()
        : null;

 
      let targetMonth = null;

      if (/\bnext month\b/i.test(lowerQuery)) {
        const nextMonthDate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          1
        );

        year = nextMonthDate.getFullYear();

        targetMonth = nextMonthDate.getMonth() + 1;
      } else {
        for (const [monthName, monthNumber] of Object.entries(
          monthMap
        )) {
          const monthRegex = new RegExp(
            `\\b${monthName}\\b`,
            "i"
          );

          if (monthRegex.test(lowerQuery)) {
            targetMonth = monthNumber;
            break;
          }
        }
      }


      const isHolidayRegex =
        /is\s+([a-zA-Z]+\s+\d{1,2}|\d{1,2}(?:st|nd|rd|th)?\s+[a-zA-Z]+)\s+(?:a\s+)?(?:public\s+|bank\s+|school\s+|authorities\s+|optional\s+|observance\s+)?holiday/i;

      const isMatch = query.match(isHolidayRegex);


      try {
        const apiUrl =
          `https://date.nager.at/api/v4/Holidays/` +
          `${countryCode}/${year}`;

        const res = await fetch(apiUrl);

        if (res.status === 204 || !res.ok) {
          return new Response(
            JSON.stringify({
              answer: `No holiday data available for ${countryName} in ${year}.`,
            }),
            {
              headers: CORS_HEADERS,
            }
          );
        }

        let rawHolidays = await res.json();

        if (
          !Array.isArray(rawHolidays) ||
          rawHolidays.length === 0
        ) {
          return new Response(
            JSON.stringify({
              answer: `No holidays found for ${countryName} in ${year}.`,
            }),
            {
              headers: CORS_HEADERS,
            }
          );
        }



        let formattedHolidays = rawHolidays.map((holiday) => {
          const rawTypes =
            holiday.holidayTypes || holiday.types;

          let types =
            Array.isArray(rawTypes) && rawTypes.length > 0
              ? rawTypes
              : [];

          let normalizedTypes = types.map((type) => {
            const text = String(type);

            return (
              text.charAt(0).toUpperCase() +
              text.slice(1).toLowerCase()
            );
          });

          if (
            holiday.optional &&
            !normalizedTypes.some(
              (type) =>
                type.toLowerCase() === "optional"
            )
          ) {
            normalizedTypes.push("Optional");
          }

          return {
            ...holiday,

            types: normalizedTypes,

            holidayTypes: normalizedTypes,
          };
        });

 
        if (isMatch) {
          const rawDateStr = isMatch[1];


          const cleanDateStr = rawDateStr.replace(
            /(st|nd|rd|th)/i,
            ""
          );

          const parsedDate = new Date(
            `${cleanDateStr} ${year}`
          );

          if (!isNaN(parsedDate.getTime())) {
            const monthFormatted = String(
              parsedDate.getMonth() + 1
            ).padStart(2, "0");

            const dayFormatted = String(
              parsedDate.getDate()
            ).padStart(2, "0");

            const targetDateStr =
              `${year}-${monthFormatted}-${dayFormatted}`;

            const found = formattedHolidays.find(
              (holiday) =>
                holiday.date === targetDateStr
            );

      
            if (!found) {
              return new Response(
                JSON.stringify({
                  answer: `No, ${rawDateStr} is not a holiday in ${countryName}.`,
                }),
                {
                  headers: CORS_HEADERS,
                }
              );
            }

            if (requestedType) {
              const matchesRequestedType =
                found.holidayTypes.some(
                  (type) =>
                    type.toLowerCase() ===
                    requestedType
                );

              if (matchesRequestedType) {
                return new Response(
                  JSON.stringify({
                    answer:
                      `Yes, ${rawDateStr} is a ` +
                      `${requestedType} holiday in ` +
                      `${countryName} (${found.name}).`,

                    holiday: found,
                  }),
                  {
                    headers: CORS_HEADERS,
                  }
                );
              }

              return new Response(
                JSON.stringify({
                  answer:
                    `No, ${rawDateStr} is not a ` +
                    `${requestedType} holiday in ` +
                    `${countryName}.`,
                }),
                {
                  headers: CORS_HEADERS,
                }
              );
            }

      
            return new Response(
              JSON.stringify({
                answer:
                  `Yes, ${rawDateStr} is a holiday in ` +
                  `${countryName} (${found.name}).`,

                holiday: found,
              }),
              {
                headers: CORS_HEADERS,
              }
            );
          }
        }

        if (targetMonth) {
          formattedHolidays =
            formattedHolidays.filter((holiday) => {
              const holidayMonth = parseInt(
                holiday.date.split("-")[1],
                10
              );

              return holidayMonth === targetMonth;
            });
        }

  

        if (requestedType) {
          formattedHolidays =
            formattedHolidays.filter((holiday) => {
              return holiday.holidayTypes.some(
                (type) =>
                  type.toLowerCase() === requestedType
              );
            });

          if (formattedHolidays.length === 0) {
            const monthText = targetMonth
              ? ` for month ${targetMonth}`
              : "";

            return new Response(
              JSON.stringify({
                answer:
                  `No ${requestedType} holidays found ` +
                  `for ${countryName} in ${year}${monthText}.`,
              }),
              {
                headers: CORS_HEADERS,
              }
            );
          }
        }

        if (formattedHolidays.length === 0) {
          return new Response(
            JSON.stringify({
              answer:
                `No holidays found for ${countryName} ` +
                `in ${year}.`,
            }),
            {
              headers: CORS_HEADERS,
            }
          );
        }

        return new Response(
          JSON.stringify(formattedHolidays),
          {
            headers: CORS_HEADERS,
          }
        );
      } catch (error) {
        console.error("Holiday API error:", error);

        return new Response(
          JSON.stringify({
            answer:
              `No holiday data available for ` +
              `${countryName} in ${year}.`,
          }),
          {
            headers: CORS_HEADERS,
          }
        );
      }
    }

    return new Response(
      "Holiday API running",
      {
        status: 200,
        headers: CORS_HEADERS,
      }
    );
  },
};
