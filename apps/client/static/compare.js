var graphCount = 0;

function checkCookie(name='UserIDAI') {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (!match) {
        window.location.href = "/login";
    }
}

window.onpaint = checkCookie();

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems);
  });

function logout() {
    document.cookie = "UserIDAI=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = "/login"
}

function getETFS() {
    var userID = getUserID()

    const details =
        {
            "Data": [userID]
        }


    fetch("http://ec2-54-82-241-49.compute-1.amazonaws.com:6969/getETFS",
        {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json'
            },
            // Strigify the payload into JSON:
            body: JSON.stringify(details)
        }
    ).then(response => response.json())
        .then(data => {

            // const mainCompare = document.getElementById('main-compare');
            // mainCompare.classList.add('show');
            const jd = JSON.parse(data)
            if (jd.status == "failure") {

                //document.getElementById("etfbody").innerHTML = jd.error
            } else {
                let numofetfs = jd.Data.length;

                for (var i = 0; i < numofetfs; i++) {
                    document.getElementById("etf1").innerHTML +=
                        "<option value=" + "'" + JSON.stringify(jd.Data[i]) + "'" + ">" + jd.Data[i].ETFName + "</option>"
                    // console.log(test)

                    document.getElementById("etf2").innerHTML +=
                        "<option value=" + "'" + JSON.stringify(jd.Data[i]) + "'" + ">" + jd.Data[i].ETFName + "</option>"
                }

            }


        });
}

function getUserID() {
    let id = "UserIDAI=";
    let decCookie = decodeURIComponent(document.cookie);
    let cookievalue = decCookie.split(';');
    for (let i = 0; i < cookievalue.length; i++) {
        let cookie = cookievalue[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(id) == 0) {
            return cookie.substring(id.length, cookie.length);
        }
    }
    return "";
}

async function confirm(chartnum1, chartnum2) {

    document.getElementById("notes" + chartnum1).innerHTML = '';
    document.getElementById("notes" + chartnum2).innerHTML = '';

    info1 = JSON.parse(document.getElementById("etf" + chartnum1).value)
    info2 = JSON.parse(document.getElementById("etf" + chartnum2).value)

    date = document.getElementById("selectdate").value;



    if (date == '') {
        date = "2022-01-01"
    }
    //document.getElementById("notes" + chartnum).innerHTML = "LOADING... <br>"
    getGraph(info1.ETFName, getUserID(), info1.ETFID, info1.Rules, info1.Amount, date, chartnum1, info2.ETFName, info2.ETFID, info2.Rules, info2.Amount, chartnum2)


}

