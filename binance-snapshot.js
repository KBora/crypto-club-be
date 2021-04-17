const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;
const crypto = require('crypto');
const helmet = require('helmet')

require('dotenv').config()
app.use(helmet())


app.get('/binance-snapshot', async (req, res) => {
  const responseData = await getUSD();
  res.send( responseData);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

async function getUSD() {
  var params = new URLSearchParams({
    type: "SPOT",
    limit: "1",
    timestamp: Date.now().toString()
  });
  const signature = getSignature(params.toString());
  params.append("signature", signature);

  try {
    const response = await fetch(
      `${process.env.BI_SNAPSHOT_URL}?${params}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-MBX-APIKEY": process.env.BI_API_KEY
        }
      }
    );
    console.log(" response raw: ", response);

    const data = await response.json();
    console.log("data: ", data);
    // API returns minimum 5 days figures
    const totalAssetOfBtc = data.snapshotVos[4].data.totalAssetOfBtc;
    console.log("totalAssetOfBtcx: ", "BtC" + totalAssetOfBtc);
    return totalAssetOfBtc;

  } catch (error) {
    console.log(error);
  }
}

function getSignature(query) {
  const hash = crypto.createHmac("sha256", process.env.BI_API_SECRET)
                .update(query)
                .digest("hex");
  console.log('hash is:', hash);
  return hash;
}
