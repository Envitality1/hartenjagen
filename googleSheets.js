import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = "Scores";

export async function addRoundToSheet(scores) {
  const timestamp = new Date().toLocaleString("nl-NL");

  const row = [
    timestamp,
    scores.vince ?? 0,
    scores.sam ?? 0,
    scores.koen ?? 0,
    scores.olivier ?? 0,
    scores.boaz ?? 0,
    scores.leon ?? 0,
  ];

  // insert row at top (under headers)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          insertDimension: {
            range: {
              sheetId: 0,
              dimension: "ROWS",
              startIndex: 1,
              endIndex: 2,
            },
            inheritFromBefore: false,
          },
        },
      ],
    },
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:G2`,
    valueInputOption: "RAW",
    requestBody: {
      values: [row],
    },
  });
}