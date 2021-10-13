var div;

const limitPerPage = 1000;
const apiUrl = "https://backend-farm.plantvsundead.com/get-plants-filter-v2";

const getPlants = async function (token, offset = 0) {
  var elements = [];
  var checked = document.getElementById("elements").getElementsByTagName("input");

  for (const i in checked) {
      const element = checked[i];
      
      if (element.checked) {
        elements.push(element.value)
      }
  }

  let actualUrl = apiUrl + `?elements=${elements.join(',')}&offset=${offset}&limit=${limitPerPage}`;
  var apiResults = await fetch(actualUrl, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }}).then((resp) => {
    return resp.json();
  }).catch((error) => {
    div.innerHTML = "";
    console.error('Error:', error);
  });

  return apiResults;
};

const getEntireUserList = async function (offset = 0) {
  const results = await getPlants(document.getElementById("token").value, offset);
  if (results.data.length) {
    return results.data.concat(await getEntireUserList(offset + 5000));
  } else {
    return results.data;
  }
};

async function findPlant() {
  div = document.getElementById("data");
  div.innerHTML = "Buscando...";
  const entireList = await getEntireUserList();
  draw(filterResults(entireList));
}

function filterResults(data) {
  const pvu = document.getElementById("pvu").value;
  const le = document.getElementById("le").value;

  const result = data.filter((element) => {
    if (element["config"] ? element["config"].farm.le / element["config"].farm.hours >= le && element["startingPrice"] <= pvu : false) {
      return true;
    }
    return false;
  });
  result.sort((a, b) =>
    a["config"].farm.le / a["config"].farm.hours < b["config"].farm.le / b["config"].farm.hours ? 1 : b["config"].farm.le / b["config"].farm.hours < a["config"].farm.le / a["config"].farm.hours ? -1 : 0
  );

  return result;
}

function draw(data) {
  div.innerHTML = "";
  if (data && data.length > 0) {
  data.forEach(function (element) {
    div.innerHTML += addPlant(element);
  });  
  } else {
    div.innerHTML += "No se encontraron resultados";
  }
}

function addPlant(element) {
  return (
    '<div class="card text-white bg-dark m-1 col-6 col-sm-6 col-md-4 col-lg-4 col-xl-3 col-xxl-2">' +
      '<div class="card-body" id="' + element["id"] + '">' +
        '<div class="justify-content-center">' +
          '<a href="https://marketplace.plantvsundead.com/login#/plant/' + element["id"] + '" target="_blank">' +
            '<div class="row">' +
              '<div class="col-4 text-start">' +
                '<div class="col-auto me-auto form-label">' + element["id"] + "</div>" +
              "</div>" +
              '<div class="col-8 text-end">' +
                '<div class="col-auto me-auto form-label">LE: ' + element["config"].farm.le + "/" + element["config"].farm.hours + " Hour " + (element["config"].farm.le / element["config"].farm.hours).toFixed(2) + "/h</div>" +
              "</div>" +
            "</div>" +
            '<div class="row">' +
              '<div class="col-4 text-start">' +
                '<div class="col-auto me-auto form-label">' + element["config"].stats.type + "</div>" +
              "</div>" +
              '<div class="col-8 text-end">' +
                '<img class="col-auto text-start" src="https://marketplace.plantvsundead.com/_nuxt/img/pvu.961d439.svg" alt="" />' + element["startingPrice"] +
              "</div>" +
            "</div>" +
            '<div class="row justify-content-center">' +
              '<img class="col-auto" src=' + element["iconUrl"] + ' alt="" />' +
            "</div>" +
          "</a>" +
        "</div>" +
      "</div>" +
    "</div>"
  );
}