function getGraph(name1, uID, etfid1, rules1, amount1, date, chartnum1, name2, etfid2, rules2, amount2, chartnum2) {

    // document.getElementById("notes" + chartnum).innerHTML = name + " Loading<br>"

    var xA = [];
    var yA = [];

    var xxA = [];
    var yyA = [];

    const details2 =
        {
            "ETF 1":{
                "UserID": uID,
                "ETFid": etfid1,
                "Rules": rules1,
            },
            "ETF 2":{
                "UserID": uID,
                "ETFid": etfid2,
                "Rules": rules2,
            },
            "date": date,
            "amount": amount1

        }


    // ec2-54-82-241-49.compute-1.amazonaws.com:6969
    fetch("http://ec2-54-82-241-49.compute-1.amazonaws.com:6969/compare",
        {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json'
            },
            // Strigify the payload into JSON:
            body: JSON.stringify(details2)
        }
    ).then(response => response.json())
        .then(data => {




            var prevy = 0
            for (key in data['ETF 1'].Values) {
                if (data['ETF 1'].Values[key] > prevy / 1.5) {
                    xA.push(key)
                    yA.push(data['ETF 1'].Values[key])
                    prevy = data['ETF 1'].Values[key]
                }

            }

            var prevvy = 0
            for (key in data['ETF 2'].Values) {
                if (data['ETF 2'].Values[key] > prevvy / 1.5) {
                    xxA.push(key)
                    yyA.push(data['ETF 2'].Values[key])
                    prevvy = data['ETF 2'].Values[key]
                }

            }


            var data2 = {
                x: xA,
                y: yA,
                mode: "lines",
                name: name1,
            };

            var data3 = {
                x: xxA,
                y: yyA,
                mode: "lines",
                name: name2,
            };

            var finalData = [data2, data3];

            var layout =
                {
                    xaxis: {title: "Date"},
                    yaxis: {title: "Price in Dollars [$]"},
                    title: `${name1} and ${name2}`
                };

            Plotly.newPlot("chart" + String(chartnum1), finalData, layout);
            graphCount++;

            if (graphCount == 1) {
                const loaderDiv = document.getElementById('loader-compare');
                loaderDiv.classList.remove('show');

                const showTbl1 = document.getElementById('tblnotes1');
                showTbl1.classList.add('tblComp');

                const showTbl2 = document.getElementById('tblnotes2');
                showTbl2.classList.add('tblComp');
            }


            var i = 1;
            for (key in data['ETF 1'].Stocks) {
                var stockArr = data['ETF 1'].Stocks[key];
                // console.log("SArr: ", stockArr);
                var stocks = "";
                var test = "";
                var arr = new Array();
                for (const x in data['ETF 1'].Stocks) {
                    arr = data['ETF 1'].Stocks[x];
                    // for (const key in arr) {
                    // console.log(`${key}: ${arr[key]}`);
                    // console.log("x: ",x,"arr:",arr,"data:",data);

                    // document.getElementById(x).innerHTML += `<tr><td>${x}</td><td>${arr[x]}</td></tr> `;
                    // }
                }
                document.getElementById("notes" + chartnum1).innerHTML += `<li><div class="collapsible-header"><i class="material-icons">date_range</i>${name1} - Cash Overflow on ${key}: $${(data['ETF 1'].CashOverFlow[key]).toFixed(2)}</div><div class="collapsible-body"><table class="striped"><thead><tr><th>Ticker</th><th>Amount</th></tr></thead><tbody id="${key+data['ETF 1'].CashOverFlow[key]}"></tbody></table></div></li>`;
                for (const works in stockArr){
                    document.getElementById(key+data['ETF 1'].CashOverFlow[key]).innerHTML += `<tr><td>${works}</td><td>${stockArr[works]}</td></tr> `;
                }

                if (i % 5 == 0) {
                    // document.getElementById("notes" + chartnum).innerHTML += '<br>'
                    i = 1;
                } else {
                    i++
                }



            }

               for (key in data['ETF 2'].Stocks) {
                var stockArr2 = data['ETF 2'].Stocks[key];
                // console.log("SArr: ", stockArr);
                var stocks = "";
                var test = "";
                var arr = new Array();
                for (const x in data['ETF 2'].Stocks) {
                    arr = data['ETF 2'].Stocks[x];
                    // for (const key in arr) {
                    // console.log(`${key}: ${arr[key]}`);
                    // console.log("x: ",x,"arr:",arr,"data:",data);

                    // document.getElementById(x).innerHTML += `<tr><td>${x}</td><td>${arr[x]}</td></tr> `;
                    // }
                }
                document.getElementById("notes" + chartnum2).innerHTML += `<li><div class="collapsible-header"><i class="material-icons">date_range</i>${name2} - Cash Overflow on ${key}: $${(data['ETF 2'].CashOverFlow[key]).toFixed(2)}</div><div class="collapsible-body"><table class="striped"><thead><tr><th>Ticker</th><th>Amount</th></tr></thead><tbody id="${key+data['ETF 2'].CashOverFlow[key]}"></tbody></table></div></li>`;
                for (const works in stockArr2){
                    document.getElementById(key+data['ETF 2'].CashOverFlow[key]).innerHTML += `<tr><td>${works}</td><td>${stockArr2[works]}</td></tr> `;
                }

                if (i % 5 == 0) {
                    // document.getElementById("notes" + chartnum).innerHTML += '<br>'
                    i = 1;
                } else {
                    i++
                }



            }
            // document.getElementById("notes" + chartnum).innerHTML = ""
        }).catch((error) => {

        document.getElementById("notes" + chartnum1).innerHTML = name + " could not generate ETF<br>"
        // alert( "ETF " + name + " does not generate any stocks!")
    });


}

function changedate() {
    graphCount = 0;
    const loaderDiv = document.getElementById('loader-compare');
    loaderDiv.classList.add('show');
    // const graphDiv = document.getElementById('graph-table');
    // graphDiv.classList.add('show');

    confirm(1, 2);
}
