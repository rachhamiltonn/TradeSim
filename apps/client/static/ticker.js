var graphName;
var obj;

function checkCookie(name='UserIDAI') {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (!match) {
        window.location.href = "/login";
    }
}

window.onpaint = checkCookie();

function logout() {
    document.cookie = "UserIDAI=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = "/login"
}

function searchTicker() {
    const loaderDiv = document.getElementById('loader');
    loaderDiv.classList.add('show');
    var tick = document.getElementById('tickerInput').value;
    tick = tick.toUpperCase();

    //getCompanyInformation(tick)
    const details =
        {
            "ticker": tick
        }
    fetch("http://ec2-54-82-241-49.compute-1.amazonaws.com:6969/tickerInfo",
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

            graphName = data['Company Name']

            obj = data.PriceHistory;

            const loaderDiv = document.getElementById('loader');
            loaderDiv.classList.remove('show');
            var showTable = document.getElementById("results");
            if (!showTable.classList.contains('show')){
                showTable.classList.add('show');
            }
            if (data.Ticker != null) {
                document.getElementById("card-title").innerHTML = `<div class="row"><div class="col-8">${data.Ticker}:${data['Company Name']}</div><div class="col-4"><img src=${data.Logo} height="100%" width="100%"></div></div>`;

                document.getElementById("response").innerHTML = `<table><tbody><tr><td><b>Industry: </b>${data.Industry}</td></tr><tr><td>${data.Summary}</td></tr></tbody></table>`;
                getGraph(graphName, obj);
            } else {
                document.getElementById("card-title").innerHTML = `Ticker: "${tick}" does not exist.`;
                document.getElementById("notes").innerHTML = '';
                document.getElementById("response").innerHTML = `<table><tbody><tr><td>Company with ticker name: <b>${tick}</b> not found. Did you mean: <b>${data.PossibleStock}</b>?</td></tr></tbody></table>`;
            }
        });
}

function getGraph(name, obj) {

    var xA = [];
    var yA = [];
    for (let key in obj) {
        xA.push(key)
        yA.push(obj[key])
        // console.log(key + " -> " + obj[key]);
    }
    // console.log("xA", xA)
    // console.log("yA", yA)


    var data2 = [{
        x: xA,
        y: yA,
        mode: "lines"
    }];

    var layout =
        {
            xaxis: {title: "date"},
            yaxis: {title: "price in dollars"},
            title: name
        };

    Plotly.newPlot("notes", data2, layout);

}
