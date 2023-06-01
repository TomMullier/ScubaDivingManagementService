const locationForm = document.getElementById('location_form');
const listLocation = document.getElementById('list_locations');

const locationFormNodes = {
      Site_Name: locationForm.querySelector('input[name="Site_Name"]'),
      Gps_Latitude: locationForm.querySelector('input[name="Gps_Latitude"]'),
      Gps_Longitude: locationForm.querySelector('input[name="Gps_Longitude"]'),
      Track_Type: locationForm.querySelector('input[name="Track_Type"]'),
      Track_Number: locationForm.querySelector('input[name="Track_Number"]'),
      Track_Name: locationForm.querySelector('input[name="Track_Name"]'),
      Zip_Code: locationForm.querySelector('input[name="Zip_Code"]'),
      City_Name: locationForm.querySelector('input[name="City_Name"]'),
      Country_Name: locationForm.querySelector('input[name="Country_Name"]'),
      Additional_Address: locationForm.querySelector('input[name="Additional_Address"]'),
      Tel_Number: locationForm.querySelector('input[name="Tel_Number"]'),
      Information_URL: locationForm.querySelector('input[name="Information_URL"]'),
};


/* ------------------------------- CREATE SITE ------------------------------ */
document.getElementById("btn-submit").addEventListener('click', (e) => {
      e.preventDefault();
      const data = {
            Site_Name: locationFormNodes.Site_Name.value,
            Gps_Latitude: locationFormNodes.Gps_Latitude.value,
            Gps_Longitude: locationFormNodes.Gps_Longitude.value,
            Track_Type: locationFormNodes.Track_Type.value,
            Track_Number: locationFormNodes.Track_Number.value,
            Track_Name: locationFormNodes.Track_Name.value,
            Zip_Code: locationFormNodes.Zip_Code.value,
            City_Name: locationFormNodes.City_Name.value,
            Country_Name: locationFormNodes.Country_Name.value,
            Additional_Address: locationFormNodes.Additional_Address.value,
            Tel_Number: locationFormNodes.Tel_Number.value,
            Information_URL: locationFormNodes.Information_URL.value
      };
      fetch('/auth/club/locations', {
            method: 'POST',
            headers: {
                  'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
      }).then((res) => res.json())
            .then((res) => {
                  console.log(res);
            });
});


/* ------------------------------ GET SITE LIST ----------------------------- */
fetch('/auth/club/get_locations', {
      method: 'GET',
      headers: {
            'Content-Type': 'application/json'
      },
}).then(res => res.json())
      .then(sites => {
            console.log(sites);
            sites.forEach(site => {
                  let li = document.createElement("li");
                  let p = document.createElement("p");
                  let p_name = document.createElement("p");
                  p.innerText = site.Gps_Latitude + "\t" + site.Gps_Longitude + "\t" + site.Tel_Number + "\t";
                  p_name.innerText = site.Site_Name;
                  p_name.className = "name";
                  let buttonModif = document.createElement("button");
                  let buttonDelete = document.createElement("button");
                  buttonModif.innerText = "Modifier";
                  buttonModif.className = "btnModif";
                  buttonDelete.innerText = "Supprimer";
                  buttonDelete.className = "btnDelete";
                  li.appendChild(p_name);
                  li.appendChild(p);
                  li.appendChild(buttonModif);
                  li.appendChild(buttonDelete);
                  listLocation.appendChild(li);
            });

            let btnDelete = document.querySelectorAll(".btnDelete");
            let btnModif = document.querySelectorAll(".btnModif");

            btnModif.forEach(btn => {
                  btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        getLocationInfo(e.target.parentElement.querySelector(".name").innerText);
                  })
            })

            btnDelete.forEach(btn => {
                  btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        deleteLocation(e.target.parentElement.querySelector(".name").innerText);
                  })
            })
      })


/* ---------------------------- GET LOCATION INFO --------------------------- */
function getLocationInfo(target) {
      console.log(target);

      fetch('/auth/club/get_location_info', {
            method: 'POST',
            headers: {
                  'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Site_Name: target })
      }).then(res => res.json())
            .then(res => {
                  console.log(res)

                  let data = res;
                  data.Tel_Number = "0987654321";

                  modifyLocation(data)
            })
}


/* -------------------------- MODIFY LCOATION INFO -------------------------- */
function modifyLocation(data) {
      fetch('/auth/club/locations', {
            method: 'PUT',
            headers: {
                  'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
      }).then(res => res.json())
            .then(res => console.log(res))
}

/* ----------------------------- DELETE LOCATION ---------------------------- */
function deleteLocation(target) {
      console.log(target);
      fetch('/auth/club/locations', {
            method: 'DELETE',
            headers: {
                  'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Site_Name : target })
      }).then((res) => res.json())
            .then((res) => {
                  console.log(res);
            });
}