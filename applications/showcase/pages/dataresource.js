// @flow
import * as React from "react";

import DataResourceTransform from "@nteract/transform-dataresource";

const props = {
  height: 400,
  metadata: {
    sampled: true
  },
  data: {
    schema: {
      fields: [
        {
          name: "stint",
          type: "integer"
        },
        {
          name: "team",
          type: "string"
        },
        {
          name: "lg",
          type: "string"
        },
        {
          name: "g",
          type: "integer"
        },
        {
          name: "ab",
          type: "integer"
        },
        {
          name: "r",
          type: "integer"
        },
        {
          name: "h",
          type: "integer"
        },
        {
          name: "X2b",
          type: "integer"
        },
        {
          name: "X3b",
          type: "integer"
        },
        {
          name: "hr",
          type: "integer"
        },
        {
          name: "rbi",
          type: "number"
        },
        {
          name: "sb",
          type: "number"
        },
        {
          name: "cs",
          type: "number"
        },
        {
          name: "bb",
          type: "integer"
        },
        {
          name: "so",
          type: "number"
        },
        {
          name: "ibb",
          type: "number"
        },
        {
          name: "hbp",
          type: "number"
        },
        {
          name: "sh",
          type: "number"
        },
        {
          name: "sf",
          type: "number"
        },
        {
          name: "gidp",
          type: "number"
        }
      ],
      primaryKey: ["id", "player"],
      pandas_version: "0.20.0"
    },
    data: [
      {
        stint: 2,
        team: "CHN",
        lg: "NL",
        g: 19,
        ab: 50,
        r: 6,
        h: 14,
        X2b: 1,
        X3b: 0,
        hr: 1,
        rbi: 2,
        sb: 1,
        cs: 1,
        bb: 4,
        so: 4,
        ibb: 0,
        hbp: 0,
        sh: 3,
        sf: 0,
        gidp: 0
      },
      {
        stint: 1,
        team: "BOS",
        lg: "AL",
        g: 31,
        ab: 2,
        r: 0,
        h: 1,
        X2b: 0,
        X3b: 0,
        hr: 0,
        rbi: 0,
        sb: 0,
        cs: 0,
        bb: 0,
        so: 1,
        ibb: 0,
        hbp: 0,
        sh: 0,
        sf: 0,
        gidp: 0
      },
      {
        stint: 1,
        team: "NYA",
        lg: "AL",
        g: 62,
        ab: 0,
        r: 0,
        h: 0,
        X2b: 0,
        X3b: 0,
        hr: 0,
        rbi: 0,
        sb: 0,
        cs: 0,
        bb: 0,
        so: 0,
        ibb: 0,
        hbp: 0,
        sh: 0,
        sf: 0,
        gidp: 0
      },
      {
        stint: 1,
        team: "MIL",
        lg: "NL",
        g: 20,
        ab: 3,
        r: 0,
        h: 0,
        X2b: 0,
        X3b: 0,
        hr: 0,
        rbi: 0,
        sb: 0,
        cs: 0,
        bb: 0,
        so: 2,
        ibb: 0,
        hbp: 0,
        sh: 0,
        sf: 0,
        gidp: 0
      },
      {
        stint: 1,
        team: "NYA",
        lg: "AL",
        g: 33,
        ab: 6,
        r: 0,
        h: 1,
        X2b: 0,
        X3b: 0,
        hr: 0,
        rbi: 0,
        sb: 0,
        cs: 0,
        bb: 0,
        so: 4,
        ibb: 0,
        hbp: 0,
        sh: 0,
        sf: 0,
        gidp: 0
      },
      {
        stint: 1,
        team: "SFN",
        lg: "NL",
        g: 139,
        ab: 426,
        r: 66,
        h: 105,
        X2b: 21,
        X3b: 12,
        hr: 6,
        rbi: 40,
        sb: 7,
        cs: 0,
        bb: 46,
        so: 55,
        ibb: 2,
        hbp: 2,
        sh: 3,
        sf: 4,
        gidp: 6
      },
      {
        stint: 1,
        team: "ARI",
        lg: "NL",
        g: 153,
        ab: 586,
        r: 93,
        h: 159,
        X2b: 52,
        X3b: 2,
        hr: 15,
        rbi: 73,
        sb: 0,
        cs: 1,
        bb: 69,
        so: 58,
        ibb: 10,
        hbp: 7,
        sh: 0,
        sf: 6,
        gidp: 14
      },
      {
        stint: 1,
        team: "LAN",
        lg: "NL",
        g: 28,
        ab: 26,
        r: 2,
        h: 5,
        X2b: 1,
        X3b: 0,
        hr: 0,
        rbi: 0,
        sb: 0,
        cs: 0,
        bb: 1,
        so: 7,
        ibb: 0,
        hbp: 0,
        sh: 6,
        sf: 0,
        gidp: 1
      },
      {
        stint: 2,
        team: "ATL",
        lg: "NL",
        g: 15,
        ab: 40,
        r: 1,
        h: 10,
        X2b: 3,
        X3b: 0,
        hr: 0,
        rbi: 8,
        sb: 0,
        cs: 0,
        bb: 4,
        so: 10,
        ibb: 1,
        hbp: 0,
        sh: 0,
        sf: 1,
        gidp: 1
      },
      {
        stint: 1,
        team: "NYN",
        lg: "NL",
        g: 40,
        ab: 50,
        r: 7,
        h: 10,
        X2b: 0,
        X3b: 0,
        hr: 1,
        rbi: 8,
        sb: 2,
        cs: 1,
        bb: 10,
        so: 13,
        ibb: 0,
        hbp: 0,
        sh: 0,
        sf: 1,
        gidp: 1
      },
      {
        stint: 1,
        team: "TOR",
        lg: "AL",
        g: 110,
        ab: 331,
        r: 43,
        h: 80,
        X2b: 24,
        X3b: 1,
        hr: 10,
        rbi: 52,
        sb: 0,
        cs: 0,
        bb: 51,
        so: 55,
        ibb: 8,
        hbp: 2,
        sh: 1,
        sf: 6,
        gidp: 9
      },
      {
        stint: 1,
        team: "TBA",
        lg: "AL",
        g: 3,
        ab: 0,
        r: 0,
        h: 0,
        X2b: 0,
        X3b: 0,
        hr: 0,
        rbi: 0,
        sb: 0,
        cs: 0,
        bb: 0,
        so: 0,
        ibb: 0,
        hbp: 0,
        sh: 0,
        sf: 0,
        gidp: 0
      },
      {
        stint: 1,
        team: "HOU",
        lg: "NL",
        g: 33,
        ab: 59,
        r: 3,
        h: 6,
        X2b: 0,
        X3b: 0,
        hr: 1,
        rbi: 2,
        sb: 0,
        cs: 0,
        bb: 0,
        so: 25,
        ibb: 0,
        hbp: 0,
        sh: 5,
        sf: 0,
        gidp: 1
      },
      {
        stint: 2,
        team: "ARI",
        lg: "NL",
        g: 8,
        ab: 0,
        r: 0,
        h: 0,
        X2b: 0,
        X3b: 0,
        hr: 0,
        rbi: 0,
        sb: 0,
        cs: 0,
        bb: 0,
        so: 0,
        ibb: 0,
        hbp: 0,
        sh: 0,
        sf: 0,
        gidp: 0
      }
    ]
  }
};

const DataresourcePage = () => {
  return <DataResourceTransform {...props} />;
};

export default DataresourcePage;
