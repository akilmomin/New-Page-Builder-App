import type { PageNode } from "page-builder-core";
import type { JSX } from "react";

/**
 * Initial page layout matching the structure from the original page-builder-app.
 * Mirrors the `json` constant in Home.tsx:
 *   Root Section (12)
 *   └─ SubSection (12) → Section (12) → [SubSection(8), SubSection(4)]
 *         SubSection(8) → Sections: Banner, TilesQuickLink, [BusinessPaper+News]
 *         SubSection(4) → Section → Event
 */
export const initialLayout: readonly PageNode[] = [
  {
    type: "Section",
    isGrid: true,
    gridValue: "12",
    uniqueId: "TXSzKj",
    children: [
      {
        type: "SubSection",
        isGrid: true,
        gridValue: 12,
        uniqueId: "KLKGRN",
        children: [
          {
            type: "Section",
            isGrid: true,
            gridValue: "12",
            uniqueId: "LTun18",
            children: [
              {
                type: "SubSection",
                isGrid: true,
                gridValue: 8,
                uniqueId: "Jd6sSS",
                children: [
                  {
                    type: "Section",
                    isGrid: true,
                    gridValue: "12",
                    uniqueId: "m25u8M",
                    children: [
                      {
                        type: "SubSection",
                        isGrid: true,
                        gridValue: 12,
                        uniqueId: "RvVzh5",
                        children: [
                          {
                            type: "Component",
                            componentName: "Banner",
                            uniqueId: "MG99ER",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "Section",
                    isGrid: true,
                    gridValue: "12",
                    uniqueId: "wlhq4Y",
                    children: [
                      {
                        type: "SubSection",
                        isGrid: true,
                        gridValue: 12,
                        uniqueId: "SXAk0v",
                        children: [
                          {
                            type: "Component",
                            componentName: "TilesQuickLink",
                            uniqueId: "FpvqNQ",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "Section",
                    isGrid: true,
                    gridValue: "12",
                    uniqueId: "lJ1Who",
                    children: [
                      {
                        type: "SubSection",
                        isGrid: true,
                        gridValue: 6,
                        uniqueId: "aXaToM",
                        children: [
                          {
                            type: "Component",
                            componentName: "BusinessPaper",
                            uniqueId: "GTluMY",
                          },
                        ],
                      },
                      {
                        type: "SubSection",
                        isGrid: true,
                        gridValue: 6,
                        uniqueId: "NVW2GW",
                        children: [
                          {
                            type: "Component",
                            componentName: "News",
                            uniqueId: "om16Xd",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                type: "SubSection",
                isGrid: true,
                gridValue: 4,
                uniqueId: "10PeU1",
                children: [
                  {
                    type: "Section",
                    isGrid: true,
                    gridValue: "12",
                    uniqueId: "OwAQag",
                    children: [
                      {
                        type: "SubSection",
                        isGrid: true,
                        gridValue: 12,
                        uniqueId: "M0tRMp",
                        children: [
                          {
                            type: "Component",
                            componentName: "Event",
                            uniqueId: "TIjC6D",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
 interface ILayoutData {
    ColumnIndex: number;
    VerticalIndex?: number;
    Id: string;
    CorePersona?: string;
    StateData?: string;
    renderAttribute?: () => JSX.Element;
 }
 
const layoutData=[
  
    {
        "ColumnIndex": 1,
        "Id": "06be8183-537a-40d8-9664-95cdfa971ef9",
        "VerticalIndex": 2,
        onRender:()=> <>"Test"</>,
    },
    {
        "ColumnIndex": 1,
        "Id": "5d73a8c6-c8a3-48d6-b86e-72c8fe4b0105",
        "CorePersona": "AKIL_DEV",
        "StateData": "",
        "ArchetypeCode": "cosine_CoreComponentDetailRuntime",
        "cosine_CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreComponentDetailRuntimeID": "42e0ab8d-ee63-4bea-8db5-6ac7bac5710a",
        "cosine_CoreAttributeRel.AttributeName": "PART_BILL_ADDRESS",
        "cosine_CoreAttributeRel.CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreAttributeRel.DataType": "String",
        "cosine_CoreAttributeRel.Precision": 64,
        "cosine_CoreAttributeRel.CoreComponentRel.Code": "cosine_BDUISummaryTab"
    },
    {
        "ColumnIndex": 2,
        "Id": "fc05c070-7226-415b-b414-f2802da8edc3",
        "CorePersona": "AKIL_DEV",
        "StateData": "",
        "ArchetypeCode": "cosine_CoreComponentDetailRuntime",
        "cosine_CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreComponentDetailRuntimeID": "51fda26a-f045-48ea-8791-df68f11b1dea",
        "cosine_CoreAttributeRel.AttributeName": "PART_ORIGINATING_TKS",
        "cosine_CoreAttributeRel.CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreAttributeRel.DataType": "String",
        "cosine_CoreAttributeRel.Precision": 64,
        "cosine_CoreAttributeRel.CoreComponentRel.Code": "cosine_BDUISummaryTab"
    },
    {
        "ColumnIndex": 5,
        "Id": "db215c5e-7554-4348-a419-cf57d984e635",
        "CorePersona": "AKIL_DEV",
        "StateData": "",
        "ArchetypeCode": "cosine_CoreComponentDetailRuntime",
        "cosine_CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreComponentDetailRuntimeID": "82f9ca9f-5426-4f09-9061-da56f0bc48ff",
        "cosine_CoreAttributeRel.AttributeName": "PART_PROFORMA_SUMMARY",
        "cosine_CoreAttributeRel.CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreAttributeRel.DataType": "String",
        "cosine_CoreAttributeRel.Precision": 64,
        "cosine_CoreAttributeRel.CoreComponentRel.Code": "cosine_BDUISummaryTab"
    },
    {
        "ColumnIndex": 6,
        "Id": "001b1252-79d7-4e8d-b9f7-9bda29ac79ad",
        "CorePersona": "AKIL_DEV",
        "StateData": "",
        "ArchetypeCode": "cosine_CoreComponentDetailRuntime",
        "cosine_CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreComponentDetailRuntimeID": "dbcc7b0d-25ca-425e-a00a-ca1553ae7ec7",
        "cosine_CoreAttributeRel.AttributeName": "PART_MATTER_BALANCES",
        "cosine_CoreAttributeRel.CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreAttributeRel.DataType": "String",
        "cosine_CoreAttributeRel.Precision": 64,
        "cosine_CoreAttributeRel.CoreComponentRel.Code": "cosine_BDUISummaryTab"
    },
    {
        "ColumnIndex": 7,
        "Id": "ab676cdb-8efb-4485-9830-7b19a312c4c1",
        "CorePersona": "AKIL_DEV",
        "StateData": "",
        "ArchetypeCode": "cosine_CoreComponentDetailRuntime",
        "cosine_CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreComponentDetailRuntimeID": "16a33d06-9176-40be-8686-15102a8a50d3",
        "cosine_CoreAttributeRel.AttributeName": "PART_PROF_PAYOR",
        "cosine_CoreAttributeRel.CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreAttributeRel.DataType": "String",
        "cosine_CoreAttributeRel.Precision": 64,
        "cosine_CoreAttributeRel.CoreComponentRel.Code": "cosine_BDUISummaryTab"
    },
    {
        "ColumnIndex": 8,
        "Id": "a1c05957-373a-4935-980d-24835ced89a7",
        "CorePersona": "AKIL_DEV",
        "StateData": "",
        "VerticalIndex": 1,
        "ArchetypeCode": "cosine_CoreComponentDetailRuntime",
        "cosine_CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreComponentDetailRuntimeID": "9558da75-7915-4d1b-a631-193a49855b78",
        "cosine_CoreAttributeRel.AttributeName": "PART_CHART_AR_MATTER",
        "cosine_CoreAttributeRel.CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreAttributeRel.DataType": "String",
        "cosine_CoreAttributeRel.Precision": 64,
        "cosine_CoreAttributeRel.CoreComponentRel.Code": "cosine_BDUISummaryTab"
    },
    {
        "ColumnIndex": 8,
        "Id": "620966dd-4044-4b95-a918-c16ce7643774",
        "CorePersona": "AKIL_DEV",
        "StateData": "",
        "VerticalIndex": 2,
        "ArchetypeCode": "cosine_CoreComponentDetailRuntime",
        "cosine_CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreComponentDetailRuntimeID": "5e8c231a-fce5-4bf0-8160-b78bb2748a8a",
        "cosine_CoreAttributeRel.AttributeName": "PART_BUDGET",
        "cosine_CoreAttributeRel.CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreAttributeRel.DataType": "String",
        "cosine_CoreAttributeRel.Precision": 64,
        "cosine_CoreAttributeRel.CoreComponentRel.Code": "cosine_BDUISummaryTab"
    },
    {
        "ColumnIndex": 13,
        "Id": "97fd16b9-9412-4af9-adba-b6b105868c54",
        "CorePersona": "AKIL_DEV",
        "StateData": "",
        "ArchetypeCode": "cosine_CoreComponentDetailRuntime",
        "cosine_CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreComponentDetailRuntimeID": "a5d12301-355b-4f1e-a866-37fb25d7c645",
        "cosine_CoreAttributeRel.AttributeName": "PART_TK_SUMMARY",
        "cosine_CoreAttributeRel.CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreAttributeRel.DataType": "String",
        "cosine_CoreAttributeRel.Precision": 64,
        "cosine_CoreAttributeRel.CoreComponentRel.Code": "cosine_BDUISummaryTab"
    },
    {
        "ColumnIndex": 17,
        "Id": "7900a1d1-8093-40ce-a89a-a5e1dd7e8f30",
        "CorePersona": "AKIL_DEV",
        "StateData": "",
        "VerticalIndex": 1,
        "ArchetypeCode": "cosine_CoreComponentDetailRuntime",
        "cosine_CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreComponentDetailRuntimeID": "1130b32d-16a7-47df-a8cc-00411387933c",
        "cosine_CoreAttributeRel.AttributeName": "PART_COST_TYPE_SUMMARY",
        "cosine_CoreAttributeRel.CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreAttributeRel.DataType": "String",
        "cosine_CoreAttributeRel.Precision": 64,
        "cosine_CoreAttributeRel.CoreComponentRel.Code": "cosine_BDUISummaryTab"
    },
    {
        "ColumnIndex": 17,
        "Id": "0918cf8a-8232-4131-a8d2-5849478969d1",
        "CorePersona": "AKIL_DEV",
        "StateData": "",
        "VerticalIndex": 2,
        "ArchetypeCode": "cosine_CoreComponentDetailRuntime",
        "cosine_CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreComponentDetailRuntimeID": "64c205f2-eb4d-43ce-95dc-b73659533286",
        "cosine_CoreAttributeRel.AttributeName": "PART_MATTER_FINANCIALS",
        "cosine_CoreAttributeRel.CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreAttributeRel.DataType": "String",
        "cosine_CoreAttributeRel.Precision": 64,
        "cosine_CoreAttributeRel.CoreComponentRel.Code": "cosine_BDUISummaryTab"
    },
    {
        "ColumnIndex": 17,
        "Id": "367d08c1-de9f-4426-b181-9f574628e6eb",
        "CorePersona": "AKIL_DEV",
        "StateData": "",
        "VerticalIndex": 3,
        "ArchetypeCode": "cosine_CoreComponentDetailRuntime",
        "cosine_CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreComponentDetailRuntimeID": "a56bdcc8-4013-4138-921f-aa6eef09e302",
        "cosine_CoreAttributeRel.AttributeName": "PART_CLIENT_FINANCIALS",
        "cosine_CoreAttributeRel.CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreAttributeRel.DataType": "String",
        "cosine_CoreAttributeRel.Precision": 64,
        "cosine_CoreAttributeRel.CoreComponentRel.Code": "cosine_BDUISummaryTab"
    },
    {
        "ColumnIndex": 21,
        "Id": "79088636-aca8-487c-8384-efef3a6b10d6",
        "CorePersona": "AKIL_DEV",
        "StateData": "",
        "ArchetypeCode": "cosine_CoreComponentDetailRuntime",
        "cosine_CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreComponentDetailRuntimeID": "a1fb29bd-f76f-4fca-9d1f-39094f4c74b5",
        "cosine_CoreAttributeRel.AttributeName": "PART_APPROVAL",
        "cosine_CoreAttributeRel.CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreAttributeRel.DataType": "String",
        "cosine_CoreAttributeRel.Precision": 64,
        "cosine_CoreAttributeRel.CoreComponentRel.Code": "cosine_BDUISummaryTab"
    },
    {
        "ColumnIndex": 25,
        "Id": "f94bf0a9-6a92-4983-b322-2520459b5227",
        "CorePersona": "AKIL_DEV",
        "StateData": "",
        "ArchetypeCode": "cosine_CoreComponentDetailRuntime",
        "cosine_CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreComponentDetailRuntimeID": "dd4a07a0-e464-4824-ba15-38a71ec72bca",
        "cosine_CoreAttributeRel.AttributeName": "PART_WORKFLOW_HISTORY_REPORT",
        "cosine_CoreAttributeRel.CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreAttributeRel.DataType": "String",
        "cosine_CoreAttributeRel.Precision": 64,
        "cosine_CoreAttributeRel.CoreComponentRel.Code": "cosine_BDUISummaryTab"
    },
    {
        "ColumnIndex": 26,
        "Id": "b9e1531b-94cd-43d7-8678-936d30260f12",
        "CorePersona": "AKIL_DEV",
        "StateData": "",
        "ArchetypeCode": "cosine_CoreComponentDetailRuntime",
        "cosine_CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreComponentDetailRuntimeID": "322179d6-3048-4cf1-998c-0f89418eda39",
        "cosine_CoreAttributeRel.AttributeName": "PART_BILLING_SETUPS",
        "cosine_CoreAttributeRel.CoreComponent": "cosine_BDUISummaryTab",
        "cosine_CoreAttributeRel.DataType": "String",
        "cosine_CoreAttributeRel.Precision": 64,
        "cosine_CoreAttributeRel.CoreComponentRel.Code": "cosine_BDUISummaryTab"
    }
]