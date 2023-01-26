const convert = require("xml-js");
const jsdom = require("jsdom");
const request = require("request");
const est = require("./modules/est");
const express = require("express");

const app = express();

app.use(express.json());

app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

function filterByKeyword(items, keyword) {
  const lowered = keyword.toLowerCase().trim();
  return items.filter(({ title }) => title.toLowerCase().includes(lowered));
}

app.get("/hello", (req, res, next) => {
  res.send("<h1>Hello Express</h1>");
  next();
});

app.get("/getAptInfo", async (req, res) => {
  const { pageNo, numOfRows, lawdNm, dealYmd } = req.query;

  const BASE_URL =
    "http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTradeDev";
  const serviceKey =
    "bMLBleF323YJ0M/EQmUNyyTOkTUWuXsKV8tokjsxYCTqp0q0lIm30KOjS1UA5RbeYTe1KXiucKAJHYHOt++uaQ==";
  const estItems = filterByKeyword(est, lawdNm);
  let lawdCd;
  if (estItems.length > 1) {
    const estItem = estItems.find((item) => item.title === lawdNm);
    lawdCd = estItem.code;
  } else {
    lawdCd = estItems[0].code;
  }

  const query = `?serviceKey=${encodeURIComponent(
    serviceKey,
    "utf-8"
  )}&pageNo=${pageNo}&numOfRows=${numOfRows}&LAWD_CD=${lawdCd}&DEAL_YMD=${dealYmd}`;
  console.log(`url : ${BASE_URL}${query}`);

  let returnData;
  //returnData = await fetch(`${BASE_URL}${query}`);
  await request.get(`${BASE_URL}${query}`, (error, response, body) => {
    if (error) {
      console.log(`error : ${error}`);
      res.send(undefined);
    } else {
      if (response.statusCode == 200) {
        returnData = convert.xml2json(body, { compact: true, spaces: 4 });
        res.send(JSON.parse(returnData));
      }
    }
  });
});

// app.listen(8080);
app.listen(8080, () => {
  console.log("Server is listening...");
});
